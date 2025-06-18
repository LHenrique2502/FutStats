from django.core.management.base import BaseCommand
from core.services.api_football import import_match_statistics
from core.models import TeamStatistics

class Command(BaseCommand):
    help = "Importa as estatísticas e numeros das partidas da API-FOOTBALL para o banco"

    def handle(self, *args, **kwargs):
        import_match_statistics()  # Chama a função que busca e salva as estatísticas exatas das partidas no banco

        self.stdout.write(self.style.SUCCESS("Estatísticas das partidas importadas com sucesso!"))