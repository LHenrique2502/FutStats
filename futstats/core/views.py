from django.utils import timezone
from datetime import timedelta
from django.core.paginator import Paginator
from django.shortcuts import render
from django.http import JsonResponse
from .models import League, Team, Player, Match, MatchEvent, TeamStatistics  # ou .models se o model estiver no mesmo app

def index(request):
    return render(request, 'futstats/index.html')

def listar_ligas(request):
    ligas = League.objects.all().order_by('country', 'name')
    return render(request, 'futstats/listar_ligas.html', {'ligas': ligas})

def listar_times(request):
    nome = request.GET.get('nome', '')
    pais = request.GET.get('pais', '')
    liga = request.GET.get('liga', '')

    times = Team.objects.all()

    if nome:
        times = times.filter(name__icontains=nome)
    if pais:
        times = times.filter(country__icontains=pais)
    if liga:
        times = times.filter(league__name__icontains=liga)

    # Obter todos os valores únicos para os filtros
    paises = Team.objects.values_list('country', flat=True).exclude(country='').values_list('country', flat=True).distinct().order_by('country')
    ligas = League.objects.values_list('name', flat=True).distinct().order_by('name')

    paginator = Paginator(times, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
        'paises': paises,
        'ligas': ligas,
        'request': request,  # para manter os valores no form
    }
    return render(request, 'futstats/listar_times.html', context)

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
    league = request.GET.get('name', '')
    home_team = request.GET.get('name', '')
    away_team = request.GET.get('name', '')
    home_score = request.GET.get('home_score', '')
    away_score = request.GET.get('away_score', '')

    partidas = Match.objects.all()

    if date:
        partidas = partidas.filter(date__icontains=date)
    if league:
        partidas = partidas.filter(league__icontains=league)
    if home_team:
        partidas = partidas.filter(name__icontains=home_team)
    if away_team:
        partidas = partidas.filter(name__icontains=away_team)
    if home_score:
        partidas = partidas.filter(home_score__icontains=home_score)
    if away_score:
        partidas = partidas.filter(away_score__icontains=away_score)

    # Obter todos os valores únicos para os filtros
    date = Match.objects.values_list('date', flat=True).distinct().order_by('date')
    ligas = League.objects.values_list('name', flat=True).distinct().order_by('name')
    time = Team.objects.values_list('name', flat=True).distinct().order_by('name')

    # Paginação
    paginator = Paginator(partidas, 10)
    page_number = request.GET.get('page')
    page_obj_match = paginator.get_page(page_number)

    context = {
        'page_obj_match': page_obj_match,
        'date': date,
        'ligas': ligas,
        'time': time,
        'request': request,  # para manter os valores no form
    }

    return render(request, 'futstats/listar_partidas.html', context)

# COMMIT-BEFORE: VIEW DE TESTE
def ultimas_partidas(request):
    ultimos_jogos = Match.objects.order_by('date')[:5]  # pega os 5 mais recentes

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
            "status": "completed" if jogo.home_score is not None and jogo.away_score is not None else "upcoming"

        })

    return JsonResponse(data, safe=False)  # safe=False permite retornar listas

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