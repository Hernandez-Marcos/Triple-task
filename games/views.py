from django.shortcuts import render
import random

# Create your views here.

def generate_grid_game():
    size = 5
    colors = ["red", "blue"]
    grid = [[random.choice(colors) for square in range(size)] for row in range(size)]
    return grid

def generate_math_game():
    #problem 1
    num_1 = random.randint(2, 20)
    num_2 = random.randint(2, 20)
    answer = num_1 * num_2

    problem_1 = {
        'num_1': num_1,
        'num_2': num_2,
        'answer': answer
    }
    
    #problem 2




def index(request):
    context = {
        'grid': generate_grid_game()
    }
    return render(request, 'games/index.html', context)