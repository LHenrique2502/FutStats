from django.db import models

class Campeonato(models.Model):
    nome = models.CharField(max_length=100)
    pais = models.CharField(max_length=50, blank=True, null=True) # permite que o campo fique vazio no formulário e null no banco de dados
    temporada = models.CharField(max_length=9) # ex: '2024/2025'
    api_code = models.IntegerField(unique=True) # Código único vindo da API externa

    def __str__(self):  # Representação legível do objeto
        return f"{self.nome} - {self.temporada}"  # Ex: "Premier League - 2024/2025"

class Time(models.Model):
    nome = models.CharField(max_length=100)
    sigla = models.CharField(max_length=10, blank=True, null=True)
    pais = models.CharField(max_length=100)
    fundacao = models.IntegerField(blank=True, null=True)
    logo = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.nome
    
class Jogador(models.Model):
    nome = models.CharField(max_length=100)  # Nome do jogador
    posição = models.CharField(max_length=50)  # Posição em campo (ex: atacante, goleiro)
    time = models.ForeignKey(
        Time,
        on_delete=models.SET_NULL,  # Se o time for apagado, o jogador continua no banco com time=None
        null=True,
        related_name='jogadores'  # Permite acessar jogadores a partir do time (ex: time.jogadores.all())
    )
    api_code = models.IntegerField(unique=True)  # Código único vindo da API

    def __str__(self):
        return self.nome
    
class Jogo(models.Model):
    data = models.DateTimeField()  # Data e hora do jogo
    time_mandante = models.ForeignKey(
        Time,
        on_delete=models.CASCADE,
        related_name='jogos_mandante'  # Ex: time.jogos_mandante.all()
    )
    time_visitante = models.ForeignKey(
        Time,
        on_delete=models.CASCADE,
        related_name='jogos_visitante'  # Ex: time.jogos_visitante.all()
    )
    placar_mandante = models.IntegerField()  # Gols do mandante
    placar_visitante = models.IntegerField()  # Gols do visitante
    campeonato = models.ForeignKey(
        Campeonato,
        on_delete=models.CASCADE,
        related_name='jogos'  # Ex: campeonato.jogos.all()
    )
    codigo_api = models.IntegerField(unique=True)  # Código único do jogo vindo da API

    def __str__(self):
        return f"{self.time_mandante} x {self.time_visitante} ({self.data.date()})"
    
class EstatisticasJogo(models.Model):
    jogo = models.ForeignKey(
        Jogo,
        on_delete=models.CASCADE,
        related_name='estatisticas'  # Acesso: jogo.estatisticas.all()
    )
    time = models.ForeignKey(Time, on_delete=models.CASCADE)  # Time ao qual as estatísticas se referem
    jogador = models.ForeignKey(
        Jogador,
        on_delete=models.SET_NULL,
        null=True,
        blank=True  # Pode ser estatística coletiva (sem jogador específico)
    )

    posse_bola = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # Ex: 56.75 (%)
    finalizacoes = models.IntegerField(default=0)  # Número de finalizações
    gols = models.IntegerField(default=0)  # Gols marcados
    assistencias = models.IntegerField(default=0)  # Assistências dadas
    cartoes_amarelos = models.IntegerField(default=0)  # Amarelos recebidos
    cartoes_vermelhos = models.IntegerField(default=0)  # Vermelhos recebidos

    def __str__(self):
        if self.jogador:
            return f"{self.jogador.nome} - {self.jogo}"  # Exibe jogador + jogo
        return f"{self.time.nome} - {self.jogo}"  # Se for estatística coletiva

