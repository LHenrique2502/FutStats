from django.core.management.base import BaseCommand
import asyncio
from core.services.api_football import import_teams_async

class Command(BaseCommand):
    help = "Importa times das ligas da API-FOOTBALL para o banco"

    def handle(self, *args, **kwargs):
        asyncio.run(import_teams_async())
        self.stdout.write(self.style.SUCCESS("✅ Times importados com sucesso!"))