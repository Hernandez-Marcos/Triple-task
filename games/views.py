from django.shortcuts import render
from . import game_engine
from rest_framework.decorators import api_view
from rest_framework.response import Response
from . import serializers

# Create your views here.

def index(request):
    grid = game_engine.generate_grid_game()
    math_problem = game_engine.generate_math_game()

    request.session["expected_math_answer"] = math_problem["answer"]
    request.session["expected_grid_answer"] = grid["answer"]

    context = {
        'grid': grid["grid"],
        'math_problem': math_problem["problem"]
    }
    
    return render(request, 'games/index.html', context)

@api_view(['POST'])
def validate(request):
    game = request.data.get("game")
    
    if game == "math":
        serializer = serializers.mathSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_answer = serializer.validated_data["answer"]
        expected_answer = request.session["expected_math_answer"]

        correct = user_answer == expected_answer

        new_math_problem = game_engine.generate_math_game()
        request.session["expected_math_answer"] = new_math_problem["answer"]

        return Response({
            "correct": correct,
            "num_1": new_math_problem["problem"]["num_1"],
            "num_2": new_math_problem["problem"]["num_2"]
        })   

    elif game == "grid":
        serializer = serializers.gridSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_answer = serializer.validated_data["answer"]
        expected_answer = request.session["expected_grid_answer"]

        correct = user_answer == expected_answer

        new_grid = game_engine.generate_grid_game()
        request.session["expected_grid_answer"] = new_grid["answer"]

        return Response({1:1, 2: correct})