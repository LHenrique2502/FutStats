from django.core.management.base import BaseCommand
from core.services.api_thesportsdb import import_leagues_async
import asyncio


class Command(BaseCommand):
    help = "Importa as ligas da API TheSportsDB"


    def handle(self, *args, **kwargs):
        asyncio.run(import_leagues_async())
        self.stdout.write(self.style.SUCCESS("✅ Ligas importadas com sucesso!"))