from django.utils import timezone
import requests
from datetime import datetime
from datetime import timedelta
from django.core.paginator import Paginator
from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Avg, Count, Q, F, Sum
from .models import League, Team, Player, Match, MatchEvent, TeamStatistics  # ou .models se o model estiver no mesmo app
from dotenv import load_dotenv
import os
from telegram import Bot

load_dotenv() # Carrega o conteúdo do .env

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHANNEL_ID  = os.getenv("TELEGRAM_CHANNEL_ID")

bot = Bot(token=TELEGRAM_BOT_TOKEN)

def index(request):
    return render(request, 'futstats/index.html')

def listar_ligas(request):
    ligas = League.objects.values_list('name', flat=True).distinct().order_by('name')
    return JsonResponse(list(ligas), safe=False)

def listar_times(request):
    times = Team.objects.values_list('name', flat=True).distinct().order_by('name')
    return JsonResponse(list(times), safe=False)

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

    data = []
    for partida in partidas:
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
            # 'status': partida.status,
        })

    return JsonResponse(data, safe=False)

# COMMIT-BEFORE: VIEW DE TESTE
def ultimas_partidas(request):
    hoje = timezone.now().date()
    ontem = hoje - timedelta(days=1)

    # 🕑 Pega o intervalo de datas entre 00:00 e 23:59 de ontem
    inicio_ontem = timezone.make_aware(datetime.combine(ontem, datetime.min.time()))
    fim_ontem = timezone.make_aware(datetime.combine(ontem, datetime.max.time()))

    # 🧠 Busca jogos que aconteceram ontem e têm placares definidos
    ultimos_jogos = Match.objects.filter(
        date__range=(inicio_ontem, fim_ontem),
        home_score__isnull=False,
        away_score__isnull=False
    ).order_by('-date')[:5]

    data = []
    for jogo in ultimos_jogos:
        data.append({
            "id": jogo.id,
            "home_team": jogo.home_team.name,
            "away_team": jogo.away_team.name,
            "home_score": jogo.home_score,
            "away_score": jogo.away_score,
            "home_logo": jogo.home_team.logo,
            "away_logo": jogo.away_team.logo,
            "date": jogo.date.strftime('%d/%m/%Y %H:%M'),
            "league": jogo.league.name,
            "stadium": jogo.venue_name,
            "status": "completed"
        })

    return JsonResponse(data, safe=False)

# Estatísticas gerais do banco
def estatisticas_gerais(request):
    hoje = timezone.now()

    # Início e fim do mês atual e do mês anterior
    inicio_mes_atual = hoje.replace(day=1)
    inicio_mes_passado = (inicio_mes_atual - timedelta(days=1)).replace(day=1)
    fim_mes_passado = inicio_mes_atual - timedelta(days=1)

    def contar_no_mes(model, inicio, fim=None):
        filtro = {"created_at__gte": inicio}
        if fim:
            filtro["created_at__lte"] = fim
        return model.objects.filter(**filtro).count()

    def calcular_percentual(atual, anterior):
        if anterior == 0:
            return 100 if atual > 0 else 0
        return round(((atual - anterior) / anterior) * 100)

    # Assumindo que Match, Team e Player possuem um campo 'created_at' do tipo DateTimeField
    jogos_atuais = contar_no_mes(Match, inicio_mes_atual)
    jogos_passados = contar_no_mes(Match, inicio_mes_passado, fim_mes_passado)

    times_atuais = contar_no_mes(Team, inicio_mes_atual)
    times_passados = contar_no_mes(Team, inicio_mes_passado, fim_mes_passado)

    jogadores_atuais = contar_no_mes(Player, inicio_mes_atual)
    jogadores_passados = contar_no_mes(Player, inicio_mes_passado, fim_mes_passado)

    data = {
        "total_jogos": Match.objects.count(),
        "total_ligas": League.objects.count(),
        "total_times": Team.objects.count(),
        "total_jogadores": Player.objects.count(),
        # TODO: depois editar o valor total de analises
        "total_analises": 8593,  # valor fixo ou você pode calcular depois
        "crescimento_jogos": calcular_percentual(jogos_atuais, jogos_passados),
        "crescimento_times": calcular_percentual(times_atuais, times_passados),
        "crescimento_jogadores": calcular_percentual(jogadores_atuais, jogadores_passados),
    }
    return JsonResponse(data)

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
    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
    payload = {
        'chat_id': TELEGRAM_CHANNEL_ID,
        'text': texto,
        'parse_mode': 'Markdown'
    }
    response = requests.post(url, data=payload)
    return response.ok

def analisar_e_enviar_telegram():
    print("\n🔍 Iniciando análise e envio para Telegram...\n")

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
            date__gte=timezone.now()
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