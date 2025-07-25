from django.db import models
from django.utils.timezone import now

class League(models.Model):
    last_fetched_at = models.DateTimeField(null=True, blank=True)
    api_id = models.IntegerField(unique=True) # ID fornecido pela API-Football
    name = models.CharField(max_length=100) # Nome da liga (ex: Premier League) 
    type = models.CharField(max_length=50) # Tipo da competição (League, Cup, etc.)  
    country = models.CharField(max_length=50) # País da competição (ex: England, Brazil)   
    logo = models.URLField(null=True, blank=True) # URL do logo da liga    
    season = models.IntegerField() # Temporada associada (ex: 2023)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.season})"

class Team(models.Model):
    
    last_fetched_at = models.DateTimeField(null=True, blank=True)
    api_id = models.IntegerField(unique=True) # ID fornecido pela API-Football    
    name = models.CharField(max_length=100) # Nome do time   
    code = models.CharField(max_length=10, null=True, blank=True) # Código curto do time (ex: MCI, PSG)    
    country = models.CharField(max_length=50) # País do time   
    logo = models.URLField(null=True, blank=True) # URL do logo do time    
    league = models.ForeignKey(League, on_delete=models.CASCADE) # Liga à qual o time está associado
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Player(models.Model):   

    last_fetched_at = models.DateTimeField(null=True, blank=True)
    api_id = models.IntegerField(unique=True)  # ID fornecido pela API-Football
    name = models.CharField(max_length=100)  # Nome do jogador
    age = models.IntegerField(null=True, blank=True)  # Idade
    nationality = models.CharField(max_length=50, null=True, blank=True)  # Nacionalidade
    photo = models.URLField(null=True, blank=True)  # Foto
    team = models.ForeignKey(Team, on_delete=models.CASCADE)  # Time associado
    position = models.CharField(max_length=30, null=True, blank=True)  # Posição em campo
    number = models.IntegerField(null=True, blank=True)  # Camisa
    created_at = models.DateTimeField(auto_now_add=True)

    # Campos adicionais de 'games'
    appearences = models.IntegerField(null=True, blank=True)  # Jogos jogados
    lineups = models.IntegerField(null=True, blank=True)  # Escalado como titular
    minutes = models.IntegerField(null=True, blank=True)  # Minutos jogados

    # Campos adicionais de 'goals'
    total_goals = models.IntegerField(null=True, blank=True)  # Gols marcados
    conceded_goals = models.IntegerField(null=True, blank=True)  # Gols sofridos (relevante para goleiros)
    assists = models.IntegerField(null=True, blank=True)  # Assistências
    saves = models.IntegerField(null=True, blank=True)  # Defesas (relevante para goleiros)

    def __str__(self):
        return self.name

class Match(models.Model):

    last_fetched_at = models.DateTimeField(null=True, blank=True)
    api_id = models.IntegerField(unique=True)
    date = models.DateTimeField()
    league = models.ForeignKey(League, on_delete=models.CASCADE)

    venue_name = models.CharField(max_length=100, null=True, blank=True)
    venue_city = models.CharField(max_length=50, null=True, blank=True)
    venue_capacity = models.IntegerField(null=True, blank=True)
    referee = models.CharField(max_length=100, null=True, blank=True)

    home_team = models.ForeignKey(Team, related_name='home_fixtures', on_delete=models.CASCADE)
    away_team = models.ForeignKey(Team, related_name='away_fixtures', on_delete=models.CASCADE)
    home_score = models.IntegerField(null=True, blank=True)
    away_score = models.IntegerField(null=True, blank=True)
    home_penalties = models.IntegerField(null=True, blank=True)
    away_penalties = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    events_fetched_at = models.DateTimeField(null=True, blank=True)
    stats_fetched_at = models.DateTimeField(null=True, blank=True)


    def __str__(self):
        return f"{self.home_team} x {self.away_team} ({self.date.strftime('%Y-%m-%d')})"


class MatchEvent(models.Model):

    last_fetched_at = models.DateTimeField(null=True, blank=True)
    match = models.ForeignKey('Match', on_delete=models.CASCADE)
    team = models.ForeignKey('Team', on_delete=models.CASCADE)
    player = models.CharField(max_length=100, null=True, blank=True)
    assist = models.CharField(max_length=100, null=True, blank=True)
    type = models.CharField(max_length=50)  # Goal, Card, Substitution
    detail = models.CharField(max_length=100, null=True, blank=True)  # Yellow Card, Red Card, Normal Goal, etc.
    comments = models.TextField(null=True, blank=True)
    minute = models.IntegerField()
    extra_minute = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    events_fetched_at = models.DateTimeField(null=True, blank=True)
    stats_fetched_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.match} - {self.type} ({self.detail}) - {self.player}"

class TeamStatistics(models.Model):

    last_fetched_at = models.DateTimeField(null=True, blank=True)
    match = models.ForeignKey('Match', on_delete=models.CASCADE)
    team = models.ForeignKey('Team', on_delete=models.CASCADE)

    shots_on_goal = models.IntegerField(null=True, blank=True)
    shots_off_goal = models.IntegerField(null=True, blank=True)
    total_shots = models.IntegerField(null=True, blank=True)
    blocked_shots = models.IntegerField(null=True, blank=True)
    shots_inside_box = models.IntegerField(null=True, blank=True)
    shots_outside_box = models.IntegerField(null=True, blank=True)

    fouls = models.IntegerField(null=True, blank=True)
    corner_kicks = models.IntegerField(null=True, blank=True)
    offsides = models.IntegerField(null=True, blank=True)

    ball_possession = models.CharField(max_length=10, null=True, blank=True)  # Ex: "56%"
    yellow_cards = models.IntegerField(null=True, blank=True)
    red_cards = models.IntegerField(null=True, blank=True)

    passes = models.IntegerField(null=True, blank=True)
    accurate_passes = models.IntegerField(null=True, blank=True)
    pass_percentage = models.CharField(max_length=10, null=True, blank=True)  # Ex: "85%"
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.match} - {self.team} Statistics"
    
# TODO: Adequar a chamada importar_estatisticas para utilizaar tambem a função TeamStatistcs
# TODO: Refatorar as funções para a necessidade de importação