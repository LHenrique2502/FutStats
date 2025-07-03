import requests
import os
import time
from dotenv import load_dotenv
from datetime import datetime
from core.models import League, Team, Player, Match, MatchEvent, TeamStatistics

load_dotenv() # Carrega o conteúdo do .env

API_URL = os.getenv("API_URL")
API_KEY = os.getenv("API_KEY")

HEADERS = {
    "x-rapidapi-host": API_URL,
    "x-rapidapi-key": API_KEY
}

def get_leagues():
    """Busca ligas e salva apenas a temporada atual das ligas de interesse"""
    ids_de_interesse = [39, 140, 61, 135, 78, 71]  # Premier, Espanhol, Francês, Italiano, Alemão, Brasileiro

    url = f"https://{API_URL}/v3/leagues"
    response = requests.get(url, headers=HEADERS)

    if response.status_code == 200:
        data = response.json()
        for item in data["response"]:
            league = item.get("league")
            country = item.get("country")
            seasons = item.get("seasons", [])

            if league["id"] in ids_de_interesse:
                # Filtra a temporada atual
                current_season = next((s for s in seasons if s.get("current")), None)

                if current_season:
                    League.objects.update_or_create(
                    api_id=league["id"],
                    defaults={
                    "name": league["name"],
                    "type": league["type"],
                    "country": country["name"],
                    "logo": league["logo"],
                    "season": current_season["year"],
                        }
                    )
    else:
        print(f"Erro ao buscar ligas: {response.status_code} - {response.text}")

def get_teams():
    # Pega as ligas atuais no banco
    ligas_atuais = League.objects.filter(api_id__in=[39, 140, 61, 135, 78, 71])

    
    for liga in ligas_atuais:
        url = f"https://{API_URL}/v3/teams"
        params = {
            "league": liga.api_id,
            "season": liga.season,
        }
        response = requests.get(url, headers=HEADERS, params=params)
        
        if response.status_code == 200:
            data = response.json()
            for item in data["response"]:
                team = item["team"]
                
                Team.objects.update_or_create(
                    api_id=team["id"],
                    defaults={
                        "name": team["name"],
                        "code": team["code"],
                        "country": team["country"],
                        "logo": team["logo"],
                        "league": liga
                    }
                )
        else:
            print(f"Erro ao buscar times da liga {liga.name}: {response.status_code} - {response.text}")

def get_players():
    teams = Team.objects.all()
    
    for team in teams:
        url = f"https://{API_URL}/v3/players"
        params = {
            "team": team.api_id,
            "season": team.league.season
        }

        response = requests.get(url, headers=HEADERS, params=params)
        print(f"Requisição feita para o time {team.name}")
        
        if response.status_code == 200:
            data = response.json()
            for item in data.get("response", []):
                player_info = item.get("player", {})
                stats = item.get("statistics", [])

                if stats:
                    game_stats = stats[0].get("games", {})
                    goal_stats = stats[0].get("goals", {})

                    Player.objects.update_or_create(
                        api_id=player_info.get("id"),
                        defaults={
                            "name": player_info.get("name"),
                            "age": player_info.get("age"),
                            "nationality": player_info.get("nationality"),
                            "photo": player_info.get("photo"),
                            "team": team,
                            "appearences": game_stats.get("appearences"),
                            "lineups": game_stats.get("lineups"),
                            "minutes": game_stats.get("minutes"),
                            "position": game_stats.get("position"),
                            "number": game_stats.get("number"),
                            "total_goals": goal_stats.get("total"),
                            "conceded_goals": goal_stats.get("conceded"),
                            "assists": goal_stats.get("assists"),
                            "saves": goal_stats.get("saves")
                        }
                    )
        else:
            print(f"Erro ao buscar jogadores do time {team.name}: {response.status_code} - {response.text}")

        # Aguarda 2 segundos entre cada requisição
        time.sleep(2)

def get_match():
    teams = Team.objects.all()

    # Busca a data da última partida no banco
    ultima_partida = Match.objects.order_by('-date').first()
    if ultima_partida:
        data_inicio = ultima_partida.date.strftime('%Y-%m-%d')
    else:
        # Se não houver partidas no banco, define uma data inicial padrão
        data_inicio = '2024-01-01'

    print(f"🔍 Buscando partidas a partir de {data_inicio}")

    for team in teams:
        url = f"https://{API_URL}/v3/fixtures"
        params = {
            "team": team.api_id,
            "season": team.league.season,
            "from": data_inicio,  # Busca só jogos a partir desta data
        }
        response = requests.get(url, headers=HEADERS, params=params)
        print(f"Requisição feita para partidas do time {team.name}")

        if response.status_code == 200:
            data = response.json()
            for item in data.get("response", []):
                fixture_data = item.get("fixture", {})
                league_data = item.get("league", {})
                teams_data = item.get("teams", {})
                goals_data = item.get("goals", {})
                score_data = item.get("score", {})  # onde ficam os pênaltis
                venue_data = fixture_data.get("venue", {})

                league_obj = League.objects.filter(api_id=league_data.get("id")).first()
                if not league_obj:
                    continue

                home_data = teams_data.get("home", {})
                away_data = teams_data.get("away", {})

                home_team_obj, _ = Team.objects.get_or_create(
                    api_id=home_data.get("id"),
                    defaults={"name": home_data.get("name"), "league": league_obj}
                )

                away_team_obj, _ = Team.objects.get_or_create(
                    api_id=away_data.get("id"),
                    defaults={"name": away_data.get("name"), "league": league_obj}
                )

                Match.objects.update_or_create(
                    api_id=fixture_data.get("id"),
                    defaults={
                        'date': fixture_data.get('date'),
                        'league': league_obj,
                        'venue_name': venue_data.get('name'),
                        'venue_city': venue_data.get('city'),
                        'venue_capacity': venue_data.get('capacity'),
                        'referee': fixture_data.get('referee'),
                        'home_team': home_team_obj,
                        'away_team': away_team_obj,
                        'home_score': goals_data.get('home'),
                        'away_score': goals_data.get('away'),
                        'home_penalties': score_data.get('penalty', {}).get('home'),
                        'away_penalties': score_data.get('penalty', {}).get('away'),
                    }
                )
        else:
            print(f"❌ Erro ao buscar partidas do time {team.name}: {response.status_code} - {response.text}")

        time.sleep(2)

def import_match_details():
    leagues = League.objects.all()
    matches = Match.objects.filter(league__in=leagues)

    for match in matches:
        match_id = match.api_id

        # Verifica se já existem eventos ou estatísticas no banco
        events_exist = MatchEvent.objects.filter(match=match).exists()
        stats_exist = TeamStatistics.objects.filter(match=match).exists()

        # 🔹 1. Buscar eventos, se ainda não existem
        if not events_exist:
            url = f"https://{API_URL}/v3/fixtures/events"
            params = {"fixture": match_id}
            response = requests.get(url, headers=HEADERS, params=params)
            print(f"Requisição de eventos para a partida {match_id}")

            if response.status_code == 200:
                events = response.json().get("response", [])
                for event in events:
                    team_api_id = event.get("team", {}).get("id")
                    team_obj = Team.objects.filter(api_id=team_api_id).first()

                    MatchEvent.objects.update_or_create(
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
            else:
                print(f"Erro ao buscar eventos da partida {match_id}: {response.status_code}")

        # 🔹 2. Buscar estatísticas, se ainda não existem
        if not stats_exist:
            url_stats = f"https://{API_URL}/v3/fixtures/statistics"
            params_stats = {"fixture": match_id}
            response_stats = requests.get(url_stats, headers=HEADERS, params=params_stats)
            print(f"Requisição de estatísticas para a partida {match_id}")

            if response_stats.status_code == 200:
                stats_response = response_stats.json().get("response", [])
                for team_stats in stats_response:
                    team_api_id = team_stats.get("team", {}).get("id")
                    team_obj = Team.objects.filter(api_id=team_api_id).first()

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

                    TeamStatistics.objects.update_or_create(
                        match=match,
                        team=team_obj,
                        defaults=stats_dict
                    )
            else:
                print(f"Erro ao buscar estatísticas da partida {match_id}: {response_stats.status_code}")

        # Pausa para não estourar o limite da API
        time.sleep(5)

# TODO: Refatorar a função para puxar as partidas dos ultimos 2 dias ou outros

def import_match_statistics():
    leagues = League.objects.all()
    matches = Match.objects.filter(league__in=leagues)
    request_count = 0

    for match in matches:
        match_id = match.api_id

        url_stats = f"https://{API_URL}/v3/fixtures/statistics"
        params_stats = {"fixture": match_id}
        response_stats = requests.get(url_stats, headers=HEADERS, params=params_stats)
        request_count += 1

        if response_stats.status_code == 200:
            stats_response = response_stats.json().get("response", [])

            for team_stats in stats_response:
                team_api_id = team_stats.get("team", {}).get("id")
                team_obj = Team.objects.filter(api_id=team_api_id).first()

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

                if team_obj:
                    TeamStatistics.objects.update_or_create(
                        match=match,
                        team=team_obj,
                        defaults=stats_dict
                    )
                else:
                    print(f"Time com API ID {team_api_id} não encontrado para a partida {match_id}")
        else:
            print(f"Erro ao buscar estatísticas da partida {match_id}: {response_stats.status_code}")

        # Aguarda a cada 30 requisições
        if request_count % 30 == 0:
            print("Limite de 30 requisições atingido. Aguardando 100 segundos...")
            time.sleep(100)