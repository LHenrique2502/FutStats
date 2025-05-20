from django.core.management.base import BaseCommand
from core.services.api_football import get_teams
from core.models import Team

class Command(BaseCommand):
    help = "Importa os times da API-FOOTBALL para o banco"

    def handle(self, *args, **kwargs):
        get_teams()  # Chama a função que busca e salva as ligas no banco

        self.stdout.write(self.style.SUCCESS("Times importados com sucesso!"))