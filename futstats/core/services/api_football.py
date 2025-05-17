import requests

# Novo endpoint direto da API-SPORTS
API_URL = "https://v3.football.api-sports.io/teams"

# Sua chave direto do dashboard da API-SPORTS
API_KEY = "7b53f431eccfcb7df388a6041c7a2b89"

# TODO: criar função para importar ligas, times, partidas e as estatisticas
def buscar_ligas():
    headers = {}

def buscar_times(league_id="39", season="2023"):
    headers = {
        "x-apisports-key": API_KEY  # <- header correto da API-Sports
    }

    params = {
        "league": league_id,
        "season": season
    }

    response = requests.get(API_URL, headers=headers, params=params)

    if response.status_code == 200:
        return response.json()["response"]
    else:
        print(f"Erro: {response.status_code} - {response.text}")
        return []
