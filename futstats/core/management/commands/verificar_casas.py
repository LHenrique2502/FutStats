# FutStats/core/management/commands/verificar_casas.py

from django.core.management.base import BaseCommand
from core.services.odds_api import get_available_bookmakers, BRASIL_BOOKMAKERS, LEAGUE_TO_SPORT_KEY
from core.models import League
import asyncio


class Command(BaseCommand):
    help = "Verifica quais casas de apostas estão disponíveis na API para as ligas configuradas"

    def handle(self, *args, **options):
        self.stdout.write("=" * 60)
        self.stdout.write(self.style.SUCCESS("🔍 VERIFICANDO CASAS DE APOSTAS DISPONÍVEIS"))
        self.stdout.write("=" * 60)
        
        leagues = League.objects.filter(name__in=LEAGUE_TO_SPORT_KEY.keys())
        
        if not leagues.exists():
            self.stdout.write(self.style.WARNING("⚠️ Nenhuma liga configurada encontrada."))
            return
        
        all_bookmakers = {}
        brazilian_in_any = set()
        
        for league in leagues:
            sport_key = LEAGUE_TO_SPORT_KEY[league.name]
            self.stdout.write(f"\n📊 Verificando {league.name} (sport_key: {sport_key})...")
            
            bookmakers = asyncio.run(get_available_bookmakers(sport_key))
            
            if not bookmakers:
                self.stdout.write(self.style.WARNING(f"   ⚠️ Nenhuma casa encontrada para {league.name}"))
                continue
            
            all_bookmakers[league.name] = bookmakers
            
            # Verificar quais são brasileiras
            brazilian_in_league = [bk for bk in bookmakers if bk.lower() in [b.lower() for b in BRASIL_BOOKMAKERS]]
            
            if brazilian_in_league:
                brazilian_in_any.update(brazilian_in_league)
                self.stdout.write(self.style.SUCCESS(f"   ✅ {len(bookmakers)} casas disponíveis"))
                self.stdout.write(f"   🇧🇷 Casas brasileiras: {', '.join(brazilian_in_league)}")
            else:
                self.stdout.write(self.style.WARNING(f"   ⚠️ {len(bookmakers)} casas disponíveis, mas nenhuma brasileira"))
            
            # Pequeno delay
            import time
            time.sleep(1)
        
        # Resumo geral
        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS("📊 RESUMO GERAL"))
        self.stdout.write("=" * 60)
        
        all_unique = set()
        for bookmakers in all_bookmakers.values():
            all_unique.update(bookmakers)
        
        self.stdout.write(f"\n✅ Total de casas únicas encontradas: {len(all_unique)}")
        self.stdout.write(f"🇧🇷 Casas brasileiras disponíveis: {len(brazilian_in_any)}")
        
        if brazilian_in_any:
            self.stdout.write(f"\n📋 Lista de casas brasileiras encontradas:")
            for bk in sorted(brazilian_in_any):
                leagues_with_bk = [name for name, bks in all_bookmakers.items() if bk in bks]
                self.stdout.write(f"   - {bk}: disponível em {len(leagues_with_bk)} liga(s)")
        
        self.stdout.write("\n✅ Verificação concluída!")
