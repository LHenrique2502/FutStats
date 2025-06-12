from django.core.management.base import BaseCommand
from core.services.api_football import import_match_details
from core.models import TeamStatistics, MatchEvent

class Command(BaseCommand):
    help = "Importa as estatísticas das partidas da API-FOOTBALL para o banco"

    def handle(self, *args, **kwargs):
        import_match_details()  # Chama a função que busca e salva as estatísticas das partidas no banco

        self.stdout.write(self.style.SUCCESS("Estatísticas importadas com sucesso!"))