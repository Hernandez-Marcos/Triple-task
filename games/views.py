from django.shortcuts import render
from .game_engine import grid_game, math_game, pattern_game
from rest_framework.decorators import api_view
from rest_framework.response import Response
from . import serializers
from django.utils import timezone
import datetime
import threading
from django.contrib.sessions.backends.db import SessionStore
from .models import Match


session_locks = {}

def get_session_lock(session_key):
    if session_key not in session_locks:
        session_locks[session_key] = threading.Lock()
    return session_locks[session_key]

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
    session_key = request.session.session_key
    if session_key is None:
        request.session.save()
        session_key = request.session.session_key

    lock = get_session_lock(session_key)

    with lock:
        
        session = SessionStore(session_key)
        actual_time_end = session.get("time_end")

        if actual_time_end is None:
            raise ValueError("Game not initialized")
        new_time_end = actual_time_end - 1.5
        session["time_end"] = new_time_end
        session.save()
        request.session["time_end"] = new_time_end

    return request.session["time_end"]

@api_view(['POST'])
def validate(request):
    serializer = serializers.GameNameSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    game = serializer.validated_data["game"]

    expected_answer = request.session.get(f"expected_{game}_answer")
    if expected_answer is None:
        return Response({"error": "Expected answer does not exist"}, status=400)

    if timezone.now().timestamp() > request.session.get("time_end", 0):
        return Response({"error": "time over"}, status=403)
    
    if game == "math":
        answer_serializer = serializers.MathSerializer(data=request.data)
        answer_serializer.is_valid(raise_exception=True)

        user_answer = answer_serializer.validated_data["answer"]

        correct = user_answer == expected_answer

        if not correct:
            try:
                penalty_time_end = apply_penalty_to_global_timer(request)
            except ValueError as e:
                return Response({"error": str(e)}, status=400)
        else:
            request.session["score"] = request.session.get("score", 0) + 1
            penalty_time_end = None

        new_math_problem = math_game.generate_math_game()
        request.session["expected_math_answer"] = new_math_problem["answer"]

        return Response({
            "correct": correct,
            "penalty_time_end": penalty_time_end,
            "num_1": new_math_problem["problem"]["num_1"],
            "num_2": new_math_problem["problem"]["num_2"]
        })   

    elif game == "grid":
        answer_serializer = serializers.GridSerializer(data=request.data)
        answer_serializer.is_valid(raise_exception=True)

        user_answer = answer_serializer.validated_data["answer"]

        correct = user_answer == expected_answer

        if not correct:
            try:
                penalty_time_end = apply_penalty_to_global_timer(request)
            except ValueError as e:
                return Response({"error": str(e)}, status=400)
        else:
            request.session["score"] = request.session.get("score", 0) + 1
            penalty_time_end = None

        new_grid = grid_game.generate_grid_game()
        request.session["expected_grid_answer"] = new_grid["answer"]

        return Response({
            "correct": correct,
            "penalty_time_end": penalty_time_end,
            "grid": new_grid["grid"]
        })

    elif game == "pattern":
        answer_serializer = serializers.PatternSerializer(data=request.data) 
        answer_serializer.is_valid(raise_exception=True)
        
        user_answer = answer_serializer.validated_data["answer"]

        correct = user_answer == expected_answer

        if not correct:
            try:
                penalty_time_end = apply_penalty_to_global_timer(request)
            except ValueError as e:
                return Response({"error": str(e)}, status=400)
        else:
            request.session["score"] = request.session.get("score", 0) + 1
            penalty_time_end = None

        new_pattern = pattern_game.generate_pattern_game()
        request.session["expected_pattern_answer"] = new_pattern["answer"]

        return Response({
            "correct": correct,
            "penalty_time_end": penalty_time_end,
            "pattern": new_pattern["pattern"]
        })

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
        time_end = (timezone.now() + datetime.timedelta(seconds=30)).timestamp()
        request.session["time_end"] = time_end
        return Response({
            "ok": True,
            "time_end": time_end
        })

@api_view(['POST'])
def game_timers(request):
    serializer = serializers.GameNameOrAllSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    game = serializer.validated_data["game"]

    if game == "all":

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
    else:
        game_time_end = (timezone.now() + datetime.timedelta(seconds=5)).timestamp()

        request.session[f"{game}_time_end"] = game_time_end

        return Response({
            "ok": True,
            f"{game}_time_end": game_time_end
        })



@api_view(['GET'])
def first_pattern(request):
    pattern = request.session["expected_pattern_answer"]
    return Response({
        "pattern": pattern
    })

@api_view(["POST"])
def match_ended(request):
    if request.user.is_authenticated:
        Match.objects.create(user=request.user, score=request.session["score"])
    request.session["score"] = 0
    return Response({"ok": True})