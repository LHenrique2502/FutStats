# FutStats/core/services/odds_api.py

import os
import httpx
from decimal import Decimal
from dotenv import load_dotenv
from asgiref.sync import sync_to_async
from django.utils.timezone import now, make_aware
from datetime import datetime
from core.models import Match, MatchOdds, Bookmaker, League

load_dotenv()

ODDS_API_KEY = os.getenv("ODDS_API_KEY", "e37d55d58131f9ecc5909b7085a9644e")
ODDS_API_BASE_URL = "https://api.the-odds-api.com/v4"

# Lista de bookmakers brasileiros ou conhecidos no Brasil
BRASIL_BOOKMAKERS = [
    "bet365",           # Bet365 (muito conhecida no Brasil)
    "betfair",          # Betfair
    "betway",           # Betway
    "unibet",           # Unibet
    "pinnacle",         # Pinnacle (muito usada por traders)
    "1xbet",            # 1xBet (popular no Brasil)
    "betano",           # Betano (brasileira)
    "sportingbet",      # Sportingbet (conhecida no Brasil)
    "rivalo",           # Rivalo (brasileira)
    "betboo",           # Betboo (brasileira)
    "betsul",           # Betsul (brasileira)
    "galera",           # Galera Bet (brasileira)
    "estrela",          # Estrela Bet (brasileira)
    "pixbet",           # Pixbet (brasileira)
    "blaze",            # Blaze (conhecida no Brasil)
]

# Lista de bookmakers permitidos para o sistema (edite aqui para adicionar/remover casas)
ALLOWED_BOOKMAKERS = [
    "betway",           # Betway
    # Adicione ou remova casas de apostas desta lista conforme necessário
    # Exemplos de outras casas disponíveis:
    # "bet365",
    # "betfair",
    # "unibet",
    # "pinnacle",
    # "1xbet",
]

# Mapeamento de ligas para sport_key da The Odds API
LEAGUE_TO_SPORT_KEY = {
    "English Premier League": "soccer_epl",
    "Spanish La Liga": "soccer_spain_la_liga",
    "German Bundesliga": "soccer_germany_bundesliga",
    "Italian Serie A": "soccer_italy_serie_a",
    "French Ligue 1": "soccer_france_ligue_one",
    "Brazil Serie A": "soccer_brazil_campeonato",
}


def get_sport_key_for_league(league_name):
    """Retorna o sport_key da The Odds API para uma liga"""
    return LEAGUE_TO_SPORT_KEY.get(league_name, "soccer_epl")  # Default para EPL


def get_allowed_bookmakers():
    """
    Retorna lista de bookmakers permitidos.
    Para alterar as casas de apostas, edite a constante ALLOWED_BOOKMAKERS no topo deste arquivo.
    """
    # Retornar lista em lowercase para comparação (case-insensitive)
    return [bk.lower() for bk in ALLOWED_BOOKMAKERS]


async def get_available_bookmakers(sport_key, regions="us,uk", markets="h2h,totals"):
    """
    Faz uma requisição de teste e retorna lista de bookmakers disponíveis
    """
    url = f"{ODDS_API_BASE_URL}/sports/{sport_key}/odds"
    params = {
        "apiKey": ODDS_API_KEY,
        "regions": regions,
        "markets": markets,
        "oddsFormat": "decimal",
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if not isinstance(data, list) or len(data) == 0:
                return []
            
            # Extrair todos os bookmakers únicos
            bookmakers = set()
            for event in data:
                for bookmaker in event.get("bookmakers", []):
                    bookmakers.add(bookmaker.get("key", ""))
            
            return list(bookmakers)
        except Exception as e:
            print(f"❌ Erro ao buscar bookmakers disponíveis: {e}")
            return []


async def fetch_odds_for_sport(sport_key, regions="us,uk", markets="h2h,totals"):
    """
    Busca odds para um esporte específico
    Nota: BTTS não está disponível no plano gratuito da The Odds API
    """
    url = f"{ODDS_API_BASE_URL}/sports/{sport_key}/odds"
    params = {
        "apiKey": ODDS_API_KEY,
        "regions": regions,
        "markets": markets,
        "oddsFormat": "decimal",  # Usar formato decimal
    }
    
    print(f"🔗 Buscando odds: {sport_key}")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, params=params)
            response.raise_for_status()
            
            # Verificar quota
            remaining = response.headers.get("x-requests-remaining", "unknown")
            used = response.headers.get("x-requests-used", "unknown")
            print(f"📊 Quota: {used} usadas, {remaining} restantes")
            
            data = response.json()
            print(f"📥 Recebidos {len(data) if isinstance(data, list) else 0} eventos da API")
            
            # Debug: mostrar primeiros eventos
            if isinstance(data, list) and len(data) > 0:
                print(f"📋 Primeiro evento recebido:")
                print(f"   Home: {data[0].get('home_team', 'N/A')}")
                print(f"   Away: {data[0].get('away_team', 'N/A')}")
                print(f"   Data: {data[0].get('commence_time', 'N/A')}")
                print(f"   Bookmakers: {len(data[0].get('bookmakers', []))}")
            
            return data
        except httpx.HTTPStatusError as e:
            print(f"❌ Erro HTTP ao buscar odds: {e.response.status_code}")
            if e.response.status_code == 429:
                print("⚠️ Rate limit atingido. Aguarde alguns segundos.")
            try:
                error_text = e.response.text[:200]
                print(f"   Resposta: {error_text}")
            except:
                pass
            return None
        except Exception as e:
            print(f"❌ Erro ao buscar odds: {e}")
            import traceback
            traceback.print_exc()
            return None


def normalize_team_name(team_name):
    """
    Normaliza nomes de times para melhor matching
    Remove espaços extras, converte para lowercase, etc.
    """
    if not team_name:
        return ""
    return team_name.strip().lower().replace(" fc", "").replace(" cf", "").replace(" fc", "")


def find_matching_match(odds_event, matches):
    """
    Tenta encontrar um Match no banco que corresponda ao evento da API de odds
    """
    odds_home = normalize_team_name(odds_event.get("home_team", ""))
    odds_away = normalize_team_name(odds_event.get("away_team", ""))
    odds_date = odds_event.get("commence_time")
    
    if not odds_date:
        return None
    
    try:
        # Converter data da API (ISO format)
        event_datetime = datetime.fromisoformat(odds_date.replace("Z", "+00:00"))
    except Exception as e:
        return None
    
    # Procurar match por nome dos times e data próxima (mais flexível - até 24 horas)
    best_match = None
    best_score = 0
    
    for match in matches:
        match_home = normalize_team_name(match.home_team.name)
        match_away = normalize_team_name(match.away_team.name)
        
        # Calcular score de matching (0-2)
        score = 0
        
        # Verificar matching de times (home/home e away/away)
        if odds_home and match_home:
            if odds_home == match_home:
                score += 1
            elif odds_home in match_home or match_home in odds_home:
                score += 0.5
        
        if odds_away and match_away:
            if odds_away == match_away:
                score += 1
            elif odds_away in match_away or match_away in odds_away:
                score += 0.5
        
        # Verificar data (mais flexível - até 24 horas de diferença)
        if match.date:
            time_diff = abs((event_datetime - match.date).total_seconds())
            if time_diff < 86400:  # 24 horas
                if score > best_score:
                    best_score = score
                    best_match = match
        
        # Tentar também com times invertidos
        if not best_match or best_score < 1.5:
            score_inv = 0
            
            if odds_home and match_away:
                if odds_home == match_away:
                    score_inv += 1
                elif odds_home in match_away or match_away in odds_home:
                    score_inv += 0.5
            
            if odds_away and match_home:
                if odds_away == match_home:
                    score_inv += 1
                elif odds_away in match_home or match_home in odds_away:
                    score_inv += 0.5
            
            if match.date:
                time_diff = abs((event_datetime - match.date).total_seconds())
                if time_diff < 86400 and score_inv > best_score:
                    best_score = score_inv
                    best_match = match
    
    # Só retornar se o score for bom o suficiente (pelo menos 1.5)
    if best_match and best_score >= 1.5:
        return best_match
    
    return None


async def process_and_save_odds(odds_data, league=None, days_ahead=1):
    """
    Processa dados de odds da API e salva no banco
    days_ahead: quantos dias à frente buscar (padrão 1 = apenas hoje)
    """
    if not odds_data:
        print("⚠️ Nenhum dado de odds recebido")
        return
    
    if not isinstance(odds_data, list):
        print(f"⚠️ Formato de dados inesperado: {type(odds_data)}")
        return
    
    # Obter lista de bookmakers permitidos
    allowed_bookmakers = get_allowed_bookmakers()
    print(f"🔒 Filtrando bookmakers: {', '.join(allowed_bookmakers)}")
    
    print(f"\n📊 Processando {len(odds_data)} eventos da API...")
    
    # Buscar partidas de hoje até X dias à frente
    from datetime import timedelta
    
    current_time = now()  # Usar a função now() importada do topo
    start_date = current_time.replace(hour=0, minute=0, second=0, microsecond=0)  # Início de hoje
    end_date = start_date + timedelta(days=days_ahead)  # Fim do período
    
    print(f"📅 Buscando partidas entre {start_date.strftime('%d/%m/%Y %H:%M')} e {end_date.strftime('%d/%m/%Y %H:%M')}")
    
    matches_query = Match.objects.filter(
        date__gte=start_date,
        date__lt=end_date
    ).select_related("home_team", "away_team", "league")
    
    if league:
        matches_query = matches_query.filter(league=league)
        print(f"🔍 Filtrando por liga: {league.name}")
    
    matches = await sync_to_async(list)(matches_query)
    print(f"📋 Encontradas {len(matches)} partidas no banco para matching")
    
    if len(matches) == 0:
        print("⚠️ Nenhuma partida encontrada no banco para o período!")
        print(f"   Período: {start_date.strftime('%d/%m/%Y')} até {end_date.strftime('%d/%m/%Y')}")
        print("   Dica: Execute primeiro o comando para importar partidas")
        
        # Mostrar quantas partidas existem no total
        total_matches = await sync_to_async(Match.objects.count)()
        future_matches = await sync_to_async(Match.objects.filter(date__gte=current_time).count)()
        print(f"   Total de partidas no banco: {total_matches}")
        print(f"   Partidas futuras no banco: {future_matches}")
        return
    
    # Mostrar algumas partidas encontradas
    print(f"\n📋 Exemplos de partidas encontradas:")
    for match in matches[:3]:
        print(f"   - {match.home_team.name} x {match.away_team.name} ({match.date.strftime('%d/%m %H:%M')})")
    
    saved_count = 0
    matched_count = 0
    unmatched_events = []
    
    for event in odds_data:
        # Tentar encontrar match correspondente
        match = find_matching_match(event, matches)
        
        if not match:
            unmatched_events.append({
                "home": event.get("home_team"),
                "away": event.get("away_team"),
                "date": event.get("commence_time")
            })
            continue
        
        matched_count += 1
        
        event_id = event.get("id")
        
        # Processar cada bookmaker
        for bookmaker_data in event.get("bookmakers", []):
            bookmaker_key = bookmaker_data.get("key")
            bookmaker_title = bookmaker_data.get("title", bookmaker_key)
            
            # Filtrar bookmakers permitidos
            if bookmaker_key.lower() not in allowed_bookmakers:
                continue  # Pular bookmakers não permitidos
            
            # Criar ou buscar bookmaker e marcar se é brasileiro
            is_brazilian = bookmaker_key.lower() in [b.lower() for b in BRASIL_BOOKMAKERS]
            bookmaker, created = await sync_to_async(Bookmaker.objects.get_or_create)(
                api_key=bookmaker_key,
                defaults={"name": bookmaker_title, "is_brazilian": is_brazilian}
            )
            # Atualizar flag is_brazilian se já existia
            if not created and bookmaker.is_brazilian != is_brazilian:
                bookmaker.is_brazilian = is_brazilian
                await sync_to_async(bookmaker.save)()
            
            # Processar markets
            home_win = None
            draw = None
            away_win = None
            over_25 = None
            under_25 = None
            btts_yes = None
            btts_no = None
            
            for market in bookmaker_data.get("markets", []):
                market_key = market.get("key")
                outcomes = market.get("outcomes", [])
                
                if market_key == "h2h":
                    # Head to head (1X2)
                    for outcome in outcomes:
                        name = outcome.get("name", "").lower()
                        price = outcome.get("price")
                        
                        if not price:
                            continue
                        
                        # Tentar identificar qual time é qual
                        if match.home_team.name.lower() in name or name in match.home_team.name.lower():
                            home_win = Decimal(str(price))
                        elif match.away_team.name.lower() in name or name in match.away_team.name.lower():
                            away_win = Decimal(str(price))
                        elif "draw" in name or "empate" in name or "tie" in name:
                            draw = Decimal(str(price))
                
                elif market_key == "totals":
                    # Over/Under
                    for outcome in outcomes:
                        name = outcome.get("name", "").lower()
                        point = outcome.get("point")
                        price = outcome.get("price")
                        
                        if not price or not point:
                            continue
                        
                        # Verificar se é Over/Under 2.5
                        if abs(float(point) - 2.5) < 0.1:
                            if "over" in name:
                                over_25 = Decimal(str(price))
                            elif "under" in name:
                                under_25 = Decimal(str(price))
                
                elif market_key == "btts":
                    # Both Teams To Score
                    for outcome in outcomes:
                        name = outcome.get("name", "").lower()
                        price = outcome.get("price")
                        
                        if not price:
                            continue
                        
                        if "yes" in name or "sim" in name:
                            btts_yes = Decimal(str(price))
                        elif "no" in name or "não" in name:
                            btts_no = Decimal(str(price))
            
            # Salvar odds apenas se tiver pelo menos uma odd válida
            if any([home_win, draw, away_win, over_25, under_25, btts_yes, btts_no]):
                match_odds, created = await sync_to_async(MatchOdds.objects.update_or_create)(
                    match=match,
                    bookmaker=bookmaker,
                    defaults={
                        "home_win_odd": home_win,
                        "draw_odd": draw,
                        "away_win_odd": away_win,
                        "over_25_odd": over_25,
                        "under_25_odd": under_25,
                        "btts_yes_odd": btts_yes,
                        "btts_no_odd": btts_no,
                        "odds_api_event_id": event_id,
                        "last_api_fetch": now(),  # Marcar quando foi buscado da API
                        "last_updated": now(),  # Usar a função now() importada do topo
                    }
                )
                
                if created:
                    saved_count += 1
                    print(f"✅ Odds salvas: {match} - {bookmaker.name}")
    
    print(f"\n📊 Resumo:")
    print(f"   Eventos da API: {len(odds_data)}")
    print(f"   Matches encontrados: {matched_count}")
    print(f"   Odds salvas: {saved_count}")
    print(f"   Eventos sem match: {len(unmatched_events)}")
    
    # Mostrar alguns exemplos de eventos não encontrados
    if unmatched_events and len(unmatched_events) > 0:
        print(f"\n⚠️ Exemplos de eventos não encontrados:")
        for i, event in enumerate(unmatched_events[:3], 1):
            print(f"   {i}. {event['home']} x {event['away']} ({event['date']})")


async def import_odds_for_league(league, days_ahead=1):
    """
    Importa odds para uma liga específica
    days_ahead: quantos dias à frente buscar (padrão 1 = apenas hoje)
    """
    sport_key = get_sport_key_for_league(league.name)
    print(f"\n🔍 Buscando odds para {league.name} (sport_key: {sport_key})")
    
    # Buscar apenas h2h e totals (btts não disponível no plano gratuito)
    odds_data = await fetch_odds_for_sport(sport_key, markets="h2h,totals")
    
    if odds_data:
        await process_and_save_odds(odds_data, league, days_ahead)
    else:
        print(f"⚠️ Nenhuma odd encontrada para {league.name}")


async def import_all_odds(days_ahead=1, force=False, smart=True):
    """
    Importa odds para todas as ligas configuradas
    days_ahead: quantos dias à frente buscar (padrão 1 = apenas hoje)
    force: se True, força atualização mesmo se odds são recentes
    smart: se True, verifica se precisa atualizar antes de fazer requisição
    """
    from datetime import timedelta
    
    print("\n🚀 Iniciando importação de odds...")
    print(f"📅 Buscando odds para os próximos {days_ahead} dia(s)")
    if smart and not force:
        print("🧠 Modo inteligente ativado (verificando necessidade de atualização)")
    if force:
        print("⚡ Modo forçado ativado (atualizando todas as ligas)")
    
    leagues = await sync_to_async(list)(
        League.objects.filter(name__in=LEAGUE_TO_SPORT_KEY.keys())
    )
    
    if not leagues:
        print("⚠️ Nenhuma liga configurada encontrada.")
        all_leagues = await sync_to_async(list)(League.objects.values_list('name', flat=True))
        print(f"   Ligas no banco: {list(all_leagues)}")
        print(f"   Ligas configuradas: {list(LEAGUE_TO_SPORT_KEY.keys())}")
        return
    
    print(f"✅ Encontradas {len(leagues)} ligas configuradas")
    
    requests_made = 0
    requests_skipped = 0
    
    for league in leagues:
        if smart and not force:
            # Verificar se há partidas que precisam de atualização
            current_time = now()
            start_date = current_time.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = start_date + timedelta(days=days_ahead)
            
            # Buscar partidas futuras desta liga
            matches = await sync_to_async(list)(
                Match.objects.filter(
                    league=league,
                    date__gte=start_date,
                    date__lt=end_date
                )
            )
            
            if matches:
                # Verificar se todas as partidas têm odds recentes (< 6 horas)
                needs_update = False
                for match in matches:
                    recent_odds = await sync_to_async(MatchOdds.objects.filter(
                        match=match,
                        last_api_fetch__gte=current_time - timedelta(hours=6)
                    ).exists)()
                    if not recent_odds:
                        needs_update = True
                        break
                
                if not needs_update:
                    print(f"⏭️  Pulando {league.name}: odds já atualizadas recentemente")
                    requests_skipped += 1
                    continue
        
        # Fazer requisição
        await import_odds_for_league(league, days_ahead)
        requests_made += 1
        
        # Pequeno delay para evitar rate limit
        import asyncio
        await asyncio.sleep(2)
    
    print(f"\n📊 Estatísticas de quota:")
    print(f"   Requisições feitas: {requests_made}")
    print(f"   Requisições economizadas: {requests_skipped}")
    print(f"   Economia estimada: {requests_skipped} créditos")
    print("\n✅ Importação de odds concluída!")
