import random

def generate_grid_game():
    size = 5
    colors = ["red", "blue"]
    grid = [[random.choice(colors) for square in range(size)] for row in range(size)]

    red_count = 0
    blue_count = 0

    for row in grid:
        for color in row:
            if color == "red":
                red_count += 1
            elif color == "blue":
                blue_count += 1

    if red_count > blue_count:
        answer = "red"
    else:
        answer = "blue"

    return {
        "grid": grid,
        "answer": answer
    }

def generate_math_game():
    #problem 1
    num_1 = random.randint(2, 20)
    num_2 = random.randint(2, 20)
    answer = num_1 * num_2

    problem_1 = {
        'problem': {
            'num_1': num_1,
            'num_2': num_2,
        },
        'answer': answer
    }

    return problem_1