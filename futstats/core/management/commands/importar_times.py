from django.core.management.base import BaseCommand
from core.services.api_football import buscar_times  # Função que você vai criar para buscar times na API
from core.models import Time

class Command(BaseCommand):
    help = "Importa os times da API-FOOTBALL para o banco"

    def handle(self, *args, **kwargs):
        times = buscar_times()  # Função que faz a requisição na API e retorna lista de times

        for item in times:
            info = item["team"]  # De acordo com a estrutura da API-Football

            # Salva ou atualiza no banco com base no ID da API (único)
            Time.objects.update_or_create(
                api_id=info["id"],  # Id único do time na API
                defaults={
                    "nome": info["name"],
                    "sigla": info.get("code"),
                    "pais": info["country"],
                    "fundacao": info.get("founded"),
                    "logo": info.get("logo")
                }
            )

        self.stdout.write(self.style.SUCCESS("Times importados com sucesso!"))
