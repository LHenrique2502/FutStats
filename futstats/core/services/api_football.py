from dotenv import load_dotenv
load_dotenv() # Carrega o conteúdo do .env

import asyncio
import requests
import os
import time
from django.db.models import Q
from datetime import datetime
from core.models import League, Team, Player, Match, MatchEvent, TeamStatistics
import httpx
from django.utils.timezone import now, timedelta
from core.models import League
from asgiref.sync import sync_to_async
from django.utils import timezone

API_HOST = os.getenv("API_HOST")  # só o host, sem https://
BASE_URL = f"https://{API_HOST}"  # URL completa com protocolo

API_KEY = os.getenv("API_KEY")

HEADERS = {
    "x-rapidapi-host": API_HOST,  # só o host, sem https://
    "x-rapidapi-key": API_KEY
}

ids_de_interesse = [39, 140, 61, 135, 78, 71, 15]  # Premier, Espanhol, Francês, Italiano, Alemão, Brasileiro, Copa do Mundo de Clubes

RATE_LIMIT_REQUESTS = 30
RATE_LIMIT_SLEEP = 60  # segundos

API_REQUEST_COUNT = 0

def chunk_list(lst, size):
    for i in range(0, len(lst), size):
        yield lst[i:i + size]


async def fetch(client, url, params=None, retries=3):
    for attempt in range(retries):
        try:
            response = await client.get(url, headers=HEADERS, params=params)
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", 60))
                await asyncio.sleep(retry_after)
            else:
                print(f"Erro {response.status_code}: {response.text}")
                return None
        except httpx.RequestError as e:
            print(f"Erro de rede: {e}")
            await asyncio.sleep(2 ** attempt)
    return None

# Importação de ligas
async def get_leagues():
    global API_REQUEST_COUNT

    print("🚀 Iniciando importação de ligas...")

    url = f"{BASE_URL}/v3/leagues"

    async with httpx.AsyncClient(timeout=20) as client:
        data = await fetch(client, url)
        API_REQUEST_COUNT += 1

        if not data:
            print("❌ Nenhuma liga foi retornada.")
            return

        for item in data.get("response", []):
            league = item.get("league")
            country = item.get("country")
            seasons = item.get("seasons", [])

            if league["id"] in ids_de_interesse:
                current_season = next((s for s in seasons if s.get("current")), None)
                if not current_season:
                    continue

                await sync_to_async(League.objects.update_or_create)(
                    api_id=league["id"],
                    defaults={
                        "name": league["name"],
                        "type": league["type"],
                        "country": country["name"],
                        "logo": league["logo"],
                        "season": current_season["year"],
                        "last_fetched_at": now(),
                    }
                )
                print(f"✅ Liga importada/atualizada: {league['name']}")

    print(f"\n📊 Total de requisições feitas: {API_REQUEST_COUNT}")

# Importação de times
async def fetch_teams_for_league(client, league):

    global API_REQUEST_COUNT

    print(f"\n🔍 Buscando times da liga: {team.league}")

    url = f"{BASE_URL}/v3/teams"
    params = {
        "league": league.api_id,
        "season": league.season,
    }

    data = await fetch(client, url, params=params)
    API_REQUEST_COUNT += 1

    if not data:
        print(f"❌ Nenhum time retornado para a liga {league.name}")
        return

    for item in data.get("response", []):
        team = item["team"]

        await sync_to_async(Team.objects.update_or_create)(
            api_id=team["id"],
            defaults={
                "name": team["name"],
                "code": team.get("code"),
                "country": team["country"],
                "logo": team["logo"],
                "league": league,
                "last_fetched_at": now(),
            }
        )

    print(f"✅ Times importados/atualizados da liga {league.name}")

async def import_teams_async():

    print("🚀 Iniciando importação de times...")

    # Busca as ligas de interesse no banco de forma segura (dentro do contexto async)
    ligas_atuais = await sync_to_async(list)(
        League.objects.filter(api_id__in=ids_de_interesse)
    )

    async with httpx.AsyncClient(timeout=20) as client:
        # Cria tarefas assíncronas para importar os times de cada liga
        tasks = [fetch_teams_for_league(client, liga) for liga in ligas_atuais]
        await asyncio.gather(*tasks)

    print("\n✅ Importação de times finalizada.")
    print(f"\n📊 Total de requisições feitas: {API_REQUEST_COUNT}")

# Importação de jogadores
# Refatorar para diminuir requisições (realizar requisições pela liga)
async def import_players_for_team(client, team):

    global API_REQUEST_COUNT

    print(f"\n🔍 Buscando jogadores do time: {team.name} (ID API: {team.api_id})")

    url = f"{BASE_URL}/v3/players/squads"
    params = {"team": team.api_id}
    data = await fetch(client, url, params=params)
    API_REQUEST_COUNT += 1

    if not data or "response" not in data:
        print(f"⚠️ Nenhum dado retornado para o time {team.name}")
        return

    squads = data["response"]
    if not squads:
        print(f"❌ Squad vazio para o time {team.name}")
        return

    jogadores = squads[0].get("players", [])

    for jogador in jogadores:
        try:
            api_id = jogador.get("id")
            name = jogador.get("name")
            age = jogador.get("age")
            nationality = jogador.get("nationality")
            photo = jogador.get("photo")
            position = jogador.get("position")
            number = jogador.get("number")

            statistics = jogador.get("statistics", [{}])[0]
            games = statistics.get("games", {}) if statistics else {}
            goals = statistics.get("goals", {}) if statistics else {}

            def salvar_jogador():
                return Player.objects.update_or_create(
                    api_id=api_id,
                    defaults={
                        "name": name,
                        "age": age,
                        "nationality": nationality,
                        "photo": photo,
                        "team": team,
                        "position": position,
                        "number": number,
                        "appearences": games.get("appearences"),
                        "lineups": games.get("lineups"),
                        "minutes": games.get("minutes"),
                        "total_goals": goals.get("total"),
                        "conceded_goals": goals.get("conceded"),
                        "assists": goals.get("assists"),
                        "saves": goals.get("saves"),
                        "last_fetched_at": timezone.now()
                    }
                )

            player_obj, created = await sync_to_async(salvar_jogador)()
            action = "🆕 Criado" if created else "🔄 Atualizado"
            print(f"{action} jogador: {name}")

        except Exception as e:
            print(f"❌ Erro ao salvar jogador: {jogador.get('name', 'Desconhecido')} — {e}")

async def import_players_async():

    global API_REQUEST_COUNT

    # print(repr(os.environ["DATABASE_URL"]))
    print("🚀 Iniciando importação de jogadores...")

    times = await sync_to_async(list)(
        Team.objects.select_related("league").all()
    )

    async with httpx.AsyncClient(timeout=30) as client:
        tasks = [import_players_for_team(client, team) for team in times]
        await asyncio.gather(*tasks)

    print("\n✅ Importação de jogadores finalizada.")
    print(f"\n📊 Total de requisições feitas: {API_REQUEST_COUNT}")

# Importação de partidas
async def import_matches_for_league(client, league, season="2025"):

    global API_REQUEST_COUNT

    print(f"\n🔍 Buscando partidas da liga: {league.name} (ID API: {league.api_id})")

    url = f"{BASE_URL}/v3/fixtures"
    params = {
        "league": league.api_id,
        "season": season
    }

    data = await fetch(client, url, params=params)
    API_REQUEST_COUNT += 1

    if not data or "response" not in data:
        print(f"⚠️ Nenhuma partida retornada para a liga {league.name}")
        return

    fixtures = data["response"]

    # Define intervalo de datas recentes
    agora = timezone.now()
    dias_passados = agora - timedelta(days=5)
    dias_futuros = agora + timedelta(days=5)

    for partida in fixtures:
        try:
            fixture_data = partida.get("fixture", {})
            date_str = fixture_data.get("date")
            date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))

            # 🧠 Ignora partidas muito antigas ou muito distantes
            if not (dias_passados <= date <= dias_futuros):
                continue

            league_data = partida.get("league", {})
            teams_data = partida.get("teams", {})
            goals_data = partida.get("goals", {})
            score_data = partida.get("score", {}).get("penalty", {})

            api_id = fixture_data.get("id")
            venue_name = fixture_data.get("venue", {}).get("name")
            venue_city = fixture_data.get("venue", {}).get("city")
            referee = fixture_data.get("referee")

            home_team_id = teams_data.get("home", {}).get("id")
            away_team_id = teams_data.get("away", {}).get("id")

            home_team = await sync_to_async(Team.objects.get)(api_id=home_team_id)
            away_team = await sync_to_async(Team.objects.get)(api_id=away_team_id)

            home_score = goals_data.get("home")
            away_score = goals_data.get("away")
            home_penalties = score_data.get("home")
            away_penalties = score_data.get("away")

            match_obj = await sync_to_async(Match.objects.filter(api_id=api_id).first)()
            if match_obj:
                match_obj.date = date
                match_obj.league = league
                match_obj.venue_name = venue_name
                match_obj.venue_city = venue_city
                match_obj.referee = referee
                match_obj.home_team = home_team
                match_obj.away_team = away_team
                match_obj.home_score = home_score
                match_obj.away_score = away_score
                match_obj.home_penalties = home_penalties
                match_obj.away_penalties = away_penalties
                match_obj.last_fetched_at = timezone.now()
                await sync_to_async(match_obj.save)()
                print(f"♻️ Atualizada partida: {home_team.name} X {away_team.name}")
            else:
                def salvar_partida():
                    return Match.objects.create(
                        api_id=api_id,
                        date=date,
                        league=league,
                        venue_name=venue_name,
                        venue_city=venue_city,
                        referee=referee,
                        home_team=home_team,
                        away_team=away_team,
                        home_score=home_score,
                        away_score=away_score,
                        home_penalties=home_penalties,
                        away_penalties=away_penalties,
                        last_fetched_at=timezone.now()
                    )
                await sync_to_async(salvar_partida)()
                print(f"🆕 Criada nova partida: {home_team.name} X {away_team.name}")

        except Exception as e:
            print(f"❌ Erro ao salvar partida ID {fixture_data.get('id')} — {e}")

async def import_matches_async():
    print("🚀 Iniciando importação de partidas por liga...")

    global API_REQUEST_COUNT

    ligas = await sync_to_async(list)(League.objects.all())

    async with httpx.AsyncClient(timeout=30) as client:
        tasks = [
            import_matches_for_league(client, liga, season="2025")
            for liga in ligas
        ]
        await asyncio.gather(*tasks)

    print("\n✅ Importação de partidas finalizada.")
    print(f"\n📊 Total de requisições feitas: {API_REQUEST_COUNT}")

# Importação de estatísticas das partidas
async def fetch_match_data(client, match):

    global API_REQUEST_COUNT

    match_id = match.api_id

    # ============================== EVENTOS ==============================
    if not match.events_fetched_at:
        url_events = f"{BASE_URL}/v3/fixtures/events"
        params_events = {"fixture": match_id}
        data_events = await fetch(client, url_events, params_events)
        API_REQUEST_COUNT += 1

        if data_events and "response" in data_events:
            created = 0
            for event in data_events["response"]:
                team_api_id = event.get("team", {}).get("id")
                team_obj = await sync_to_async(Team.objects.filter(api_id=team_api_id).first)()
                if not team_obj:
                    continue

                exists = await sync_to_async(MatchEvent.objects.filter(
                    match=match,
                    team=team_obj,
                    player=event.get("player", {}).get("name"),
                    minute=event.get("time", {}).get("elapsed"),
                    extra_minute=event.get("time", {}).get("extra"),
                    type=event.get("type"),
                    detail=event.get("detail"),
                ).exists)()

                if not exists:
                    await sync_to_async(MatchEvent.objects.create)(
                        match=match,
                        team=team_obj,
                        player=event.get("player", {}).get("name"),
                        assist=event.get("assist", {}).get("name"),
                        type=event.get("type"),
                        detail=event.get("detail"),
                        comments=event.get("comments"),
                        minute=event.get("time", {}).get("elapsed"),
                        extra_minute=event.get("time", {}).get("extra"),
                    )
                    created += 1

            if created > 0:
                match.events_fetched_at = now()
                await sync_to_async(match.save)()
                print(f"✅ {created} eventos importados para a partida {match_id}")

    # =========================== ESTATÍSTICAS ============================
    if not match.stats_fetched_at:
        url_stats = f"{BASE_URL}/v3/fixtures/statistics"
        params_stats = {"fixture": match_id}
        data_stats = await fetch(client, url_stats, params_stats)
        API_REQUEST_COUNT += 1

        if data_stats and "response" in data_stats:
            created = 0
            for team_stats in data_stats["response"]:
                team_api_id = team_stats.get("team", {}).get("id")
                team_obj = await sync_to_async(Team.objects.filter(api_id=team_api_id).first)()
                if not team_obj:
                    continue

                exists = await sync_to_async(TeamStatistics.objects.filter(
                    match=match,
                    team=team_obj
                ).exists)()

                if not exists:
                    stats_dict = {}
                    for stat in team_stats.get("statistics", []):
                        name = stat.get("type")
                        value = stat.get("value")

                        if name == "Shots on Goal":
                            stats_dict["shots_on_goal"] = value
                        elif name == "Shots off Goal":
                            stats_dict["shots_off_goal"] = value
                        elif name == "Total Shots":
                            stats_dict["total_shots"] = value
                        elif name == "Blocked Shots":
                            stats_dict["blocked_shots"] = value
                        elif name == "Shots insidebox":
                            stats_dict["shots_inside_box"] = value
                        elif name == "Shots outsidebox":
                            stats_dict["shots_outside_box"] = value
                        elif name == "Fouls":
                            stats_dict["fouls"] = value
                        elif name == "Corner Kicks":
                            stats_dict["corner_kicks"] = value
                        elif name == "Offsides":
                            stats_dict["offsides"] = value
                        elif name == "Ball Possession":
                            stats_dict["ball_possession"] = value
                        elif name == "Yellow Cards":
                            stats_dict["yellow_cards"] = value
                        elif name == "Red Cards":
                            stats_dict["red_cards"] = value
                        elif name == "Passes":
                            stats_dict["passes"] = value
                        elif name == "Accurate Passes":
                            stats_dict["accurate_passes"] = value
                        elif name == "Pass Percentage":
                            stats_dict["pass_percentage"] = value

                    await sync_to_async(TeamStatistics.objects.create)(
                        match=match,
                        team=team_obj,
                        **stats_dict
                    )
                    created += 1

            if created > 0:
                match.stats_fetched_at = now()
                await sync_to_async(match.save)()
                print(f"✅ Estatísticas importadas para a partida {match_id}")

async def fetch_match_data_safe(client, match):
    try:
        await fetch_match_data(client, match)
        match.last_fetched_at = now()
        await sync_to_async(match.save)()
    except Exception as e:
        print(f"❌ Erro ao importar dados da partida {match.api_id}: {e}")

async def import_match_data_async(client):

    global API_REQUEST_COUNT

    limite = now() - timedelta(days=2)

    # 🔍 Buscar IDs dos times e ligas salvos no banco
    print(f"🔍 Busca IDs dos times e ligas salvos no banco")
    team_ids = await sync_to_async(list)(Team.objects.values_list("id", flat=True))
    league_ids = await sync_to_async(list)(League.objects.values_list("id", flat=True))

    # 📦 Buscar partidas que:
    # - Já aconteceram
    # - São de times e ligas salvos
    # - Não têm dados recentes
    matches = await sync_to_async(list)(
    Match.objects.filter(
        date__lte=now(),
        home_team_id__in=team_ids,
        away_team_id__in=team_ids,
        league_id__in=league_ids,
        events_fetched_at__isnull=True,
        stats_fetched_at__isnull=True
    )
)

    if not matches:
        print("Nenhuma partida nova para atualizar.")
        return

    print(f"Encontradas {len(matches)} partidas para importar estatísticas/eventos.")

    # 🔄 Rate limit: 30 partidas por minuto
    for chunk in chunk_list(matches, RATE_LIMIT_REQUESTS):
        await asyncio.gather(*[
            fetch_match_data_safe(client, match) for match in chunk
        ])
        print(f"Aguardando {RATE_LIMIT_SLEEP}s para o próximo lote...")
        await asyncio.sleep(RATE_LIMIT_SLEEP)

    print("✅ Importação finalizada com sucesso.")
    print(f"\n📊 Total de requisições feitas: {API_REQUEST_COUNT}")