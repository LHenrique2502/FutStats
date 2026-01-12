from django.core.management.base import BaseCommand
from core.services.api_thesportsdb import import_players_async
import asyncio


class Command(BaseCommand):
    help = "Importa os jogadores da API TheSportsDB"


    def handle(self, *args, **kwargs):
        asyncio.run(import_players_async())
        self.stdout.write(self.style.SUCCESS("✅ Jogadores importados com sucesso!"))