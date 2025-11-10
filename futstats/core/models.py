from django.db import models
from django.utils.timezone import now


class League(models.Model):
    last_fetched_at = models.DateTimeField(null=True, blank=True)
    api_id = models.IntegerField(unique=True)  # ID da TheSportsDB
    name = models.CharField(max_length=100)  # Nome da liga (ex: Premier League)
    type = models.CharField(max_length=50, null=True, blank=True)  # League, Cup, etc. (nem sempre fornecido)
    country = models.CharField(max_length=50)  # País da competição
    logo = models.URLField(null=True, blank=True)  # URL do logo da liga
    season = models.CharField(max_length=20)  # Ex: "2024-2025"
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.season})"


class Team(models.Model):
    last_fetched_at = models.DateTimeField(null=True, blank=True)
    api_id = models.IntegerField(unique=True)  # ID da TheSportsDB
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, null=True, blank=True)
    country = models.CharField(max_length=50, null=True, blank=True)
    logo = models.URLField(null=True, blank=True)
    league = models.ForeignKey(League, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Player(models.Model):
    last_fetched_at = models.DateTimeField(null=True, blank=True)
    api_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=100)
    age = models.IntegerField(null=True, blank=True)
    nationality = models.CharField(max_length=50, null=True, blank=True)
    photo = models.URLField(null=True, blank=True)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    position = models.CharField(max_length=30, null=True, blank=True)
    number = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Estatísticas resumidas
    appearences = models.IntegerField(null=True, blank=True)
    lineups = models.IntegerField(null=True, blank=True)
    minutes = models.IntegerField(null=True, blank=True)

    total_goals = models.IntegerField(null=True, blank=True)
    conceded_goals = models.IntegerField(null=True, blank=True)
    assists = models.IntegerField(null=True, blank=True)
    saves = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.name


class Match(models.Model):
    last_fetched_at = models.DateTimeField(null=True, blank=True)
    api_id = models.IntegerField(unique=True)
    date = models.DateTimeField()
    league = models.ForeignKey(League, on_delete=models.CASCADE)

    venue_name = models.CharField(max_length=100, null=True, blank=True)
    venue_city = models.CharField(max_length=50, null=True, blank=True)
    referee = models.CharField(max_length=100, null=True, blank=True)

    home_team = models.ForeignKey(Team, related_name='home_fixtures', on_delete=models.CASCADE)
    away_team = models.ForeignKey(Team, related_name='away_fixtures', on_delete=models.CASCADE)
    home_score = models.IntegerField(null=True, blank=True)
    away_score = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    events_fetched_at = models.DateTimeField(null=True, blank=True)
    stats_fetched_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.home_team} x {self.away_team} ({self.date.strftime('%Y-%m-%d')})"


class MatchEvent(models.Model):
    last_fetched_at = models.DateTimeField(null=True, blank=True)
    match = models.ForeignKey(Match, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)

    player = models.CharField(max_length=100, null=True, blank=True)
    assist = models.CharField(max_length=100, null=True, blank=True)
    type = models.CharField(max_length=50)  # Goal, Card, Substitution
    detail = models.CharField(max_length=100, null=True, blank=True)
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
    match = models.ForeignKey(Match, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)

    shots_on_goal = models.IntegerField(null=True, blank=True)
    shots_off_goal = models.IntegerField(null=True, blank=True)
    total_shots = models.IntegerField(null=True, blank=True)
    corner_kicks = models.IntegerField(null=True, blank=True)
    offsides = models.IntegerField(null=True, blank=True)
    ball_possession = models.CharField(max_length=10, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.match} - {self.team} Statistics"
