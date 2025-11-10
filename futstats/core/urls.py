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
    path('api/matches/today', views.matches_today, name='matches_today'),

]
