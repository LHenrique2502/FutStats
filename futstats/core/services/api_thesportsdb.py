import os
import asyncio
import httpx
from dotenv import load_dotenv
from asgiref.sync import sync_to_async
from django.utils.timezone import now
from django.utils.timezone import make_aware
from datetime import datetime
from datetime import timedelta

from core.models import (
    League,
    Team,
    Player,
    Match,
    MatchEvent,
    TeamStatistics
)

load_dotenv()

API_KEY = os.getenv("THESPORTSDB_API_KEY")
BASE_URL = os.getenv("THESPORTSDB_BASE_URL")

LEAGUES_OF_INTEREST = {
    "English Premier League": 4328,
    "English League Championship": 4329,
    "Spanish La Liga": 4335,
    "German Bundesliga": 4331,
    "Italian Serie A": 4332,
    "French Ligue 1": 4334,
    "Brazil Serie A": 4351,
}

# ============================================================
# FUNÇÃO AUXILIAR DE REQUEST COM SEMÁFORO (CONTROLE DE RATE)
# ============================================================

async def fetch(client, endpoint, semaphore):
    url = f"{BASE_URL}/{endpoint}"
    headers = {"X-API-KEY": API_KEY}

    async with semaphore:
        try:
            r = await client.get(url, headers=headers)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            print(f"❌ Erro em {endpoint}: {e}")
            return None


# ==========================
# IMPORTAÇÃO DE LIGAS
# ==========================

async def import_leagues_async():
    print("🚀 Importando ligas...")

    async with httpx.AsyncClient(timeout=20) as client:
        for league_name, league_id in LEAGUES_OF_INTEREST.items():
            data = await fetch(client, f"lookup/league/{league_id}", asyncio.Semaphore(1))

            if not data or "lookup" not in data:
                print(f"❌ Não retornou dados para {league_name}")
                continue

            lg = data["lookup"][0]

            await sync_to_async(League.objects.update_or_create)(
                api_id=lg["idLeague"],
                defaults={
                    "name": lg["strLeague"],
                    "country": lg["strCountry"],
                    "logo": lg["strBadge"],
                    "season": lg["strCurrentSeason"],
                    "last_fetched_at": now(),
                }
            )

            print(f"✅ Liga salva: {league_name}")


# ==========================
# IMPORTAÇÃO DE TIMES
# ==========================

async def import_teams_async():
    print("\n🚀 Importando times...")

    leagues = await sync_to_async(list)(League.objects.all())

    async with httpx.AsyncClient(timeout=25) as client:
        for lg in leagues:
            print(f"\n🔍 League: {lg.name} ({lg.season})")

            data = await fetch(client, f"list/teams/{lg.api_id}", asyncio.Semaphore(1))
            if not data or "list" not in data:
                print(f"⚠️ Nenhum time encontrado em {lg.name}")
                continue

            for t in data["list"]:
                await sync_to_async(Team.objects.update_or_create)(
                    api_id=t["idTeam"],
                    defaults={
                        "name": t["strTeam"],
                        "code": t.get("strTeamShort"),
                        "country": t.get("strCountry"),
                        "logo": t.get("strBadge"),
                        "league": lg,
                        "last_fetched_at": now(),
                    }
                )
                print(f"✅ Time salvo: {t['strTeam']}")


# ==========================
# IMPORTAÇÃO DE JOGADORES (PARALELIZADA)
# ==========================

async def import_players_async():
    print("\n🚀 Importando jogadores...")

    teams = await sync_to_async(list)(Team.objects.all())
    semaphore = asyncio.Semaphore(10)

    async with httpx.AsyncClient(timeout=25) as client:

        async def import_team_players(team):
            data = await fetch(client, f"list/players/{team.api_id}", semaphore)

            if not data or "list" not in data:
                print(f"⚠️ Nenhum jogador encontrado para {team.name}")
                return

            for p in data["list"]:
                await sync_to_async(Player.objects.update_or_create)(
                    api_id=p["idPlayer"],
                    defaults={
                        "name": p["strPlayer"],
                        "age": None,
                        "nationality": None,
                        "photo": p.get("strCutout") or p.get("strThumb"),
                        "team": team,
                        "position": p.get("strPosition"),
                        "number": None,
                        "last_fetched_at": now(),
                    }
                )

            print(f"✅ Jogadores salvos para {team.name}")

        await asyncio.gather(*(import_team_players(team) for team in teams))


# ==========================
# IMPORTAÇÃO DE PARTIDAS
# ==========================

async def import_matches_async():
    print("\n🚀 Importando partidas...")

    leagues = await sync_to_async(list)(League.objects.all())
    semaphore = asyncio.Semaphore(10)

    today = now().date()
    seven_days_later = today + timedelta(days=7)

    async with httpx.AsyncClient(timeout=25) as client:

        async def import_league_matches(lg):
            data = await fetch(client, f"schedule/league/{lg.api_id}/{lg.season}", semaphore)

            if not data or "schedule" not in data:
                print(f"❌ Nenhuma partida encontrada para {lg.name}")
                return

            for ev in data["schedule"]:

                # ✅ Filtrar apenas próximos 7 dias
                event_date = datetime.strptime(ev["dateEvent"], "%Y-%m-%d").date()
                if not (today <= event_date <= seven_days_later):
                    continue

                home_team = await sync_to_async(Team.objects.get)(api_id=ev["idHomeTeam"])
                away_team = await sync_to_async(Team.objects.get)(api_id=ev["idAwayTeam"])

                date = make_aware(datetime.strptime(ev["dateEvent"], "%Y-%m-%d"))

                await sync_to_async(Match.objects.update_or_create)(
                    api_id=ev["idEvent"],
                    defaults={
                        "date": date,
                        "league": lg,
                        "venue_name": ev.get("strVenue"),
                        "home_team": home_team,
                        "away_team": away_team,
                        "home_score": ev.get("intHomeScore"),
                        "away_score": ev.get("intAwayScore"),
                        "last_fetched_at": now(),
                    }
                )

            print(f"✅ Partidas salvas para {lg.name} (próximos 7 dias)")

        await asyncio.gather(*(import_league_matches(lg) for lg in leagues))



# =================================
# IMPORTAÇÃO DE EVENTOS DA PARTIDA
# =================================

BATCH_SIZE = 35

async def import_match_events_async():
    print("\n🚀 Importando eventos...")

    semaphore = asyncio.Semaphore(10)
    total_processed = 0
    five_days_ago = now() - timedelta(days=5)

    # ✅ Pré-carrega os times para evitar queries dentro do async
    all_matches = await sync_to_async(lambda: list(
        Match.objects.filter(
            events_fetched_at__isnull=True,
            date__gte=five_days_ago
        )
        .select_related("home_team", "away_team")
        .order_by("id")
    ))()

    total_to_process = len(all_matches)
    print(f"🔎 {total_to_process} partidas encontradas para processar...\n")

    async with httpx.AsyncClient(timeout=20) as client:

        for i in range(0, total_to_process, BATCH_SIZE):
            batch = all_matches[i:i + BATCH_SIZE]

            async def import_events(match):
                try:
                    url = f"lookup/event_timeline/{match.api_id}"
                    data = await fetch(client, url, semaphore)

                    timeline = data.get("lookup")

                    # ✅ Sem estatísticas → NÃO marca como importado
                    if not timeline:
                        print(
                            f"⚠️ Nenhum dado para a partida {match.api_id} "
                            f"{match.home_team.name} x {match.away_team.name} (não marcado)"
                        )
                        return

                    # ✅ Partida com estatísticas → importar cada item
                    for e in timeline:
                        await sync_to_async(MatchEvent.objects.create)(
                            match=match,
                            team=match.home_team if e["idTeam"] == str(match.home_team.api_id) else match.away_team,
                            player=e.get("strPlayer"),
                            assist=e.get("strAssist"),
                            type=e["strTimeline"],
                            detail=e.get("strTimelineDetail"),
                            comments=e.get("strComment"),
                            minute=int(e.get("intTime") or 0),
                            extra_minute=0,
                            last_fetched_at=now()
                        )

                    # ✅ Marca como importado APENAS AQUI
                    match.events_fetched_at = now()
                    await sync_to_async(match.save)()

                    print(
                        f"✅ Estatísticas importadas para {match.api_id} "
                        f"{match.home_team.name} x {match.away_team.name}"
                    )

                except Exception as ex:
                    print(
                        f"❌ Erro ao importar evento de {match.api_id} "
                        f"{match.home_team.name} x {match.away_team.name}: {ex}"
                    )

            await asyncio.gather(*(import_events(m) for m in batch))
            total_processed += len(batch)

            print(f"⏭️ Processados {total_processed}/{total_to_process} jogos até agora...\n")
            await asyncio.sleep(20)

    print("🏁 Fim da importação de eventos.\n")


# ======================================
# IMPORTAÇÃO DE ESTATÍSTICAS DA PARTIDA
# ======================================

async def import_match_stats_async():
    print("\n🚀 Importando estatísticas...")

    # ✅ Filtrar APENAS partidas:
    # - que já têm eventos
    # - que ainda não têm estatísticas
    matches = await sync_to_async(lambda: list(
        Match.objects.filter(
            events_fetched_at__isnull=False,
            stats_fetched_at__isnull=True
        )
        .select_related("home_team", "away_team")  # ✅ evita erro async
    ))()

    if not matches:
        print("📭 Nenhuma partida pendente para estatísticas.")
        return

    semaphore = asyncio.Semaphore(5)  # ✅ menor concorrência = estável

    async with httpx.AsyncClient(timeout=20) as client:

        async def import_stats(match):
            try:
                data = await fetch(client, f"lookup/event_stats/{match.api_id}", semaphore)

                stats = data.get("lookup") if data else None

                if not stats:
                    print(f"⚠️ Nenhuma estatística para {match.api_id}")
                    return

                # ✅ dicionários agrupados
                home = {}
                away = {}

                for item in stats:
                    stat_name = item.get("strStat")
                    home_val = item.get("intHome")
                    away_val = item.get("intAway")

                    home[stat_name] = home_val
                    away[stat_name] = away_val

                # ✅ salvar stats home
                await sync_to_async(TeamStatistics.objects.update_or_create)(
                    match=match,
                    team=match.home_team,
                    defaults={
                        "shots_on_goal": home.get("Shots on Goal"),
                        "shots_off_goal": home.get("Shots off Goal"),
                        "total_shots": home.get("Total Shots"),
                        "corner_kicks": home.get("Corner Kicks"),
                        "offsides": home.get("Offsides"),
                        "ball_possession": home.get("Ball Possession"),
                        "last_fetched_at": now(),
                    }
                )

                # ✅ salvar stats away
                await sync_to_async(TeamStatistics.objects.update_or_create)(
                    match=match,
                    team=match.away_team,
                    defaults={
                        "shots_on_goal": away.get("Shots on Goal"),
                        "shots_off_goal": away.get("Shots off Goal"),
                        "total_shots": away.get("Total Shots"),
                        "corner_kicks": away.get("Corner Kicks"),
                        "offsides": away.get("Offsides"),
                        "ball_possession": away.get("Ball Possession"),
                        "last_fetched_at": now(),
                    }
                )

                match.stats_fetched_at = now()
                await sync_to_async(match.save)()

                print(f"✅ Estatísticas importadas para {match.api_id}")

            except Exception as e:
                print(f"❌ Erro ao importar estatísticas de {match.api_id}: {e}")

        # ✅ rodar tudo com gather
        tasks = [import_stats(m) for m in matches]
        await asyncio.gather(*tasks)
