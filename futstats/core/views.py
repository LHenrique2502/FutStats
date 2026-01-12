from .utils import gerar_insights_rapidos, calcular_over25, calcular_media_gols, get_season_date_range
from django.utils import timezone
from rest_framework.response import Response
from datetime import date, datetime, timedelta
from django.core.paginator import Paginator
from rest_framework.decorators import api_view
from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Avg, Count, Q, F, Sum
from .models import League, Team, Player, Match, MatchEvent, TeamStatistics
from dotenv import load_dotenv
import os
from telegram import Bot

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHANNEL_ID  = os.getenv("TELEGRAM_CHANNEL_ID")

def get_bot():
    token = TELEGRAM_BOT_TOKEN
    if not token:
        return None
    return Bot(token=token)


def index(request):
    return render(request, 'futstats/index.html')

def listar_ligas(request):
    ligas = League.objects.values('name', 'country').distinct().order_by('name')
    return JsonResponse(list(ligas), safe=False)

def listar_times(request):
    times = Team.objects.select_related('league').all().order_by('name')

    data = []
    for time in times:
        data.append({
            'nome': time.name,
            'pais': time.country,
            'logo': time.logo,
            'liga': time.league.name
        })

    return JsonResponse(data, safe=False)

def listar_jogadores(request):
    nome = request.GET.get('nome', '')
    idade = request.GET.get('idade', '')
    nacionalidade = request.GET.get('nacionalidade', '')
    foto = request.GET.get('foto', '')
    time = request.GET.get('time', '')

    jogadores = Player.objects.all()

    if nome:
        jogadores = jogadores.filter(name__icontains=nome)
    if idade:
        jogadores = jogadores.filter(age__icontains=idade)
    if nacionalidade:
        jogadores = jogadores.filter(nationality__icontains=nacionalidade)
    if foto:
        jogadores = jogadores.filter(photo__icontains=foto)
    if time:
        jogadores = jogadores.filter(team__name__icontains=time)

    # Obter todos os valores únicos para os filtros
    nacionalidade = Player.objects.values_list('nationality', flat=True).exclude(nationality='').values_list('nationality', flat=True).distinct().order_by('nationality')
    ligas = League.objects.values_list('name', flat=True).distinct().order_by('name')
    time = Team.objects.values_list('name', flat=True).distinct().order_by('name')

    paginator = Paginator(jogadores, 10)
    page_number = request.GET.get('page')
    page_obj_player = paginator.get_page(page_number)

    context = {
        'page_obj_player': page_obj_player,
        'nacionalidade': nacionalidade,
        'ligas': ligas,
        'time': time,
        'request': request,  # para manter os valores no form
    }
    return render(request, 'futstats/listar_jogadores.html', context)

def listar_partidas(request):
    date = request.GET.get('date', '')
    league = request.GET.get('league', '')
    team = request.GET.get('team', '')
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 9))  # você pode alterar o padrão

    partidas = Match.objects.select_related('home_team', 'away_team', 'league').all().order_by('-date')

    if date:
        partidas = partidas.filter(date__date=date)
    if league:
        partidas = partidas.filter(league__name__icontains=league)
    if team:
        partidas = partidas.filter(
            Q(home_team__name__icontains=team) |
            Q(away_team__name__icontains=team)
        )

    hoje = timezone.now().date()

    # Paginação
    paginator = Paginator(partidas, page_size)
    page_obj = paginator.get_page(page)

    data = []
    for partida in page_obj:
        if partida.home_score is not None and partida.away_score is not None:
            status = 'completed'
        elif partida.date.date() >= hoje:
            status = 'scheduled'
        else:
            status = 'unknown'

        data.append({
            'matchId': partida.id,
            'homeTeam': partida.home_team.name,
            'awayTeam': partida.away_team.name,
            'homeLogo': partida.home_team.logo,
            'awayLogo': partida.away_team.logo,
            'homeScore': partida.home_score,
            'awayScore': partida.away_score,
            'date': partida.date.strftime('%Y-%m-%d %H:%M'),
            'stadium': partida.venue_name,
            'league': partida.league.name,
            'status': status,
        })

    return JsonResponse({
        'results': data,
        'page': page,
        'page_size': page_size,
        'total_pages': paginator.num_pages,
        'total_items': paginator.count,
        'has_next': page_obj.has_next(),
        'has_previous': page_obj.has_previous(),
    })

@api_view(["GET"])
def matches_today(request):
    from .utils import preload_ultimos_jogos, gerar_insights_rapidos
    from datetime import datetime, time

    # ✅ carregamos o cache APENAS UMA VEZ
    cache = preload_ultimos_jogos()

    # Calcular início e fim do dia de hoje
    hoje = timezone.now().date()
    inicio_do_dia = timezone.make_aware(datetime.combine(hoje, time.min))
    fim_do_dia = timezone.make_aware(datetime.combine(hoje, time.max))

    matches = (
        Match.objects
        .select_related("home_team", "away_team", "league")
        .filter(date__gte=inicio_do_dia, date__lte=fim_do_dia)
        .order_by("date")
    )

    results = []
    for match in matches:
        results.append({
            "id": match.id,
            "league": match.league.name,
            "date": match.date.strftime("%d/%m"),
            "time": match.date.strftime("%H:%M"),

            "homeTeam": {
                "id": match.home_team.id,
                "name": match.home_team.name,
                "logo": match.home_team.logo,
            },
            "awayTeam": {
                "id": match.away_team.id,
                "name": match.away_team.name,
                "logo": match.away_team.logo,
            },

            # ✅ insights agora usam CACHE
            "insights": gerar_insights_rapidos(match, cache),
        })

    return Response(results)

@api_view(["GET"])
def tendencias_rodada(request):
    from datetime import timedelta
    from .utils import preload_ultimos_jogos, gerar_insights_rapidos

    agora = timezone.now()
    futuro = agora + timedelta(days=3)

    cache = preload_ultimos_jogos()

    proximos = (
        Match.objects
        .select_related("home_team", "away_team", "league")
        .filter(date__gte=agora, date__lte=futuro)
        .order_by("date")
    )

    resultados = []

    for match in proximos:
        insights = gerar_insights_rapidos(match, cache)

        resultados.append({
            "matchId": match.id,
            "league": match.league.name,
            "date": match.date.strftime("%d/%m %H:%M"),

            "home": match.home_team.name,
            "away": match.away_team.name,

            "home_logo": match.home_team.logo,
            "away_logo": match.away_team.logo,

            "insights": insights
        })

    def top_por_id(lista, insight_id):
        filtrados = [
            m for m in lista
            if any(i["id"] == insight_id for i in m["insights"])
        ]
        ordenados = sorted(
            filtrados,
            key=lambda m: next(i["probability"] for i in m["insights"] if i["id"] == insight_id),
            reverse=True
        )
        return ordenados[:1]

    resposta = {
        "best_over25": top_por_id(resultados, "over25"),
        "best_btts": top_por_id(resultados, "btts"),
        "best_cards": top_por_id(resultados, "cards"),
        "best_corners": top_por_id(resultados, "corners"),
    }

    return Response(resposta)

@api_view(["GET"])
def times_em_destaque(request):
    from django.db.models import Sum, Count, Case, When, IntegerField, Q, F
    from django.utils.timezone import make_aware
    from functools import reduce
    from operator import or_

    # Buscar todas as ligas que estão no sistema e que têm season válida
    ligas_do_sistema = League.objects.exclude(season__isnull=True).exclude(season='')
    
    if not ligas_do_sistema.exists():
        return Response([])
    
    hoje = timezone.now()
    
    # Validar cada liga e construir filtros baseados na season atual
    # Para cada liga, vamos usar o range de datas da season atual
    ligas_validas = []
    filtros_partidas = []
    
    for liga in ligas_do_sistema:
        # Obter range de datas da season atual
        data_inicio_season, data_fim_season = get_season_date_range(liga.season)
        
        if not data_inicio_season or not data_fim_season:
            # Se não conseguir determinar o range, pula esta liga
            continue
        
        # Converter para datetime aware para comparação
        data_inicio_season_dt = make_aware(datetime.combine(data_inicio_season, datetime.min.time()))
        data_fim_season_dt = make_aware(datetime.combine(data_fim_season, datetime.max.time()))
        
        # Verificar se há partidas finalizadas nesta season
        # Usar o menor valor entre fim da season e hoje para garantir partidas até hoje
        data_limite = min(data_fim_season_dt, hoje)
        
        partidas_liga_season = Match.objects.filter(
            league=liga,
            home_score__isnull=False,
            away_score__isnull=False,
            date__gte=data_inicio_season_dt,
            date__lte=data_limite  # Apenas partidas até hoje e dentro da season
        )
        
        if partidas_liga_season.exists():
            ligas_validas.append(liga.id)
            # Adicionar filtro para esta liga com seu range de datas
            filtros_partidas.append(
                Q(league=liga) & 
                Q(home_score__isnull=False) & 
                Q(away_score__isnull=False) &
                Q(date__gte=data_inicio_season_dt) &
                Q(date__lte=data_limite)
            )
    
    # Se não houver ligas válidas, retorna lista vazia
    if not ligas_validas or not filtros_partidas:
        return Response([])
    
    # Combinar todos os filtros com OR (cada liga tem seu próprio range de datas)
    filtro_combinado = reduce(or_, filtros_partidas)
    
    # Buscar apenas partidas finalizadas da season atual de cada liga válida
    partidas_finalizadas = Match.objects.filter(
        filtro_combinado
    ).select_related('league')
    
    # Se não houver partidas, retorna lista vazia
    if not partidas_finalizadas.exists():
        return Response([])

    # Buscar todos os times que têm partidas recentes usando uma única query
    times_ids = set(
        partidas_finalizadas.values_list('home_team_id', flat=True)
    ) | set(
        partidas_finalizadas.values_list('away_team_id', flat=True)
    )

    if not times_ids:
        return Response([])

    # Calcular estatísticas usando agregações do Django ORM (muito mais rápido)
    # Estatísticas como mandante
    stats_home = partidas_finalizadas.values('home_team').annotate(
        gols_feitos_home=Sum('home_score'),
        gols_sofridos_home=Sum('away_score'),
        vitorias_home=Count('id', filter=Q(home_score__gt=F('away_score'))),
        empates_home=Count('id', filter=Q(home_score=F('away_score'))),
        derrotas_home=Count('id', filter=Q(home_score__lt=F('away_score'))),
        ambas_marcam_home=Count('id', filter=Q(home_score__gt=0, away_score__gt=0)),
        total_home=Count('id')
    )

    # Estatísticas como visitante
    stats_away = partidas_finalizadas.values('away_team').annotate(
        gols_feitos_away=Sum('away_score'),
        gols_sofridos_away=Sum('home_score'),
        vitorias_away=Count('id', filter=Q(away_score__gt=F('home_score'))),
        empates_away=Count('id', filter=Q(away_score=F('home_score'))),
        derrotas_away=Count('id', filter=Q(away_score__lt=F('home_score'))),
        ambas_marcam_away=Count('id', filter=Q(home_score__gt=0, away_score__gt=0)),
        total_away=Count('id')
    )

    # Combinar estatísticas em um dicionário por time_id
    estatisticas_dict = {}
    
    for stat in stats_home:
        team_id = stat['home_team']
        estatisticas_dict[team_id] = {
            'gols_feitos': stat['gols_feitos_home'] or 0,
            'gols_sofridos': stat['gols_sofridos_home'] or 0,
            'vitorias': stat['vitorias_home'] or 0,
            'empates': stat['empates_home'] or 0,
            'derrotas': stat['derrotas_home'] or 0,
            'ambas_marcam': stat['ambas_marcam_home'] or 0,
            'total_jogos': stat['total_home'] or 0,
        }
    
    for stat in stats_away:
        team_id = stat['away_team']
        if team_id in estatisticas_dict:
            estatisticas_dict[team_id]['gols_feitos'] += stat['gols_feitos_away'] or 0
            estatisticas_dict[team_id]['gols_sofridos'] += stat['gols_sofridos_away'] or 0
            estatisticas_dict[team_id]['vitorias'] += stat['vitorias_away'] or 0
            estatisticas_dict[team_id]['empates'] += stat['empates_away'] or 0
            estatisticas_dict[team_id]['derrotas'] += stat['derrotas_away'] or 0
            estatisticas_dict[team_id]['ambas_marcam'] += stat['ambas_marcam_away'] or 0
            estatisticas_dict[team_id]['total_jogos'] += stat['total_away'] or 0
        else:
            estatisticas_dict[team_id] = {
                'gols_feitos': stat['gols_feitos_away'] or 0,
                'gols_sofridos': stat['gols_sofridos_away'] or 0,
                'vitorias': stat['vitorias_away'] or 0,
                'empates': stat['empates_away'] or 0,
                'derrotas': stat['derrotas_away'] or 0,
                'ambas_marcam': stat['ambas_marcam_away'] or 0,
                'total_jogos': stat['total_away'] or 0,
            }

    # Buscar informações dos times em uma única query (apenas campos necessários)
    # Garantir que os times pertencem apenas às ligas válidas do sistema
    times = Team.objects.filter(
        id__in=times_ids,
        league_id__in=ligas_validas
    ).select_related("league").only('id', 'name', 'logo', 'league__name')
    times_dict = {time.id: time for time in times}

    # Montar lista final de estatísticas
    estatisticas_times = []
    for team_id, stats in estatisticas_dict.items():
        if team_id in times_dict:
            time = times_dict[team_id]
            total_jogos = stats['total_jogos']
            porcentagem_ambas_marcam = (stats['ambas_marcam'] / total_jogos * 100) if total_jogos > 0 else 0
            
            estatisticas_times.append({
                "id": time.id,
                "name": time.name,
                "league": time.league.name,
                "logo": time.logo,
                "gols_feitos": stats['gols_feitos'],
                "gols_sofridos": stats['gols_sofridos'],
                "vitorias": stats['vitorias'],
                "empates": stats['empates'],
                "derrotas": stats['derrotas'],
                "ambas_marcam": round(porcentagem_ambas_marcam, 1),
                "total_jogos": total_jogos,
            })

    # Encontrar os 4 times destacados
    if not estatisticas_times:
        return Response([])
    
    time_mais_gols_feitos = max(estatisticas_times, key=lambda t: t["gols_feitos"])
    time_mais_gols_sofridos = max(estatisticas_times, key=lambda t: t["gols_sofridos"])
    time_mais_vitorias = max(estatisticas_times, key=lambda t: t["vitorias"])
    time_ambas_marcam = max(estatisticas_times, key=lambda t: t["ambas_marcam"])

    # Formatar resposta para o frontend
    resultados = [
        {
            "id": time_mais_gols_feitos["id"],
            "name": time_mais_gols_feitos["name"],
            "league": time_mais_gols_feitos["league"],
            "logo": time_mais_gols_feitos["logo"],
            "stat_type": "gols_feitos",
            "stat_value": time_mais_gols_feitos["gols_feitos"],
            "stat_label": "Gols Feitos",
        },
        {
            "id": time_mais_gols_sofridos["id"],
            "name": time_mais_gols_sofridos["name"],
            "league": time_mais_gols_sofridos["league"],
            "logo": time_mais_gols_sofridos["logo"],
            "stat_type": "gols_sofridos",
            "stat_value": time_mais_gols_sofridos["gols_sofridos"],
            "stat_label": "Gols Sofridos",
        },
        {
            "id": time_mais_vitorias["id"],
            "name": time_mais_vitorias["name"],
            "league": time_mais_vitorias["league"],
            "logo": time_mais_vitorias["logo"],
            "stat_type": "vitorias",
            "stat_value": time_mais_vitorias["vitorias"],
            "stat_label": "Vitórias",
        },
        {
            "id": time_ambas_marcam["id"],
            "name": time_ambas_marcam["name"],
            "league": time_ambas_marcam["league"],
            "logo": time_ambas_marcam["logo"],
            "stat_type": "ambas_marcam",
            "stat_value": time_ambas_marcam["ambas_marcam"],
            "stat_label": "Ambas Marcam",
        },
    ]

    return Response(resultados)

@api_view(["GET"])
def estatisticas_gerais(request):
    return Response({
        "total_matches": Match.objects.count(),
        "total_teams": Team.objects.count(),
        "total_leagues": League.objects.count(),
    })

# Estatísticas gerais do banco

def match_details(request, id):
    try:
        jogo = Match.objects.get(pk=id)
    except Match.DoesNotExist:
        return JsonResponse({"detail": "Partida não encontrada."}, status=404)

    # Filtra todos os eventos relacionados à partida
    eventos = MatchEvent.objects.filter(match=jogo)

    goals = []
    cards = []
    substitutions = []

    for evento in eventos:
        team_side = 'home' if evento.team == jogo.home_team else 'away'

        if evento.type.lower() == 'goal':
            goals.append({
                "team": team_side,
                "player": evento.player,
                "minute": evento.minute,
                "type": evento.detail
            })

        elif evento.type.lower() == 'card':
            cards.append({
                "team": team_side,
                "player": evento.player,
                "minute": evento.minute,
                "type": evento.detail.lower()  # 'yellow', 'red'
            })

        elif evento.type.lower() == 'substitution':
            substitutions.append({
                "team": team_side,
                "playerOut": evento.player,
                "playerIn": evento.assist,
                "minute": evento.minute
            })

    data = {
        "id": jogo.id,
        "homeTeam": jogo.home_team.name,
        "awayTeam": jogo.away_team.name,
        "home_logo": jogo.home_team.logo,
        "away_logo": jogo.away_team.logo,
        "homeScore": jogo.home_score,
        "awayScore": jogo.away_score,
        "date": jogo.date.strftime('%d/%m/%Y %H:%M'),
        "stadium": jogo.venue_name,
        "league": jogo.league.name if jogo.league else None,
        "status": "completed" if jogo.home_score is not None and jogo.away_score is not None else "upcoming",
        "referee": jogo.referee,
        "attendance": None,

        "goals": goals,
        "cards": cards,
        "substitutions": substitutions,

        # Por enquanto valores mockados (você pode conectar com outro model futuramente)
        "stats": {
            "possession": {"home": 55, "away": 45},
            "shots": {"home": 14, "away": 11},
            "shotsOnTarget": {"home": 6, "away": 4},
            "corners": {"home": 7, "away": 3},
            "fouls": {"home": 10, "away": 14},
            "offsides": {"home": 1, "away": 2},
            "passes": {"home": 500, "away": 430},
            "passAccuracy": {"home": 85, "away": 79},
            "tackles": {"home": 19, "away": 21},
            "aerialDuels": {"home": 13, "away": 15}
        }
    }

    return JsonResponse(data, safe=False)

def enviar_mensagem_telegram(texto):
    bot = get_bot()
    if not bot:
        print("⚠️ TELEGRAM_BOT_TOKEN não configurado. Mensagem não enviada.")
        return False

    chat_id = TELEGRAM_CHANNEL_ID
    try:
        bot.send_message(chat_id=chat_id, text=texto, parse_mode='Markdown')
        return True
    except Exception as e:
        print("❌ Erro ao enviar mensagem:", e)
        return False

def analisar_e_enviar_telegram():
    print("\n🔍 Iniciando análise e envio para Telegram...\n")

    hoje = timezone.localtime().date()
    inicio_do_dia = timezone.make_aware(timezone.datetime.combine(hoje, timezone.datetime.min.time()))
    fim_do_dia = timezone.make_aware(timezone.datetime.combine(hoje, timezone.datetime.max.time()))

    todos_times = Team.objects.all()

    def calcular_gols(matches, time):
        feitos = 0
        sofridos = 0
        for m in matches:
            if m.home_team == time:
                feitos += m.home_score or 0
                sofridos += m.away_score or 0
            elif m.away_team == time:
                feitos += m.away_score or 0
                sofridos += m.home_score or 0
        return feitos, sofridos

    mensagens = []

    for time in todos_times:
        proximo_jogo = Match.objects.filter(
            Q(home_team=time) | Q(away_team=time),
            date__range=(inicio_do_dia, fim_do_dia)
        ).order_by('date').first()

        if not proximo_jogo:
            continue

        adversario = proximo_jogo.away_team if proximo_jogo.home_team == time else proximo_jogo.home_team

        ultimos_time = Match.objects.filter(
            Q(home_team=time) | Q(away_team=time),
            date__lt=proximo_jogo.date
        ).order_by('-date')[:5]

        ultimos_adversario = Match.objects.filter(
            Q(home_team=adversario) | Q(away_team=adversario),
            date__lt=proximo_jogo.date
        ).order_by('-date')[:5]

        gols_time, _ = calcular_gols(ultimos_time, time)
        gols_adv, _ = calcular_gols(ultimos_adversario, adversario)

        media_gols_time = gols_time / len(ultimos_time) if ultimos_time else 0
        media_gols_adv = gols_adv / len(ultimos_adversario) if ultimos_adversario else 0

        sugestao = None
        if media_gols_time >= 1.5 and media_gols_adv >= 1.5:
            sugestao = "Mais de 2.5 gols"
        elif media_gols_time >= 1.2 and media_gols_adv >= 1.2:
            sugestao = "Ambos marcam: Sim"
        elif media_gols_time >= 1.5:
            sugestao = f"{time.name} marca 1.5+ gols"
        elif media_gols_adv >= 1.5:
            sugestao = f"{adversario.name} marca 1.5+ gols"

        if sugestao:
            jogo_str = f"{proximo_jogo.home_team.name} x {proximo_jogo.away_team.name} ({proximo_jogo.date.strftime('%Y-%m-%d %H:%M')})"
            mensagem = f"✅ *Sugestão de aposta*\n{jogo_str}\nSugestão: *{sugestao}*"
            mensagens.append(mensagem)

    if mensagens:
        texto = "\n\n".join(mensagens)
        sucesso = enviar_mensagem_telegram(texto)
        if sucesso:
            print("✅ Mensagem enviada para o canal do Telegram.")
        else:
            print("❌ Erro ao enviar a mensagem para o canal.")
    else:
        print("⚠️ Nenhuma sugestão para enviar.")

    print("\n✔️ Análise e envio finalizados.")

def card_estatisticas_por_ligas(request):
    ligas = Match.objects.values('league').distinct()
    resultado = []

    for liga in ligas:
        nome_liga = liga['league']
        jogos_liga = Match.objects.filter(league=nome_liga)
        jogos_finalizados = jogos_liga.filter(status='completed')

        total_jogos = jogos_liga.count()
        total_finalizados = jogos_finalizados.count()

        # Média de gols soma dos gols da casa + fora divididos pelo total de jogos finalizados
        media_gols = jogos_finalizados.aggregate(
            avg_goals=Avg(F('homeScore') + F('awayScore'))
        )['avg_goals'] or 0

        resultado.append({
            'league': nome_liga,
            'total_matches': total_jogos,
            'completed_matches': total_finalizados,
            'average_goals': round(media_gols, 2),
        })

    return JsonResponse(resultado, safe=False)

# Página de Jogos
def contar_jogos(request):
    quantidade = Match.objects.count()
    return JsonResponse({'quantidade': quantidade})

# Página de Times
def contar_times(request):
    quantidade = Team.objects.count()
    return JsonResponse({'quantidade': quantidade})

@api_view(["GET"])
def value_bets(request):
    """
    Retorna as melhores probabilidades de cada tipo de aposta bater
    Ordenadas por probabilidade calculada (maior primeiro)
    """
    from .betting_utils import get_best_probabilities
    
    limit = int(request.GET.get('limit', 10))
    probabilities = get_best_probabilities(limit)
    
    results = []
    for prob in probabilities:
        # Formatar data: se hora for 00:00, mostrar apenas data
        match_date = prob["match"].date
        if match_date.hour == 0 and match_date.minute == 0:
            date_str = match_date.strftime("%d/%m")
        else:
            date_str = match_date.strftime("%d/%m %H:%M")
        
        # Buscar todas as casas disponíveis para este mercado
        from .models import MatchOdds
        all_odds_for_market = MatchOdds.objects.filter(
            match=prob["match"],
            **{f"{prob['bet_type']}_odd__isnull": False}
        ).select_related('bookmaker')
        
        # Encontrar melhor odd e se é brasileira
        best_odd = prob["odd"]
        best_bookmaker = prob["bookmaker"]
        is_brazilian = best_bookmaker.is_brazilian if best_bookmaker else False
        
        # Lista de todas as casas disponíveis
        available_bookmakers = []
        for match_odd in all_odds_for_market:
            odd_value = getattr(match_odd, f"{prob['bet_type']}_odd")
            if odd_value:
                available_bookmakers.append({
                    "name": match_odd.bookmaker.name,
                    "odd": float(odd_value),
                    "is_brazilian": match_odd.bookmaker.is_brazilian
                })
        
        results.append({
            "match_id": prob["match"].id,
            "match": f"{prob['match'].home_team.name} x {prob['match'].away_team.name}",
            "league": prob["match"].league.name,
            "date": date_str,
            "bet_type": prob["bet_type"],
            "bet_name": prob["bet_name"],
            "odd": float(prob["odd"]),
            "calculated_probability": round(prob["calculated_probability"], 2),
            "implied_probability": round(prob["implied_probability"], 2),
            "difference": round(prob["difference"], 2),
            "best_bookmaker": best_bookmaker.name if best_bookmaker else None,
            "is_brazilian_bookmaker": is_brazilian,
            "available_bookmakers": available_bookmakers,
        })
    
    return Response(results)

@api_view(["GET"])
def available_bookmakers(request):
    """
    Verifica quais bookmakers estão disponíveis na API para um esporte
    """
    from .services.odds_api import get_available_bookmakers, BRASIL_BOOKMAKERS, LEAGUE_TO_SPORT_KEY
    import asyncio
    
    sport_key = request.GET.get('sport_key', 'soccer_epl')
    
    # Buscar bookmakers disponíveis
    bookmakers_list = asyncio.run(get_available_bookmakers(sport_key))
    
    # Preparar resposta
    available = []
    brazilian_found = []
    
    for bk_key in bookmakers_list:
        is_brazilian = bk_key.lower() in [b.lower() for b in BRASIL_BOOKMAKERS]
        available.append({
            "key": bk_key,
            "title": bk_key.replace("_", " ").title(),
            "is_brazilian": is_brazilian
        })
        if is_brazilian:
            brazilian_found.append(bk_key)
    
    return Response({
        "sport_key": sport_key,
        "total_bookmakers": len(bookmakers_list),
        "brazilian_bookmakers": brazilian_found,
        "available_bookmakers": available,
        "leagues_configured": list(LEAGUE_TO_SPORT_KEY.keys())
    })


@api_view(["GET"])
def debug_odds(request):
    """
    Endpoint de debug para verificar odds no banco
    """
    from .models import MatchOdds, Match
    from django.utils import timezone
    from datetime import timedelta
    
    future_date = timezone.now() + timedelta(days=3)
    matches = Match.objects.filter(
        date__gte=timezone.now(),
        date__lte=future_date
    )
    
    total_odds = MatchOdds.objects.filter(match__in=matches).count()
    total_bookmakers = MatchOdds.objects.filter(match__in=matches).values('bookmaker').distinct().count()
    
    # Exemplos de odds
    sample_odds = MatchOdds.objects.filter(match__in=matches).select_related('match', 'bookmaker')[:5]
    
    # Listar bookmakers encontrados
    bookmakers_list = list(MatchOdds.objects.filter(match__in=matches).values_list('bookmaker__name', flat=True).distinct())
    
    results = {
        "total_matches_futuras": matches.count(),
        "total_odds_salvas": total_odds,
        "total_bookmakers": total_bookmakers,
        "bookmakers_encontrados": bookmakers_list,
        "exemplos": [
            {
                "match": f"{odd.match.home_team.name} x {odd.match.away_team.name}",
                "bookmaker": odd.bookmaker.name,
                "over_25_odd": float(odd.over_25_odd) if odd.over_25_odd else None,
                "home_win_odd": float(odd.home_win_odd) if odd.home_win_odd else None,
                "away_win_odd": float(odd.away_win_odd) if odd.away_win_odd else None,
                "draw_odd": float(odd.draw_odd) if odd.draw_odd else None,
            }
            for odd in sample_odds
        ]
    }
    
    return Response(results)