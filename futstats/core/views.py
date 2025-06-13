from django.core.paginator import Paginator
from django.shortcuts import render
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