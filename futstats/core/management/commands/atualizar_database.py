from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Atualiza o banco de dados com novas ligas, times, jogadores e partidas'

    def handle(self, *args, **options):
            comandos = ['importar_ligas', 'importar_times', 'importar_jogadores', 'importar_partidas', 'importar_estatisticas', 'importar_estatisticas_partida']

            self.stdout.write(self.style.SUCCESS("🚀 Iniciando atualização do banco de dados..."))

            for comando in comandos:
                self.stdout.write(self.style.WARNING(f"▶️ Executando: {comando}"))
                try:
                    call_command(comando)
                    self.stdout.write(self.style.SUCCESS(f"✅ Comando {comando} finalizado com sucesso.\n"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"❌ Erro ao executar o comando {comando}: {e}"))

            self.stdout.write(self.style.SUCCESS("🏁 Todos os comandos foram processados."))