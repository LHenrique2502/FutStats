from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    path('api/estatisticas/', views.estatisticas_gerais, name='estatisticas'),
    path('api/ultimas_partidas/', views.ultimas_partidas, name='ultimas_partidas'),
    path('', views.index, name='index'),
    path('ligas/', views.listar_ligas, name='listar_ligas'),
    path('times/', views.listar_times, name='listar_times'),
    path('jogadores/', views.listar_jogadores, name='listar_jogadores'),
    path('partidas/', views.listar_partidas, name='listar_partidas'),
]
