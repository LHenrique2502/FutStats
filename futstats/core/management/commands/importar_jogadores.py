from django.core.management.base import BaseCommand
from core.services.api_football import get_players
from core.models import Player

class Command(BaseCommand):
    help = "Importa os jogadores da API-FOOTBALL para o banco"

    def handle(self, *args, **kwargs):
        get_players()  # Chama a função que busca e salva os jogadores no banco

        self.stdout.write(self.style.SUCCESS("Jogadores importados com sucesso!"))