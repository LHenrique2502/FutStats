from __future__ import annotations

import json
from datetime import datetime, time, timedelta
from pathlib import Path

from django.core.management.base import BaseCommand
from django.utils import timezone
from rest_framework.test import APIRequestFactory

from core.models import Match
from core import views


class Command(BaseCommand):
    help = (
        "Exporta snapshots públicos (JSON) para o frontend (sem depender do backend em runtime)."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--days-ahead",
            type=int,
            default=3,
            help="Janela de exportação a partir de hoje (default: 3, max: 14).",
        )
        parser.add_argument(
            "--include-per-match",
            action="store_true",
            help="Se definido, exporta arquivos por partida (summary + odds) para a janela.",
        )
        parser.add_argument(
            "--output-dir",
            type=str,
            default="",
            help="Diretório de saída (default: frontend/public/data).",
        )

    def handle(self, *args, **opts):
        days_ahead = max(1, min(int(opts.get("days_ahead") or 3), 14))
        include_per_match = bool(opts.get("include_per_match"))
        output_dir_arg = (opts.get("output_dir") or "").strip()

        # repo_root deve apontar para a raiz do repositório (pasta que contém `frontend/` e `futstats/`)
        repo_root = Path(__file__).resolve().parents[4]
        out_root = (
            Path(output_dir_arg)
            if output_dir_arg
            else (repo_root / "frontend" / "public" / "data")
        )
        out_root.mkdir(parents=True, exist_ok=True)

        factory = APIRequestFactory()

        def write_json(rel_path: str, payload):
            p = out_root / rel_path
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(
                json.dumps(payload, ensure_ascii=False, separators=(",", ":"), sort_keys=True),
                encoding="utf-8",
            )

        # 1) Partidas de hoje (cards e listagens)
        resp_matches_today = views.matches_today(factory.get("/api/matches/today/"))
        write_json("matches/today.json", resp_matches_today.data)

        # 2) Probabilidades de hoje (ValueBets page)
        resp_probs_today = views.probabilities_today(factory.get("/api/probabilities/today/"))
        write_json("probabilities/today.json", resp_probs_today.data)

        # 3) Odds window (para filtrar no frontend por liga/mercado/data)
        resp_odds_window = views.odds_today(
            factory.get(f"/api/odds/today/?days_ahead={days_ahead}")
        )
        write_json(f"odds/window_{days_ahead}d.json", resp_odds_window.data)

        # 4) Value bets window (tabela)
        resp_value_bets = views.value_bets(
            factory.get(f"/api/value-bets/?limit=500&days_ahead={days_ahead}")
        )
        write_json(f"value_bets/window_{days_ahead}d.json", resp_value_bets.data)

        # 5) Times em destaque (Home)
        resp_highlights = views.times_em_destaque(factory.get("/api/times_destaque/"))
        write_json("teams/highlights.json", resp_highlights.data)

        # 6) (Opcional) export por partida (Match page)
        if include_per_match:
            today = timezone.localdate()
            start = timezone.make_aware(datetime.combine(today, time.min))
            end = start + timedelta(days=days_ahead)
            match_ids = list(
                Match.objects.filter(date__gte=start, date__lt=end)
                .order_by("date")
                .values_list("id", flat=True)
            )

            for mid in match_ids:
                r1 = factory.get(f"/api/matches/{mid}/")
                r2 = factory.get(f"/api/matches/{mid}/odds/")

                summary_resp = views.match_summary(r1, mid)
                odds_resp = views.match_odds(r2, mid)

                # Guardar como 2 arquivos para facilitar fallback no frontend
                if getattr(summary_resp, "status_code", 200) == 200:
                    write_json(f"match/{mid}/summary.json", summary_resp.data)
                if getattr(odds_resp, "status_code", 200) == 200:
                    write_json(f"match/{mid}/odds.json", odds_resp.data)

        self.stdout.write(
            self.style.SUCCESS(
                f"Export concluído em {out_root} (days_ahead={days_ahead}, per_match={include_per_match})."
            )
        )

