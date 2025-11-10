from django.core.management.base import BaseCommand
from core.services.api_thesportsdb import import_teams_async
import asyncio


class Command(BaseCommand):
    help = "Importa os times da API TheSportsDB"


    def handle(self, *args, **kwargs):
        asyncio.run(import_teams_async())
        self.stdout.write(self.style.SUCCESS("✅ Times importados com sucesso!"))