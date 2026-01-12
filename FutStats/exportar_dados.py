import json
from django.core.management import call_command

with open("dados.json", "w", encoding="utf-8") as f:
    call_command("dumpdata", indent=2, stdout=f)
