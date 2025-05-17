from django.core.management.base import BaseCommand
from core.services.api_football import buscar_times
from core.models import Time

class Command(BaseCommand):
    help = "Importa os times da API-FOOTBALL"

    def handle(self, *args, **kwargs):
        times = buscar_times()  # busca os dados da API

        for item in times:
            info = item["team"]

            # Salva no banco. Se já existir, atualiza.
            Time.objects.update_or_create(
                nome=info["name"],
                defaults={
                    "sigla": info.get("code"),
                    "pais": info["country"],
                    "fundacao": info.get("founded"),
                    "logo": info.get("logo")
                }
            )

        self.stdout.write(self.style.SUCCESS("Times importados com sucesso."))
