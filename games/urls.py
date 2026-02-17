from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name='index'),
    path("api/validate/", views.validate, name='validate'),
    path("api/timer/", views.timer, name="timer"),
    path("api/game-timers/", views.game_timers, name="game-timers"),
    path("api/next-game/", views.next_game, name="next-game"),
    path("api/first-pattern/", views.first_pattern, name="first_pattern"),
    path("api/match-ended/", views.match_ended, name="match-ended")
]   