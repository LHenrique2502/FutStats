from __future__ import annotations

from datetime import datetime, time, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import Match, MatchOdds, MatchAnalysis
from core.utils import (
    preload_ultimos_jogos,
    gerar_insights_rapidos,
    calcular_over25,
    calcular_btts,
    calcular_media_gols,
)


class Command(BaseCommand):
    help = "Pré-calcula e salva no banco as análises (probabilidades/insights/best odds) das partidas."

    def add_arguments(self, parser):
        parser.add_argument(
            "--days-ahead",
            type=int,
            default=1,
            help="Janela de dias a partir de hoje (default: 1 = hoje, max: 7).",
        )
        parser.add_argument(
            "--sample-limit",
            type=int,
            default=5,
            help="Quantidade de jogos no cache por time (default: 5, max: 20).",
        )
        parser.add_argument(
            "--league",
            type=str,
            default="",
            help="Filtra por nome exato da liga (opcional).",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Recalcular mesmo se já existir análise para a partida.",
        )

    def handle(self, *args, **opts):
        days_ahead = max(1, min(int(opts.get("days_ahead", 1) or 1), 7))
        sample_limit = max(1, min(int(opts.get("sample_limit", 5) or 5), 20))
        league = (opts.get("league") or "").strip()
        force = bool(opts.get("force"))

        today = timezone.localdate()
        start = timezone.make_aware(datetime.combine(today, time.min))
        end = start + timedelta(days=days_ahead)

        matches_qs = (
            Match.objects.select_related("home_team", "away_team", "league")
            .filter(date__gte=start, date__lt=end)
            .order_by("date")
        )
        if league:
            matches_qs = matches_qs.filter(league__name=league)

        matches = list(matches_qs)
        if not matches:
            self.stdout.write("Nenhuma partida encontrada na janela.")
            return

        match_ids = [m.id for m in matches]

        # Cache de jogos finalizados para cálculo
        cache = preload_ultimos_jogos(limit=sample_limit)

        # Pré-carregar odds para calcular best_by_market em lote
        odds = (
            MatchOdds.objects.filter(match_id__in=match_ids)
            .select_related("bookmaker")
            .order_by("-last_updated")
        )

        markets = [
            ("home_win", "home_win_odd"),
            ("draw", "draw_odd"),
            ("away_win", "away_win_odd"),
            ("over_25", "over_25_odd"),
            ("under_25", "under_25_odd"),
            ("btts_yes", "btts_yes_odd"),
            ("btts_no", "btts_no_odd"),
        ]

        best_by_match = {mid: {k: None for (k, _) in markets} for mid in match_ids}

        def f(x):
            return float(x) if x is not None else None

        for row in odds:
            bm = row.bookmaker
            for key, field in markets:
                val = getattr(row, field)
                if val is None:
                    continue
                odd_value = f(val)
                if odd_value is None:
                    continue
                cur = best_by_match[row.match_id].get(key)
                if cur is None or odd_value > cur["odd"]:
                    best_by_match[row.match_id][key] = {
                        "odd": odd_value,
                        "bookmaker": bm.name if bm else None,
                        "is_brazilian": bool(getattr(bm, "is_brazilian", False)),
                        "last_updated": row.last_updated.isoformat() if row.last_updated else None,
                    }

        upserts = 0
        skipped = 0

        for match in matches:
            if not force and MatchAnalysis.objects.filter(match=match).exists():
                skipped += 1
                continue

            home = match.home_team
            away = match.away_team

            home_games = cache.get(home.id, []) or []
            away_games = cache.get(away.id, []) or []

            home_over25 = calcular_over25(home, cache)
            away_over25 = calcular_over25(away, cache)
            home_btts = calcular_btts(home, cache)
            away_btts = calcular_btts(away, cache)

            over25_prob = (home_over25 + away_over25) / 2
            btts_prob = (home_btts + away_btts) / 2

            min_sample = min(len(home_games), len(away_games))
            if min_sample >= sample_limit:
                sample_quality = "boa"
            elif min_sample >= max(3, sample_limit - 2):
                sample_quality = "média"
            else:
                sample_quality = "baixa"

            # Heurística 1X2 (mesma ideia usada no sistema)
            home_goals_avg = calcular_media_gols(home, cache)
            away_goals_avg = calcular_media_gols(away, cache)

            diff_home = home_goals_avg - away_goals_avg
            base_prob = 33.33
            home_advantage = 10
            goal_diff_factor_home = diff_home * 8
            home_win_prob = base_prob + home_advantage + goal_diff_factor_home
            home_win_prob = max(15, min(75, home_win_prob))

            diff_away = away_goals_avg - home_goals_avg
            away_advantage = -5
            goal_diff_factor_away = diff_away * 8
            away_win_prob = base_prob + away_advantage + goal_diff_factor_away
            away_win_prob = max(15, min(75, away_win_prob))

            diff_abs = abs(home_goals_avg - away_goals_avg)
            draw_prob = 30 - (diff_abs * 3)
            draw_prob = max(20, min(35, draw_prob))

            insights = gerar_insights_rapidos(match, cache)

            payload = {
                "sample_limit": sample_limit,
                "probabilities": {
                    "over_25": round(float(over25_prob), 2),
                    "btts_yes": round(float(btts_prob), 2),
                    "home_win": round(float(home_win_prob), 2),
                    "draw": round(float(draw_prob), 2),
                    "away_win": round(float(away_win_prob), 2),
                },
                "team_rates": {
                    "home": {
                        "sample_size": len(home_games),
                        "over_25": int(home_over25),
                        "btts_yes": int(home_btts),
                    },
                    "away": {
                        "sample_size": len(away_games),
                        "over_25": int(away_over25),
                        "btts_yes": int(away_btts),
                    },
                    "sample_limit": sample_limit,
                    "quality": sample_quality,
                },
                "insights": insights,
                "best_by_market": best_by_match.get(match.id) or {},
            }

            MatchAnalysis.objects.update_or_create(
                match=match,
                defaults={
                    **payload,
                    "computed_at": timezone.now(),
                },
            )
            upserts += 1

        self.stdout.write(
            f"Análises salvas/atualizadas: {upserts}. Puladas (já existiam): {skipped}."
        )

