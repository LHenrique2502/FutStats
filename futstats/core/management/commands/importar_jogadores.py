from django.core.management.base import BaseCommand
import asyncio
from core.services.api_football import import_players_async

class Command(BaseCommand):
    help = "Importa jogadores de todos os times da API-FOOTBALL para o banco"

    def handle(self, *args, **kwargs):
        asyncio.run(import_players_async())
        self.stdout.write(self.style.SUCCESS("✅ Jogadores importados com sucesso!"))