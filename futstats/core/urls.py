from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('ligas/', views.listar_ligas, name='listar_ligas'),
    path('times/', views.listar_times, name='listar_times'),
    path('jogadores/', views.listar_jogadores, name='listar_jogadores'),
    # path('partidas/', views.listar_partidas, name='listar_partidas'),
]
