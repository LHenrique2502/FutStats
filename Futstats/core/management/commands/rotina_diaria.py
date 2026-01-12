from django.core.management.base import BaseCommand
import asyncio

from core.services.api_thesportsdb import (
    import_matches_async,
    import_match_events_async,
    import_match_stats_async,
)

class Command(BaseCommand):
    help = "Executa a rotina diária de atualização do FutStats"

    def handle(self, *args, **kwargs):
        print("🚀 Iniciando rotina diária FutStats...")

        asyncio.run(self.run_full_routine())

        print("✅ Rotina diária finalizada.")

    async def run_full_routine(self):

        print("\n📌 Passo 1: Atualizando partidas...")
        await import_matches_async()

        print("\n📌 Passo 2: Atualizando eventos (estatísticas timeline)...")
        await import_match_events_async()

        print("\n📌 Passo 3: Atualizando estatísticas gerais da partida...")
        await import_match_stats_async()
