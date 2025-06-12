from django.core.paginator import Paginator
from django.shortcuts import render
from .models import League, Team, Player  # ou .models se o model estiver no mesmo app

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