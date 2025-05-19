from django.core.management.base import BaseCommand
from core.services.api_football import get_leagues
from core.models import League

class Command(BaseCommand):
    help = "Importa as ligas da API-FOOTBALL para o banco"

    def handle(self, *args, **kwargs):
        get_leagues()  # Chama a função que busca e salva as ligas no banco

        self.stdout.write(self.style.SUCCESS("Ligas importadas com sucesso!"))
