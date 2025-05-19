import requests
from core.models import League, Team

# Endpoint e chave da API-Football via RapidAPI
API_URL = "api-football-v1.p.rapidapi.com"
API_KEY = "8eddef054cmsh7d4c542a9644e3ep11ef9ejsneb25932abe3f"

# Cabeçalhos necessários para autenticação da API
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
                    "country": country["name"],  # pegar do campo correto
                    "logo": league["logo"],
                    "season": current_season["year"],
                        }
                    )
    else:
        print(f"Erro ao buscar ligas: {response.status_code} - {response.text}")

def get_teams():
    # Pega as ligas atuais no banco
    ligas_atuais = [39, 140, 61, 135, 78, 71]  # Premier, Espanhol, Francês, Italiano, Alemão, Brasileiro
    
    for liga in ligas_atuais:
        url = f"https://{API_URL}/v3/teams"
        params = {
            "league": liga.api_id,
            "season": liga.season
        }
        response = requests.get(url, headers=HEADERS, params=params)
        
        if response.status_code == 200:
            data = response.json()
            for item in data["response"]:
                team = item["team"]
                
                # Salva ou atualiza o time no banco
                Team.objects.update_or_create(
                    api_id=team["id"],
                    defaults={
                        "name": team["name"],
                        "code": team["logo"],
                        # adicione outros campos do seu model Team aqui
                    }
                )
        else:
            print(f"Erro ao buscar times da liga {liga.name}: {response.status_code} - {response.text}")