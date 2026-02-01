import random

def generate_pattern_game():
    length_of_pattern = 3
    colors = ["blue", "green", "yellow"]
    pattern = [random.choice(colors) for i in range(length_of_pattern)]
    
    return {
        "pattern": pattern,
        "answer": pattern
    }