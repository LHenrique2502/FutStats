from django.core.management.base import BaseCommand
from core.services.api_thesportsdb import import_match_events_async
import asyncio

class Command(BaseCommand):
    help = "Importa as estatísticas e numeros das partidas da API-FOOTBALL para o banco"

    def handle(self, *args, **kwargs):
        asyncio.run(import_match_events_async())  # Chama a função que busca e salva as estatísticas exatas das partidas no banco
        self.stdout.write(self.style.SUCCESS("✅ Estatísticas das partidas importadas com sucesso!"))