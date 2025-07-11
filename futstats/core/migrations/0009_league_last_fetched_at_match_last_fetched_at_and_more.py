# Generated by Django 5.2.1 on 2025-07-05 19:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_league_created_at_match_created_at_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='league',
            name='last_fetched_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='match',
            name='last_fetched_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='matchevent',
            name='last_fetched_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='player',
            name='last_fetched_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='team',
            name='last_fetched_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='teamstatistics',
            name='last_fetched_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
