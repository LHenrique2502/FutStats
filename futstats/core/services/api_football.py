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

async def get_leagues():
    # print("🔑 API KEY:", repr(os.environ.get("API_KEY")))

    print(f"API_HOST: {API_HOST}")
    print(f"API_KEY: {API_KEY}")

    print("🟢 Iniciando get_leagues()")

    url = f"{BASE_URL}/v3/leagues"

    async with httpx.AsyncClient(timeout=20) as client:
        data = await fetch(client, url)

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

async def fetch_teams_for_league(client, league):
    url = f"{BASE_URL}/v3/teams"
    params = {
        "league": league.api_id,
        "season": league.season,
    }

    data = await fetch(client, url, params=params)
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
    # Busca as ligas de interesse no banco de forma segura (dentro do contexto async)
    ligas_atuais = await sync_to_async(list)(
        League.objects.filter(api_id__in=ids_de_interesse)
    )

    async with httpx.AsyncClient(timeout=20) as client:
        # Cria tarefas assíncronas para importar os times de cada liga
        tasks = [fetch_teams_for_league(client, liga) for liga in ligas_atuais]
        await asyncio.gather(*tasks)

async def import_players_for_team(client, team):
    print(f"\n🔍 Buscando jogadores do time: {team.name} (ID API: {team.api_id})")

    url = f"{BASE_URL}/v3/players/squads"
    params = {"team": team.api_id}
    data = await fetch(client, url, params=params)

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
    # print(repr(os.environ["DATABASE_URL"]))
    print("🚀 Iniciando importação de jogadores...")

    times = await sync_to_async(list)(
        Team.objects.select_related("league").all()
    )

    async with httpx.AsyncClient(timeout=30) as client:
        tasks = [import_players_for_team(client, team) for team in times]
        await asyncio.gather(*tasks)

    print("\n✅ Importação de jogadores finalizada.")

# TODO: Refatorar chamadas daqui para baixo para se adequarem as lógicas

async def import_matches_for_team(client, team, season="2025"):
    print(f"\n🔍 Buscando partidas do time: {team.name} (ID API: {team.api_id})")

    url = f"{BASE_URL}/v3/fixtures"
    params = {
        "team": team.api_id,
        "season": season
    }

    data = await fetch(client, url, params=params)

    if not data or "response" not in data:
        print(f"⚠️ Nenhuma partida retornada para o time {team.name}")
        return

    fixtures = data["response"]
    if not fixtures:
        print(f"❌ Nenhuma partida encontrada para o time {team.name}")
        return

    for partida in fixtures:
        try:
            fixture_data = partida.get("fixture", {})
            league_data = partida.get("league", {})
            teams_data = partida.get("teams", {})
            goals_data = partida.get("goals", {})
            score_data = partida.get("score", {}).get("penalty", {})

            api_id = fixture_data.get("id")
            date = fixture_data.get("date")

            venue_name = fixture_data.get("venue", {}).get("name")
            venue_city = fixture_data.get("venue", {}).get("city")
            referee = fixture_data.get("referee")
            # venue_capacity não vem nessa API, está como placeholder
            venue_capacity = None  

            home_team_id = teams_data.get("home", {}).get("id")
            away_team_id = teams_data.get("away", {}).get("id")

            # Pega os objetos Team com base no ID (relacionamento ForeignKey)
            home_team = await sync_to_async(Team.objects.get)(api_id=home_team_id)
            away_team = await sync_to_async(Team.objects.get)(api_id=away_team_id)

            home_score = goals_data.get("home")
            away_score = goals_data.get("away")
            home_penalties = score_data.get("home")
            away_penalties = score_data.get("away")

            def salvar_partida():
                return Match.objects.update_or_create(
                    api_id=api_id,
                    defaults={
                        "date": date,
                        "league": team.league,  # Usa o time para acessar a League
                        "venue_name": venue_name,
                        "venue_city": venue_city,
                        "venue_capacity": venue_capacity,
                        "referee": referee,
                        "home_team": home_team,
                        "away_team": away_team,
                        "home_score": home_score,
                        "away_score": away_score,
                        "home_penalties": home_penalties,
                        "away_penalties": away_penalties,
                        "last_fetched_at": timezone.now()
                    }
                )
 
            match_obj, created = await sync_to_async(salvar_partida)()
            action = "🆕 Criado" if created else "🔄 Atualizado"
            print(f"{action} partida: {home_team.name} X {away_team.name}")

        except Exception as e:
            print(f"❌ Erro ao salvar partida ID {partida.get('fixture', {}).get('id', 'Desconhecido')} — {e}")


async def import_matches_async():
    print("🚀 Iniciando importação de partidas...")

    times = await sync_to_async(list)(
        Team.objects.select_related("league").all()
    )

    async with httpx.AsyncClient(timeout=30) as client:
        tasks = [import_matches_for_team(client, team, season="2025") for team in times]
        await asyncio.gather(*tasks)

    print("\n✅ Importação de partidas finalizada.")

async def fetch_match_data(client, match):
    match_id = match.api_id

    # ==============================
    # 📦 IMPORTAR EVENTOS
    # ==============================
    if not match.events_fetched_at:
        url_events = f"{BASE_URL}/v3/fixtures/events"
        params_events = {"fixture": match_id}
        data_events = await fetch(client, url_events, params_events)

        if data_events and "response" in data_events:
            for event in data_events["response"]:
                team_api_id = event.get("team", {}).get("id")
                team_obj = await sync_to_async(Team.objects.filter(api_id=team_api_id).first)()
                if not team_obj:
                    continue

                await sync_to_async(MatchEvent.objects.update_or_create)(
                    match=match,
                    team=team_obj,
                    player=event.get("player", {}).get("name"),
                    minute=event.get("time", {}).get("elapsed"),
                    extra_minute=event.get("time", {}).get("extra"),
                    type=event.get("type"),
                    detail=event.get("detail"),
                    defaults={
                        "assist": event.get("assist", {}).get("name"),
                        "comments": event.get("comments"),
                    }
                )
            match.events_fetched_at = now()
            await sync_to_async(match.save)()
            print(f"✅ Eventos importados para a partida {match_id}")

    # ==============================
    # 📊 IMPORTAR ESTATÍSTICAS
    # ==============================
    if not match.stats_fetched_at:
        url_stats = f"{BASE_URL}/v3/fixtures/statistics"
        params_stats = {"fixture": match_id}
        data_stats = await fetch(client, url_stats, params_stats)

        if data_stats and "response" in data_stats:
            for team_stats in data_stats["response"]:
                team_api_id = team_stats.get("team", {}).get("id")
                team_obj = await sync_to_async(Team.objects.filter(api_id=team_api_id).first)()
                if not team_obj:
                    continue

                stats_dict = {}
                for stat in team_stats.get("statistics", []):
                    stat_name = stat.get("type")
                    stat_value = stat.get("value")

                    if stat_name == "Shots on Goal":
                        stats_dict["shots_on_goal"] = stat_value
                    elif stat_name == "Shots off Goal":
                        stats_dict["shots_off_goal"] = stat_value
                    elif stat_name == "Total Shots":
                        stats_dict["total_shots"] = stat_value
                    elif stat_name == "Blocked Shots":
                        stats_dict["blocked_shots"] = stat_value
                    elif stat_name == "Shots insidebox":
                        stats_dict["shots_inside_box"] = stat_value
                    elif stat_name == "Shots outsidebox":
                        stats_dict["shots_outside_box"] = stat_value
                    elif stat_name == "Fouls":
                        stats_dict["fouls"] = stat_value
                    elif stat_name == "Corner Kicks":
                        stats_dict["corner_kicks"] = stat_value
                    elif stat_name == "Offsides":
                        stats_dict["offsides"] = stat_value
                    elif stat_name == "Ball Possession":
                        stats_dict["ball_possession"] = stat_value
                    elif stat_name == "Yellow Cards":
                        stats_dict["yellow_cards"] = stat_value
                    elif stat_name == "Red Cards":
                        stats_dict["red_cards"] = stat_value
                    elif stat_name == "Passes":
                        stats_dict["passes"] = stat_value
                    elif stat_name == "Accurate Passes":
                        stats_dict["accurate_passes"] = stat_value
                    elif stat_name == "Pass Percentage":
                        stats_dict["pass_percentage"] = stat_value

                await sync_to_async(TeamStatistics.objects.update_or_create)(
                    match=match,
                    team=team_obj,
                    defaults=stats_dict
                )
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

RATE_LIMIT_REQUESTS = 30
RATE_LIMIT_SLEEP = 60  # segundos

def chunk_list(lst, size):
    for i in range(0, len(lst), size):
        yield lst[i:i + size]

async def import_match_data_async():
    limite = now() - timedelta(days=2)
    matches = await sync_to_async(list)(
        Match.objects.filter(date__lte=now(), date__gte=limite)
        .filter(Q(last_fetched_at__isnull=True) | Q(last_fetched_at__lt=limite))
    )

    if not matches:
        print("✅ Nenhuma partida pendente para atualização.")
        return

    async with httpx.AsyncClient(timeout=30) as client:
        total = len(matches)
        print(f"🔄 Iniciando importação de {total} partidas (máx {RATE_LIMIT_REQUESTS}/minuto)...")

        for index, batch in enumerate(chunk_list(matches, RATE_LIMIT_REQUESTS), start=1):
            print(f"\n🚀 Lote {index}: processando {len(batch)} partidas...")

            tasks = [fetch_match_data_safe(client, match) for match in batch]
            await asyncio.gather(*tasks)

            if (index * RATE_LIMIT_REQUESTS) < total:
                print(f"⏳ Aguardando {RATE_LIMIT_SLEEP}s para o próximo lote...")
                await asyncio.sleep(RATE_LIMIT_SLEEP)

    print("\n✅ Importação finalizada com sucesso!")