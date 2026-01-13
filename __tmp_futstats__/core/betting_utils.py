# FutStats/core/betting_utils.py

from decimal import Decimal
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from .models import MatchOdds, BetRecommendation, Bookmaker, Match
from .utils import calcular_over25, calcular_btts, calcular_media_gols, preload_ultimos_jogos


def odd_to_implied_probability(odd):
    """
    Converte odd decimal em probabilidade implícita
    Ex: odd 2.0 = 50% de probabilidade
    """
    if not odd or odd <= 0:
        return None
    return float(Decimal('100') / Decimal(str(odd)))


def calculate_expected_value(calculated_prob, odd):
    """
    Calcula o valor esperado (Expected Value)
    EV = (probabilidade_calculada * odd) - 1
    
    EV > 0 = aposta com valor
    EV < 0 = aposta sem valor
    """
    if not odd or odd <= 0:
        return None
    
    prob_decimal = Decimal(str(calculated_prob)) / Decimal('100')
    ev = (prob_decimal * Decimal(str(odd))) - Decimal('1')
    return float(ev * 100)  # Retorna em porcentagem


def calculate_value_percentage(calculated_prob, implied_prob):
    """
    Calcula a diferença percentual entre probabilidade calculada e implícita
    """
    if not implied_prob or implied_prob <= 0:
        return None
    
    diff = calculated_prob - implied_prob
    value_pct = (diff / implied_prob) * 100
    return value_pct


def analyze_match_betting_value(match, cache=None):
    """
    Analisa uma partida e identifica apostas com valor
    Retorna lista de recomendações
    """
    if cache is None:
        cache = preload_ultimos_jogos()
    
    home = match.home_team
    away = match.away_team
    
    # Buscar odds disponíveis para esta partida
    odds_list = MatchOdds.objects.filter(match=match).select_related('bookmaker')
    
    if not odds_list.exists():
        return []  # Sem odds disponíveis
    
    recommendations = []
    
    # Calcular probabilidades baseadas em estatísticas
    over25_prob = (calcular_over25(home, cache) + calcular_over25(away, cache)) / 2
    btts_prob = (calcular_btts(home, cache) + calcular_btts(away, cache)) / 2
    
    # Analisar cada odd disponível
    for match_odd in odds_list:
        bookmaker = match_odd.bookmaker
        
        # Analisar Over 2.5
        if match_odd.over_25_odd:
            implied_prob = odd_to_implied_probability(match_odd.over_25_odd)
            if implied_prob:
                ev = calculate_expected_value(over25_prob, match_odd.over_25_odd)
                value_pct = calculate_value_percentage(over25_prob, implied_prob)
                
                if ev and ev > 0:  # Value bet encontrado
                    recommendation = BetRecommendation(
                        match=match,
                        bet_type='over_25',
                        calculated_probability=Decimal(str(over25_prob)),
                        implied_probability=Decimal(str(implied_prob)),
                        odd_value=match_odd.over_25_odd,
                        expected_value=Decimal(str(ev)),
                        value_percentage=Decimal(str(value_pct)),
                        is_value_bet=True,
                        confidence='high' if value_pct > 10 else 'medium' if value_pct > 5 else 'low',
                        bookmaker=bookmaker
                    )
                    recommendations.append(recommendation)
        
        # Analisar BTTS
        if match_odd.btts_yes_odd:
            implied_prob = odd_to_implied_probability(match_odd.btts_yes_odd)
            if implied_prob:
                ev = calculate_expected_value(btts_prob, match_odd.btts_yes_odd)
                value_pct = calculate_value_percentage(btts_prob, implied_prob)
                
                if ev and ev > 0:
                    recommendation = BetRecommendation(
                        match=match,
                        bet_type='btts_yes',
                        calculated_probability=Decimal(str(btts_prob)),
                        implied_probability=Decimal(str(implied_prob)),
                        odd_value=match_odd.btts_yes_odd,
                        expected_value=Decimal(str(ev)),
                        value_percentage=Decimal(str(value_pct)),
                        is_value_bet=True,
                        confidence='high' if value_pct > 10 else 'medium' if value_pct > 5 else 'low',
                        bookmaker=bookmaker
                    )
                    recommendations.append(recommendation)
    
    return recommendations


def get_best_value_bets(limit=10):
    """
    Retorna as melhores apostas com valor disponíveis
    """
    # Buscar partidas a partir do início de hoje até 3 dias à frente
    current_time = timezone.now()
    start_date = current_time.replace(hour=0, minute=0, second=0, microsecond=0)  # Início de hoje
    future_date = start_date + timedelta(days=3)  # 3 dias à frente
    
    matches = Match.objects.filter(
        date__gte=start_date,  # A partir do início de hoje
        date__lte=future_date
    ).select_related('home_team', 'away_team', 'league')
    
    cache = preload_ultimos_jogos()
    all_recommendations = []
    
    for match in matches:
        recommendations = analyze_match_betting_value(match, cache)
        all_recommendations.extend(recommendations)
    
    # Ordenar por valor esperado (maior primeiro)
    all_recommendations.sort(key=lambda x: x.expected_value, reverse=True)
    
    # Salvar no banco (limpar recomendações antigas primeiro)
    BetRecommendation.objects.filter(match__date__gte=start_date).delete()
    
    for rec in all_recommendations:
        rec.save()
    
    return all_recommendations[:limit]


def get_best_probabilities(limit=10):
    """
    Retorna as melhores probabilidades de cada tipo de aposta bater
    Ordena por probabilidade calculada (maior primeiro)
    """
    # Buscar partidas a partir do início de hoje até 3 dias à frente
    current_time = timezone.now()
    start_date = current_time.replace(hour=0, minute=0, second=0, microsecond=0)  # Início de hoje
    future_date = start_date + timedelta(days=3)  # 3 dias à frente
    
    matches = Match.objects.filter(
        date__gte=start_date,  # A partir do início de hoje
        date__lte=future_date
    ).select_related('home_team', 'away_team', 'league')
    
    print(f"🔍 DEBUG: Buscando partidas entre {start_date.strftime('%d/%m/%Y %H:%M')} e {future_date.strftime('%d/%m/%Y %H:%M')}")
    print(f"🔍 DEBUG: Encontradas {matches.count()} partidas futuras")
    
    cache = preload_ultimos_jogos()
    all_probabilities = []
    
    matches_with_odds = 0
    matches_without_odds = 0
    
    for match in matches:
        home = match.home_team
        away = match.away_team
        
        # Buscar odds disponíveis para esta partida
        odds_list = MatchOdds.objects.filter(match=match).select_related('bookmaker')
        
        if not odds_list.exists():
            matches_without_odds += 1
            continue
        
        matches_with_odds += 1
        print(f"✅ DEBUG: {match.home_team.name} x {match.away_team.name} tem {odds_list.count()} odds")
        
        # Calcular probabilidades baseadas em estatísticas
        over25_prob = (calcular_over25(home, cache) + calcular_over25(away, cache)) / 2
        btts_prob = (calcular_btts(home, cache) + calcular_btts(away, cache)) / 2
        
        # Calcular médias de gols para 1X2
        home_goals_avg = calcular_media_gols(home, cache)
        away_goals_avg = calcular_media_gols(away, cache)
        
        # 🔍 LOGS DETALHADOS PARA DIAGNÓSTICO
        home_jogos = cache.get(home.id, [])
        away_jogos = cache.get(away.id, [])
        
        print(f"   📊 ESTATÍSTICAS DO TIME CASA ({home.name}):")
        print(f"      - Jogos no cache: {len(home_jogos)}")
        print(f"      - Jogos com placar: {sum(1 for j in home_jogos if j.home_score is not None and j.away_score is not None)}")
        if home_jogos:
            jogos_com_placar = [j for j in home_jogos if j.home_score is not None and j.away_score is not None]
            if jogos_com_placar:
                placares = []
                for j in jogos_com_placar[:3]:
                    if j.home_team_id == home.id:
                        placares.append(f"{j.home_score}x{j.away_score}")
                    else:
                        placares.append(f"{j.away_score}x{j.home_score}")
                print(f"      - Últimos placares: {placares}")
        print(f"      - Média de gols: {home_goals_avg}")
        print(f"      - Over 2.5: {calcular_over25(home, cache)}%")
        
        print(f"   📊 ESTATÍSTICAS DO TIME VISITANTE ({away.name}):")
        print(f"      - Jogos no cache: {len(away_jogos)}")
        print(f"      - Jogos com placar: {sum(1 for j in away_jogos if j.home_score is not None and j.away_score is not None)}")
        if away_jogos:
            jogos_com_placar = [j for j in away_jogos if j.home_score is not None and j.away_score is not None]
            if jogos_com_placar:
                placares = []
                for j in jogos_com_placar[:3]:
                    if j.home_team_id == away.id:
                        placares.append(f"{j.home_score}x{j.away_score}")
                    else:
                        placares.append(f"{j.away_score}x{j.home_score}")
                print(f"      - Últimos placares: {placares}")
        print(f"      - Média de gols: {away_goals_avg}")
        print(f"      - Over 2.5: {calcular_over25(away, cache)}%")
        
        print(f"   Prob Over 2.5: {over25_prob}%, Prob BTTS: {btts_prob}%")
        print(f"   Média gols casa: {home_goals_avg}, visitante: {away_goals_avg}")
        
        # Calcular diferença de gols
        diff_gols = home_goals_avg - away_goals_avg
        print(f"   🔢 Diferença de gols: {diff_gols}")
        
        # Analisar cada odd disponível
        for match_odd in odds_list:
            bookmaker = match_odd.bookmaker
            
            # Over 2.5 - ADICIONAR LOG
            if match_odd.over_25_odd:
                implied_prob = odd_to_implied_probability(match_odd.over_25_odd)
                if implied_prob:
                    all_probabilities.append({
                        "match": match,
                        "bet_type": "over_25",
                        "bet_name": "Mais de 2.5 Gols",
                        "calculated_probability": round(over25_prob, 2),
                        "implied_probability": implied_prob,
                        "odd": match_odd.over_25_odd,
                        "bookmaker": bookmaker,
                        "difference": round(over25_prob - implied_prob, 2),
                    })
                    print(f"   ✅ Over 2.5: odd {match_odd.over_25_odd}, prob calculada {over25_prob}%, implícita {implied_prob}%")
            else:
                print(f"   ⚠️ Over 2.5 odd não disponível para {bookmaker.name}")
            
            # BTTS (se disponível)
            if match_odd.btts_yes_odd:
                implied_prob = odd_to_implied_probability(match_odd.btts_yes_odd)
                if implied_prob:
                    all_probabilities.append({
                        "match": match,
                        "bet_type": "btts_yes",
                        "bet_name": "Ambos Marcam (BTTS)",
                        "calculated_probability": round(btts_prob, 2),
                        "implied_probability": implied_prob,
                        "odd": match_odd.btts_yes_odd,
                        "bookmaker": bookmaker,
                        "difference": round(btts_prob - implied_prob, 2),
                    })
            
            # 1X2 (Home Win) - MELHORAR CÁLCULO
            if match_odd.home_win_odd:
                implied_prob = odd_to_implied_probability(match_odd.home_win_odd)
                if implied_prob:
                    # Melhorar cálculo: usar diferença de gols e considerar vantagem de casa
                    diff_gols = home_goals_avg - away_goals_avg
                    
                    # Base: 33.33% (chance igual para cada resultado)
                    # Vantagem de casa: +10%
                    # Diferença de gols: ajuste proporcional
                    base_prob = 33.33
                    home_advantage = 10
                    goal_diff_factor = diff_gols * 8  # Cada gol de diferença = 8% de ajuste
                    
                    home_win_prob = base_prob + home_advantage + goal_diff_factor
                    home_win_prob = max(15, min(75, home_win_prob))  # Limitar entre 15% e 75%
                    
                    print(f"   🎯 CÁLCULO HOME WIN ({bookmaker.name}):")
                    print(f"      - Base: {base_prob}%")
                    print(f"      - Vantagem casa: +{home_advantage}%")
                    print(f"      - Diferença gols ({diff_gols}): {goal_diff_factor}%")
                    print(f"      - TOTAL: {home_win_prob}%")
                    
                    all_probabilities.append({
                        "match": match,
                        "bet_type": "home_win",
                        "bet_name": f"Vitória {home.name}",
                        "calculated_probability": round(home_win_prob, 2),
                        "implied_probability": implied_prob,
                        "odd": match_odd.home_win_odd,
                        "bookmaker": bookmaker,
                        "difference": round(home_win_prob - implied_prob, 2),
                    })
            
            # 1X2 (Away Win) - MELHORAR CÁLCULO
            if match_odd.away_win_odd:
                implied_prob = odd_to_implied_probability(match_odd.away_win_odd)
                if implied_prob:
                    diff_gols = away_goals_avg - home_goals_avg
                    
                    base_prob = 33.33
                    away_advantage = -5  # Desvantagem de jogar fora
                    goal_diff_factor = diff_gols * 8
                    
                    away_win_prob = base_prob + away_advantage + goal_diff_factor
                    away_win_prob = max(15, min(75, away_win_prob))
                    
                    print(f"   🎯 CÁLCULO AWAY WIN ({bookmaker.name}):")
                    print(f"      - Base: {base_prob}%")
                    print(f"      - Desvantagem fora: {away_advantage}%")
                    print(f"      - Diferença gols ({diff_gols}): {goal_diff_factor}%")
                    print(f"      - TOTAL: {away_win_prob}%")
                    
                    all_probabilities.append({
                        "match": match,
                        "bet_type": "away_win",
                        "bet_name": f"Vitória {away.name}",
                        "calculated_probability": round(away_win_prob, 2),
                        "implied_probability": implied_prob,
                        "odd": match_odd.away_win_odd,
                        "bookmaker": bookmaker,
                        "difference": round(away_win_prob - implied_prob, 2),
                    })
            
            # 1X2 (Draw) - MELHORAR CÁLCULO
            if match_odd.draw_odd:
                implied_prob = odd_to_implied_probability(match_odd.draw_odd)
                if implied_prob:
                    # Empate geralmente entre 20-30%, ajustar baseado em quão equilibrados são os times
                    diff_gols = abs(home_goals_avg - away_goals_avg)
                    # Quanto mais equilibrados, maior chance de empate
                    draw_prob = 30 - (diff_gols * 3)  # Cada gol de diferença reduz 3%
                    draw_prob = max(20, min(35, draw_prob))
                    
                    all_probabilities.append({
                        "match": match,
                        "bet_type": "draw",
                        "bet_name": "Empate",
                        "calculated_probability": round(draw_prob, 2),
                        "implied_probability": implied_prob,
                        "odd": match_odd.draw_odd,
                        "bookmaker": bookmaker,
                        "difference": round(draw_prob - implied_prob, 2),
                    })
    
    print(f"📊 DEBUG: Total de probabilidades encontradas (antes de agrupar): {len(all_probabilities)}")
    print(f"📊 DEBUG: Partidas com odds: {matches_with_odds}, sem odds: {matches_without_odds}")
    
    # Agrupar por (match, bet_type) e escolher a melhor odd para cada mercado
    # Usar um dicionário para agrupar: {(match_id, bet_type): melhor_probabilidade}
    grouped_probabilities = {}
    
    for prob in all_probabilities:
        match_id = prob["match"].id
        bet_type = prob["bet_type"]
        key = (match_id, bet_type)
        
        # Se já existe uma entrada para este mercado, comparar e manter a melhor odd
        if key in grouped_probabilities:
            existing = grouped_probabilities[key]
            # Manter a maior odd (melhor para o apostador)
            if prob["odd"] > existing["odd"]:
                grouped_probabilities[key] = prob
        else:
            grouped_probabilities[key] = prob
    
    # Converter de volta para lista
    unique_probabilities = list(grouped_probabilities.values())
    
    print(f"📊 DEBUG: Total de probabilidades após agrupar: {len(unique_probabilities)}")
    
    # Ordenar por probabilidade calculada (maior primeiro)
    unique_probabilities.sort(key=lambda x: x["calculated_probability"], reverse=True)
    
    return unique_probabilities[:limit]
