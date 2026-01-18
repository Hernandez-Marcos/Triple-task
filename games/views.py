from django.shortcuts import render
from . import game_engine
from rest_framework.decorators import api_view

# Create your views here.

def index(request):
    context = {
        'grid': game_engine.generate_grid_game(),
        'math_problem': game_engine.generate_math_game()
    }
    return render(request, 'games/index.html', context)

@api_view(['POST'])
def validate(request):
    pass