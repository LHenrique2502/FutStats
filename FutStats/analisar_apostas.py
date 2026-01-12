import os
import django

# Configura o settings do Django antes de importar qualquer coisa do seu app
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'futstats.settings')
django.setup()

# Agora pode importar tranquilo
from core.views import analisar_e_enviar_telegram

if __name__ == '__main__':
    analisar_e_enviar_telegram()
