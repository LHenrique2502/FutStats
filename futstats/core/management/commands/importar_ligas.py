from django.core.management.base import BaseCommand
from core.services.api_football import get_leagues
import asyncio

class Command(BaseCommand):
    help = "Importa as ligas da API-Football de forma assíncrona"

    def handle(self, *args, **kwargs):
        asyncio.run(get_leagues())
        self.stdout.write(self.style.SUCCESS("✅ Ligas importadas com sucesso!"))