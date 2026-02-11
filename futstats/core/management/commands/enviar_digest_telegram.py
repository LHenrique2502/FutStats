from __future__ import annotations

import asyncio
import os
import html
from datetime import datetime, time, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from dotenv import load_dotenv
from telegram import Bot

from core.models import BetRecommendation


BET_LABEL = {
    "over_25": "Over 2.5",
    "under_25": "Under 2.5",
    "btts_yes": "BTTS (Sim)",
    "btts_no": "BTTS (Não)",
    "home_win": "Casa (1)",
    "draw": "Empate (X)",
    "away_win": "Fora (2)",
}


def _today_range_tz():
    today = timezone.localdate()
    start = timezone.make_aware(datetime.combine(today, time.min))
    end = start + timedelta(days=1)
    return start, end, today


def _fmt_pct(x):
    try:
        return f"{float(x):.2f}%"
    except Exception:
        return "--"


class Command(BaseCommand):
    help = "Envia um digest diário (top value bets) para Telegram."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=10, help="Quantidade de itens no digest.")
        parser.add_argument(
            "--days-ahead",
            type=int,
            default=1,
            help="Janela de dias a partir de hoje (padrão: 1 = hoje).",
        )
        parser.add_argument(
            "--mode",
            type=str,
            default="window",
            choices=["window", "latest"],
            help="window: filtra por data do jogo; latest: pega as últimas recomendações (útil para teste).",
        )
        parser.add_argument(
            "--token",
            type=str,
            default="",
            help="Token do bot (opcional; se vazio, usa TELEGRAM_BOT_TOKEN).",
        )
        parser.add_argument(
            "--chat-id",
            type=str,
            default="",
            help="Chat ID(s) separados por vírgula (opcional; se vazio, usa TELEGRAM_CHAT_ID ou TELEGRAM_CHANNEL_ID).",
        )
        parser.add_argument(
            "--site-url",
            type=str,
            default=os.environ.get("SITE_URL") or os.environ.get("VITE_SITE_URL") or "",
            help="URL pública do site (ex.: https://seu-dominio.com).",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Não envia; apenas imprime a mensagem no console.",
        )

    def handle(self, *args, **opts):
        # Carrega variáveis de ambiente a partir de `.env` (se existir).
        load_dotenv()

        dry_run = bool(opts.get("dry_run"))

        token = (opts.get("token") or "").strip() or os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
        chat_ids_raw = (opts.get("chat_id") or "").strip() or os.environ.get("TELEGRAM_CHAT_ID", "").strip() or os.environ.get("TELEGRAM_CHANNEL_ID", "").strip()

        limit = max(1, min(int(opts.get("limit", 10)), 30))
        days_ahead = int(opts.get("days_ahead", 1) or 1)
        days_ahead = max(1, min(days_ahead, 7))
        mode = str(opts.get("mode") or "window").strip().lower()
        site_url = (opts.get("site_url") or "").strip().rstrip("/")

        start, _, today = _today_range_tz()
        end = start + timedelta(days=days_ahead)

        qs = BetRecommendation.objects.filter(is_value_bet=True).select_related(
            "match__home_team", "match__away_team", "match__league", "bookmaker"
        )
        if mode == "window":
            qs = qs.filter(match__date__gte=start, match__date__lt=end).order_by("-expected_value")
        else:
            qs = qs.order_by("-created_at")

        recs = qs[:limit]

        if not recs:
            # Evitar emojis aqui: no Windows (cp1252) pode causar UnicodeEncodeError no terminal.
            self.stdout.write(self.style.WARNING("Nenhuma value bet encontrada para o filtro atual."))
            return

        campaign = f"digest_{today.isoformat()}"
        header_range = (
            today.strftime("%d/%m")
            if days_ahead == 1
            else f"{today.strftime('%d/%m')} +{days_ahead - 1}d"
        )
        if mode == "window":
            header = f"<b>FutStats — Value Bets ({header_range})</b>\n"
        else:
            header = "<b>FutStats — Value Bets (últimas recomendações)</b>\n"
        header += "Top oportunidades por EV (informativo — apostas envolvem risco).\n\n"

        lines = [header]
        for i, r in enumerate(recs, 1):
            m = r.match
            home = getattr(getattr(m, "home_team", None), "name", "") or "Casa"
            away = getattr(getattr(m, "away_team", None), "name", "") or "Fora"
            league = getattr(getattr(m, "league", None), "name", "") or ""
            bet_label = BET_LABEL.get(r.bet_type, r.bet_type)
            bookmaker = r.bookmaker.name if r.bookmaker else "—"
            odd = f"{float(r.odd_value):.2f}" if r.odd_value is not None else "--"

            url = ""
            if site_url:
                url = (
                    f"{site_url}/match/{m.id}"
                    f"?utm_source=telegram&utm_medium=bot&utm_campaign={campaign}"
                )

            title = f"{i}) {home} x {away}"
            if league:
                title += f" <i>({html.escape(league)})</i>"

            lines.append(f"<b>{html.escape(title)}</b>")
            lines.append(
                f"{html.escape(bet_label)} @ <b>{odd}</b> • {html.escape(bookmaker)}"
            )
            lines.append(
                f"Prob: {_fmt_pct(r.calculated_probability)} • Implícita: {_fmt_pct(r.implied_probability)} • EV: {_fmt_pct(r.expected_value)}"
            )
            if url:
                lines.append(f"<a href=\"{html.escape(url)}\">Abrir no FutStats</a>")
            lines.append("")  # linha em branco

        message = "\n".join(lines).strip()

        if dry_run:
            self.stdout.write(message)
            return

        if not token:
            self.stderr.write(self.style.ERROR("TELEGRAM_BOT_TOKEN não definido (ou --token vazio)."))
            return
        if not chat_ids_raw:
            self.stderr.write(
                self.style.ERROR(
                    "TELEGRAM_CHAT_ID/TELEGRAM_CHANNEL_ID não definido (ou --chat-id vazio)."
                )
            )
            return

        chat_ids = [c.strip() for c in chat_ids_raw.split(",") if c.strip()]
        if not chat_ids:
            self.stderr.write(self.style.ERROR("Chat ID inválido."))
            return

        async def _send_all():
            sent = 0
            async with Bot(token=token) as bot:
                for chat_id in chat_ids:
                    await bot.send_message(
                        chat_id=chat_id,
                        text=message,
                        parse_mode="HTML",
                        disable_web_page_preview=True,
                    )
                    sent += 1
            return sent

        try:
            sent = asyncio.run(_send_all())
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Falha ao enviar digest no Telegram: {e}"))
            return

        self.stdout.write(self.style.SUCCESS(f"Digest enviado para {sent} chat(s)."))

