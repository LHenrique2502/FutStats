from django.core.management.base import BaseCommand
from core.services.api_thesportsdb import import_match_stats_async
import asyncio


class Command(BaseCommand):
    help = "Importa estatísticas das partidas da API TheSportsDB"


    def handle(self, *args, **kwargs):
        asyncio.run(import_match_stats_async())
        self.stdout.write(self.style.SUCCESS("✅ Estatísticas importadas com sucesso!"))