# FutStats/core/management/commands/importar_odds.py

from django.core.management.base import BaseCommand
from core.services.odds_api import import_all_odds
from core.betting_utils import get_best_value_bets
import asyncio


class Command(BaseCommand):
    help = "Importa odds da The Odds API e analisa value bets"

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=1,
            help='Número de dias à frente para buscar odds (padrão: 1 = apenas hoje)',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Força atualização mesmo se odds são recentes',
        )
        parser.add_argument(
            '--no-smart',
            action='store_true',
            help='Desativa modo inteligente (atualiza todas as ligas)',
        )

    def handle(self, *args, **options):
        days_ahead = options['days']
        force = options.get('force', False)
        smart = not options.get('no_smart', False)
        
        self.stdout.write("=" * 60)
        # Evitar emojis: no Windows (cp1252) pode causar UnicodeEncodeError no terminal.
        self.stdout.write(self.style.SUCCESS("IMPORTANDO ODDS E ANALISANDO VALUE BETS"))
        self.stdout.write("=" * 60)
        
        # Importar odds
        asyncio.run(import_all_odds(days_ahead=days_ahead, force=force, smart=smart))
        
        # Analisar value bets
        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS("ANALISANDO VALUE BETS..."))
        self.stdout.write("=" * 60)
        
        recommendations = get_best_value_bets(limit=20)
        
        self.stdout.write(f"\nEncontradas {len(recommendations)} apostas com valor:\n")
        
        for i, rec in enumerate(recommendations, 1):
            self.stdout.write(f"{i}. {rec.match}")
            self.stdout.write(f"   Tipo: {rec.bet_type.upper()}")
            self.stdout.write(f"   Odd: {rec.odd_value}")
            self.stdout.write(f"   Probabilidade Calculada: {rec.calculated_probability}%")
            self.stdout.write(f"   Probabilidade Implícita: {rec.implied_probability}%")
            self.stdout.write(f"   Valor Esperado: {rec.expected_value}%")
            self.stdout.write(f"   Confiança: {rec.confidence.upper()}")
            self.stdout.write(f"   Casa: {rec.bookmaker.name if rec.bookmaker else 'N/A'}")
            self.stdout.write("")
        
        self.stdout.write(self.style.SUCCESS("Processo concluído!"))
