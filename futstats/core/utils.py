from django.db.models import Q, Count
from .models import Match, MatchEvent, TeamStatistics
from datetime import date


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
def _smoothed_percent(hits, n, alpha=1, beta=1, max_pct=95):
    """
    Suaviza probabilidades para evitar 0%/100% em amostras pequenas.
    p = (hits + alpha) / (n + alpha + beta)

    - alpha=beta=1 equivale a Laplace smoothing.
    - max_pct limita o teto (evita "certeza" mesmo com amostra grande).
    """
    if not n or n <= 0:
        return 0
    p = (hits + alpha) / (n + alpha + beta)
    pct = int(round(p * 100))

    # Se a amostra for pequena, limita ainda mais para evitar números "agressivos"
    # (ex.: n=1 nunca deve sugerir algo perto de certeza).
    effective_max = max_pct if n >= 5 else min(max_pct, 85)

    return min(effective_max, max(0, pct))


def calcular_over25(team, cache):
    jogos = cache.get(team.id, [])
    if not jogos:
        return 0

    hits = sum(
        1 for match in jogos
        if match.home_score is not None and match.away_score is not None
        and (match.home_score + match.away_score) >= 3
    )

    return _smoothed_percent(hits, len(jogos))


def calcular_btts(team, cache):
    jogos = cache.get(team.id, [])
    if not jogos:
        return 0

    hits = sum(
        1 for match in jogos
        if match.home_score is not None and match.away_score is not None
        and match.home_score > 0 and match.away_score > 0
    )

    return _smoothed_percent(hits, len(jogos))


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
# ✅ Função para obter range de datas de uma season
# ============================================================
def get_season_date_range(season_str):
    """
    Recebe uma string de season (ex: "2024-2025" ou "2024") 
    e retorna (data_inicio, data_fim) como objetos date.
    
    Para formato "YYYY-YYYY": início em agosto do primeiro ano, fim em maio do segundo ano
    Para formato "YYYY": início em janeiro, fim em dezembro do mesmo ano
    """
    if not season_str:
        return None, None
    
    try:
        # Formato "2024-2025"
        if '-' in season_str:
            parts = season_str.split('-')
            if len(parts) == 2:
                ano_inicio = int(parts[0])
                ano_fim = int(parts[1])
                # Temporada geralmente começa em agosto e termina em maio
                data_inicio = date(ano_inicio, 8, 1)  # 1º de agosto
                data_fim = date(ano_fim, 5, 31)  # 31 de maio
                return data_inicio, data_fim
        # Formato "2024" (apenas ano)
        else:
            ano = int(season_str)
            data_inicio = date(ano, 1, 1)  # 1º de janeiro
            data_fim = date(ano, 12, 31)  # 31 de dezembro
            return data_inicio, data_fim
    except (ValueError, IndexError):
        # Se não conseguir parsear, retorna None
        return None, None
