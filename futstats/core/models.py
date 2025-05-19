from django.db import models

class League(models.Model):
    api_id = models.IntegerField(unique=True) # ID fornecido pela API-Football
    name = models.CharField(max_length=100) # Nome da liga (ex: Premier League) 
    type = models.CharField(max_length=50) # Tipo da competição (League, Cup, etc.)  
    country = models.CharField(max_length=50) # País da competição (ex: England, Brazil)   
    logo = models.URLField(null=True, blank=True) # URL do logo da liga    
    season = models.IntegerField() # Temporada associada (ex: 2023)

    def __str__(self):
        return f"{self.name} ({self.season})"

class Team(models.Model):
    
    api_id = models.IntegerField(unique=True) # ID fornecido pela API-Football    
    name = models.CharField(max_length=100) # Nome do time   
    code = models.CharField(max_length=10, null=True, blank=True) # Código curto do time (ex: MCI, PSG)    
    country = models.CharField(max_length=50) # País do time   
    logo = models.URLField(null=True, blank=True) # URL do logo do time    
    league = models.ForeignKey(League, on_delete=models.CASCADE) # Liga à qual o time está associado

    def __str__(self):
        return self.name


class Player(models.Model):   
    api_id = models.IntegerField(unique=True) # ID fornecido pela API-Football   
    name = models.CharField(max_length=100) # Nome do jogador   
    age = models.IntegerField(null=True, blank=True) # Idade do jogador (se disponível)   
    nationality = models.CharField(max_length=50, null=True, blank=True) # Nacionalidade (ex: Brazil, France)    
    photo = models.URLField(null=True, blank=True) # Foto do jogador (URL)     
    team = models.ForeignKey(Team, on_delete=models.CASCADE) # Time ao qual o jogador pertence    
    position = models.CharField(max_length=30, null=True, blank=True) # Posição (ex: Attacker, Midfielder)    
    number = models.IntegerField(null=True, blank=True) # Número da camisa (se disponível)

    def __str__(self):
        return self.name


class Match(models.Model):   
    api_id = models.IntegerField(unique=True) # ID fornecido pela API-Football   
    league = models.ForeignKey(League, on_delete=models.CASCADE) # Liga da partida   
    home_team = models.ForeignKey(Team, related_name='home_matches', on_delete=models.CASCADE) # Time da casa
    away_team = models.ForeignKey(Team, related_name='away_matches', on_delete=models.CASCADE) # Time visitante    
    date = models.DateTimeField() # Data e hora da partida   
    status = models.CharField(max_length=50) # Status da partida (Scheduled, Finished, In Play, etc.)   
    round = models.CharField(max_length=50, null=True, blank=True) # Rodada (ex: "Regular Season - 1")   
    venue = models.CharField(max_length=100, null=True, blank=True) # Nome do estádio    
    home_score = models.IntegerField(null=True, blank=True) # Placar do time da casa    
    away_score = models.IntegerField(null=True, blank=True) # Placar do time visitante

    def __str__(self):
        return f"{self.home_team} vs {self.away_team} - {self.date.strftime('%d/%m/%Y')}"


class MatchStatistic(models.Model):   
    match = models.ForeignKey(Match, on_delete=models.CASCADE) # Partida à qual a estatística pertence    
    team = models.ForeignKey(Team, on_delete=models.CASCADE) # Time ao qual a estatística se refere    
    type = models.CharField(max_length=100) # Tipo de estatística (ex: Possession, Shots on Target)    
    value = models.CharField(max_length=20) # Valor da estatística (ex: "58%", "3", etc.)

    def __str__(self):
        return f"{self.type} - {self.team.name} - {self.match.id}"
