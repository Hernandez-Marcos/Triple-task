from django.shortcuts import render
from .game_engine import grid_game, math_game
from rest_framework.decorators import api_view
from rest_framework.response import Response
from . import serializers
from django.utils import timezone
import datetime

# Create your views here.

def index(request):
    grid = grid_game.generate_grid_game()
    math_problem = math_game.generate_math_game()

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

    if timezone.now().timestamp() > request.session.get("time_end", 0):
        return Response({"error": "time over"}, status=403)
    
    if game == "math":
        serializer = serializers.MathSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_answer = serializer.validated_data["answer"]
        expected_answer = request.session["expected_math_answer"]

        correct = user_answer == expected_answer

        new_math_problem = math_game.generate_math_game()
        request.session["expected_math_answer"] = new_math_problem["answer"]

        return Response({
            "correct": correct,
            "num_1": new_math_problem["problem"]["num_1"],
            "num_2": new_math_problem["problem"]["num_2"]
        })   

    elif game == "grid":
        serializer = serializers.GridSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_answer = serializer.validated_data["answer"]
        expected_answer = request.session["expected_grid_answer"]

        correct = user_answer == expected_answer

        new_grid = grid_game.generate_grid_game()
        request.session["expected_grid_answer"] = new_grid["answer"]

        return Response({
            "correct": correct,
            "grid": new_grid["grid"]
        })
    else:
        return Response({"error": "invalid game"}, status=400)


@api_view(['GET', 'POST'])
def timer(request):
    if request.method == "GET":
        #timer remaining
        time_end = request.session.get("time_end")
        if time_end:
            time_end = datetime.datetime.fromtimestamp(time_end, tz=timezone.get_current_timezone())
            time_remaining = (time_end - timezone.now()).total_seconds()
            time_remaining = max(0, time_remaining)
            return Response({
                "time_remaining": time_remaining
            })
        return Response({
            "time_remaining": None
        })
    if request.method == "POST":
        #start timer
        print("POST TIMER", request.session)
        request.session["time_end"] = (timezone.now() + datetime.timedelta(seconds=60)).timestamp()
        return Response({
            "ok": True
        })
        