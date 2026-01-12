

from django.core.management.base import BaseCommand
from core.services.api_thesportsdb import import_matches_async
import asyncio


class Command(BaseCommand):
    help = "Importa as partidas da API TheSportsDB"


    def handle(self, *args, **kwargs):
        asyncio.run(import_matches_async())
        self.stdout.write(self.style.SUCCESS("✅ Partidas importadas com sucesso!"))