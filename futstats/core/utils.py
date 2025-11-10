from django.db.models import Q, Count
from .models import Match, MatchEvent, TeamStatistics


def ultimos_jogos(team, limit=5):
    return (
        Match.objects
        .filter(Q(home_team=team) | Q(away_team=team))
        .order_by("-date")
        .all()[:limit]
    )


def calcular_over25(team):
    jogos = ultimos_jogos(team)
    if not jogos:
        return 0
    
    hits = 0
    for match in jogos:
        if match.home_score is not None and match.away_score is not None:
            if match.home_score + match.away_score >= 3:
                hits += 1
    
    return int((hits / len(jogos)) * 100)


def calcular_btts(team):
    jogos = ultimos_jogos(team)
    if not jogos:
        return 0

    hits = 0
    for match in jogos:
        if match.home_score is not None and match.away_score is not None:
            if match.home_score > 0 and match.away_score > 0:
                hits += 1

    return int((hits / len(jogos)) * 100)


def calcular_media_cartoes(team):
    eventos = MatchEvent.objects.filter(
        team=team,
        type="Card"
    )
    jogos = ultimos_jogos(team)
    
    if not jogos:
        return 0
    
    total = eventos.count()
    return round(total / len(jogos), 1)


def calcular_media_escanteios(team):
    stats = TeamStatistics.objects.filter(team=team)
    if not stats:
        return 0
    total = stats.aggregate(total=Count("corner_kicks"))["total"]
    total_corners = sum(stat.corner_kicks or 0 for stat in stats)
    return round(total_corners / total, 1)


def gerar_insights_rapidos(match):
    home = match.home_team
    away = match.away_team

    insights = []

    prob_over = int((calcular_over25(home) + calcular_over25(away)) / 2)
    insights.append({
        "id": "over25",
        "title": "Over 2.5 provável",
        "probability": prob_over
    })

    prob_btts = int((calcular_btts(home) + calcular_btts(away)) / 2)
    insights.append({
        "id": "btts",
        "title": "BTTS possível",
        "probability": prob_btts
    })

    media_cartoes = (calcular_media_cartoes(home) + calcular_media_cartoes(away)) / 2
    insights.append({
        "id": "cards",
        "title": "Média de cartões",
        "probability": media_cartoes
    })

    media_corners = (calcular_media_escanteios(home) + calcular_media_escanteios(away)) / 2
    insights.append({
        "id": "corners",
        "title": "Escanteios por jogo",
        "probability": media_corners
    })

    return insights
