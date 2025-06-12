from django.core.management.base import BaseCommand
from core.services.api_football import get_match
from core.models import Match

class Command(BaseCommand):
    help = "Importa as partidas da API-FOOTBALL para o banco"

    def handle(self, *args, **kwargs):
        get_match()  # Chama a função que busca e salva as partidas no banco

        self.stdout.write(self.style.SUCCESS("Partidas importadas com sucesso!"))