from django.db.models import Q, Count
from .models import Match, MatchEvent, TeamStatistics
from datetime import datetime, date


# ============================================================
# ✅ PRE-CARREGA últimos jogos de TODOS os times
# ============================================================
def preload_ultimos_jogos(limit=5):
    """
    Carrega os últimos `limit` jogos FINALIZADOS de todos os times de uma vez.
    Retorna um dicionário: { team_id: [jogos] }
    """
    # Buscar apenas partidas finalizadas (com placar) e ordenadas por data
    jogos = (
        Match.objects
        .select_related("home_team", "away_team")
        .filter(
            home_score__isnull=False,
            away_score__isnull=False
        )
        .order_by("-date")
        .all()
    )

    cache = {}

    for match in jogos:
        # Home team
        tid_home = match.home_team_id
        cache.setdefault(tid_home, [])
        if len(cache[tid_home]) < limit:
            cache[tid_home].append(match)

        # Away team
        tid_away = match.away_team_id
        cache.setdefault(tid_away, [])
        if len(cache[tid_away]) < limit:
            cache[tid_away].append(match)

    return cache


# ============================================================
# ✅ Funções agora usam o CACHE
# ============================================================
def calcular_over25(team, cache):
    jogos = cache.get(team.id, [])
    if not jogos:
        return 0

    hits = sum(
        1 for match in jogos
        if match.home_score is not None and match.away_score is not None
        and (match.home_score + match.away_score) >= 3
    )

    return int((hits / len(jogos)) * 100)


def calcular_btts(team, cache):
    jogos = cache.get(team.id, [])
    if not jogos:
        return 0

    hits = sum(
        1 for match in jogos
        if match.home_score is not None and match.away_score is not None
        and match.home_score > 0 and match.away_score > 0
    )

    return int((hits / len(jogos)) * 100)


def calcular_media_cartoes(team, cache):
    jogos = cache.get(team.id, [])
    if not jogos:
        return 0

    eventos = MatchEvent.objects.filter(
        Q(team=team),
        type="Card"
    ).count()

    return round(eventos / len(jogos), 1)


def calcular_media_escanteios(team, cache):
    stats = TeamStatistics.objects.filter(team=team)
    if not stats.exists():
        return 0

    total_games = stats.count()
    total_corners = sum(stat.corner_kicks or 0 for stat in stats)

    return round(total_corners / total_games, 1)


def calcular_media_gols(team, cache):
    jogos = cache.get(team.id, [])
    if not jogos:
        return 0

    total = 0
    count = 0

    for match in jogos:
        if match.home_score is not None and match.away_score is not None:
            total += match.home_score if match.home_team_id == team.id else match.away_score
            count += 1

    return round(total / count, 2) if count else 0


# ============================================================
# ✅ Insights que agora usam o CACHE
# ============================================================
def gerar_insights_rapidos(match, cache):
    home = match.home_team
    away = match.away_team

    insights = []

    insights.append({
        "id": "over25",
        "title": "Over 2.5 provável",
        "probability": int(
            (calcular_over25(home, cache) + calcular_over25(away, cache)) / 2
        ),
    })

    insights.append({
        "id": "btts",
        "title": "BTTS possível",
        "probability": int(
            (calcular_btts(home, cache) + calcular_btts(away, cache)) / 2
        ),
    })

    insights.append({
        "id": "cards",
        "title": "Média de cartões",
        "probability": (calcular_media_cartoes(home, cache) +
                        calcular_media_cartoes(away, cache)) / 2,
    })

    insights.append({
        "id": "corners",
        "title": "Escanteios por jogo",
        "probability": (calcular_media_escanteios(home, cache) +
                        calcular_media_escanteios(away, cache)) / 2,
    })

    return insights


# ============================================================
# ✅ Função auxiliar para determinar range de datas de uma season
# ============================================================
def get_season_date_range(season_str):
    """
    Determina o range de datas de uma season.
    
    Suporta dois formatos:
    - "2026" (formato brasileiro): janeiro a dezembro de 2026
    - "2024-2025" (formato europeu): agosto de 2024 a maio de 2025
    
    Retorna uma tupla (data_inicio, data_fim)
    """
    if not season_str:
        return None, None
    
    # Formato brasileiro: "2026"
    if '-' not in season_str:
        try:
            year = int(season_str)
            start_date = date(year, 1, 1)
            end_date = date(year, 12, 31)
            return start_date, end_date
        except ValueError:
            return None, None
    
    # Formato europeu: "2024-2025"
    try:
        parts = season_str.split('-')
        if len(parts) == 2:
            start_year = int(parts[0])
            end_year = int(parts[1])
            # Temporada europeia: agosto do ano inicial até maio do ano final
            start_date = date(start_year, 8, 1)
            end_date = date(end_year, 5, 31)
            return start_date, end_date
    except ValueError:
        pass
    
    return None, None
