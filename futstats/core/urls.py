from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    path('api/estatisticas/', views.estatisticas_gerais, name='estatisticas'),
    path('', views.index, name='index'),
    path('api/ligas/', views.listar_ligas, name='api_ligas'),
    path('api/times/', views.listar_times, name='api_times'),
    path('jogadores/', views.listar_jogadores, name='listar_jogadores'),
    path('api/matches/', views.listar_partidas, name='api_listar_partidas'),
    # Matches
    path('api/matches/today/', views.matches_today, name='matches_today'),
    path('api/tendencias_rodada/', views.tendencias_rodada, name='tendencias_rodada'),
    path("api/times_destaque/", views.times_em_destaque, name="times_em_destaque"),
    path('api/value-bets/', views.value_bets, name='value_bets'),
    path('api/debug-odds/', views.debug_odds, name='debug_odds'),
    path('api/bookmakers/available/', views.available_bookmakers, name='available_bookmakers'),

]
