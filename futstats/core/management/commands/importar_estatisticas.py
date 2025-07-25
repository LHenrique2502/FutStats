from django.core.management.base import BaseCommand
import asyncio
import httpx
from core.services.api_football import import_match_data_async

class Command(BaseCommand):
    help = "Importa eventos e estatísticas das partidas da API-FOOTBALL de forma assíncrona e otimizada"

    def handle(self, *args, **kwargs):
        async def main():
            async with httpx.AsyncClient(timeout=30) as client:
                await import_match_data_async(client)

        asyncio.run(main())
        self.stdout.write(self.style.SUCCESS("✅ Eventos e estatísticas das partidas importados com sucesso!"))
