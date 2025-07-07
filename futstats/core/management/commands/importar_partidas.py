from django.core.management.base import BaseCommand
import asyncio
from core.services.api_football import import_matches_async

class Command(BaseCommand):
    help = "Importa as partidas da API-FOOTBALL para o banco"

    def handle(self, *args, **kwargs):
        asyncio.run(import_matches_async())
        self.stdout.write(self.style.SUCCESS("Partidas importadas com sucesso!"))