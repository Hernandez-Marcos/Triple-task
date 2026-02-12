from django.shortcuts import render
from .game_engine import grid_game, math_game, pattern_game
from rest_framework.decorators import api_view
from rest_framework.response import Response
from . import serializers
from django.utils import timezone
import datetime

# Create your views here.

def index(request):
    grid = grid_game.generate_grid_game()
    math_problem = math_game.generate_math_game()
    pattern = pattern_game.generate_pattern_game()

    request.session["expected_math_answer"] = math_problem["answer"]
    request.session["expected_grid_answer"] = grid["answer"]
    request.session["expected_pattern_answer"] = pattern["answer"]

    context = {
        'grid': grid["grid"],
        'math_problem': math_problem["problem"],
        'keypad_digits': list(range(10))
    }

    return render(request, 'games/index.html', context)

def apply_penalty_to_global_timer(request):
    actual_time_end = request.session.get("time_end")
    if actual_time_end is None:
        raise ValueError("Game not initialized")
    new_time_end = actual_time_end - 1.5
    request.session["time_end"] = new_time_end
    return request.session["time_end"]

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

    elif game == "pattern":
        serializer = serializers.PatternSerializer(data=request.data) 
        serializer.is_valid(raise_exception=True)
        
        user_answer = serializer.validated_data["answer"]
        expected_answer = request.session["expected_pattern_answer"]

        correct = user_answer == expected_answer

        new_pattern = pattern_game.generate_pattern_game()
        request.session["expected_pattern_answer"] = new_pattern["answer"]

        return Response({
            "correct": correct,
            "pattern": new_pattern["pattern"]
        })
    else:
        return Response({"error": "invalid game"}, status=400)

@api_view(['POST'])
def next_game(request):
    serializer = serializers.GameNameSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    game = serializer.validated_data["game"]

    game_time_end = request.session.get(f"{game}_time_end")
    if game_time_end is None:
        return Response({"error": "Game not initialized"}, status=400)
    if game_time_end <= timezone.now().timestamp():
        try:
            penalty_time_end = apply_penalty_to_global_timer(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)
    else:
        penalty_time_end = None


    if game == "math":
        new_math_problem = math_game.generate_math_game()
        request.session["expected_math_answer"] = new_math_problem["answer"]

        return Response({
            "num_1": new_math_problem["problem"]["num_1"],
            "num_2": new_math_problem["problem"]["num_2"],
            "penalty_time_end": penalty_time_end
        })   
    elif game == "grid":
        new_grid = grid_game.generate_grid_game()
        request.session["expected_grid_answer"] = new_grid["answer"]

        return Response({
            "grid": new_grid["grid"],
            "penalty_time_end": penalty_time_end
        })
    elif game == "pattern": 
        new_pattern = pattern_game.generate_pattern_game()
        request.session["expected_pattern_answer"] = new_pattern["answer"]

        return Response({
            "pattern": new_pattern["pattern"],
            "penalty_time_end": penalty_time_end
        })

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
        time_end = (timezone.now() + datetime.timedelta(seconds=60)).timestamp()
        request.session["time_end"] = time_end
        return Response({
            "ok": True,
            "time_end": time_end
        })

@api_view(['POST'])
def game_timers(request):
    math_time_end = (timezone.now() + datetime.timedelta(seconds=5)).timestamp()
    grid_time_end = (timezone.now() + datetime.timedelta(seconds=5)).timestamp()
    pattern_time_end = (timezone.now() + datetime.timedelta(seconds=5)).timestamp()

    request.session["math_time_end"] = math_time_end
    request.session["grid_time_end"] = grid_time_end
    request.session["pattern_time_end"] = pattern_time_end

    return Response({
        "ok": True,
        "math_time_end": math_time_end,
        "grid_time_end": grid_time_end,
        "pattern_time_end": pattern_time_end
    })



@api_view(['GET'])
def first_pattern(request):
    pattern = request.session["expected_pattern_answer"]
    return Response({
        "pattern": pattern
    })  