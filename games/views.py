from django.shortcuts import render
from . import game_engine

# Create your views here.

def index(request):
    context = {
        'grid': game_engine.generate_grid_game()
    }
    return render(request, 'games/index.html', context)