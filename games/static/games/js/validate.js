scoreValueEl = document.getElementById("score-value")

// Math game

function updateMathGame(data) {
    let num_1 = document.getElementById("num-1")
    let num_2 = document.getElementById("num-2")

    num_1.textContent = data["num_1"]
    num_2.textContent = data["num_2"]
    document.getElementById("math-answer").value = ""

}

function handleMathGame() {
    const game = "math"
    const answer = document.getElementById("math-answer").value
    

    if (answer == "") {
        return
    }
        
    fetch("/games/api/validate/", {
        method: "POST",
        body: JSON.stringify({ "answer": answer, "game": game }),
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": window.csrftoken,
        },
        mode: "same-origin",
    })
      .then((res) => res.json())
      .then((res) => {
        updateMathGame(res)

        if (res.correct) {
            window.gameState.score++
            scoreValueEl.textContent = window.gameState.score
        } else {
            window.gameState.timeEnds["global"] = res.penalty_time_end
        }

        fetch("/games/api/game-timers/", {
            method: "POST",
            body: JSON.stringify({ game: "math" }),
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": window.csrftoken,
            },
            mode: "same-origin",
        })
          .then((res) => res.json())
          .then((res) => {
            startTimer(res.math_time_end, "math")
          })
      })
    
}

document.getElementById("submit-math-answer").addEventListener("click", handleMathGame)

//math-keypad

function handleMathKeypadInput(event) {
    if (!event.target.classList.contains("keypad-button")) {
        return
    }

    const button = event.target
    
    const mathAnswerEl = document.getElementById("math-answer")

    if (button.dataset.action === "delete") {
        mathAnswerEl.value = mathAnswerEl.value.slice(0, -1)
        return
    }

    mathAnswerEl.value += button.value

}

document.querySelector(".math-keypad").addEventListener("click", handleMathKeypadInput)

// Grid game

function updateGridGame(data) {
    const gridContainer = document.querySelector(".grid-game")

    gridContainer.innerHTML = ""
    const timerBarEl = document.createElement("div")
    timerBarEl.classList.add("game-timer-bar")
    gridContainer.appendChild(timerBarEl)

    for (const row of data.grid) {
        for (const color of row) {
            const squareEl = document.createElement("div")
            squareEl.classList.add("square", color)
            gridContainer.appendChild(squareEl)
        }
    }
}

function handleGridGame(event) {
    const game = "grid"
    let answer = null

    if (!event.target.classList.contains("square")) {
        return
    }
    

    if (event.target.classList.contains("red")) {
        answer = "red";
    } else if (event.target.classList.contains("blue")) {
        answer = "blue";
    }

    fetch("/games/api/validate/", {
        method: "POST",
        body: JSON.stringify({ "answer": answer, "game": game }),
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": window.csrftoken,
        },
        mode: "same-origin",
    })
      .then((res) => {
        if (!res.ok) {
            console.log("Error: time ended", res.status)
            throw new Error("time ended") 
        }
        return res.json()
      })
      .then((res) => {
        updateGridGame(res)

        if (res.correct) {
            window.gameState.score++
            scoreValueEl.textContent = window.gameState.score
        } else {
            window.gameState.timeEnds["global"] = res.penalty_time_end
        }

        fetch("/games/api/game-timers/", {
            method: "POST",
            body: JSON.stringify({ game: "grid" }),
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": window.csrftoken,
            },
            mode: "same-origin",
        })
          .then((res) => res.json())
          .then((res) => {
            startTimer(res.grid_time_end, "grid")
          })
    })
      .catch((err) => {
        console.log(err)
      })

}

document.querySelector(".grid-game").addEventListener("click", handleGridGame)

// Pattern game

function updatePatternGame(data) {
    const patternContainer = document.querySelector(".pattern-game")
    let count = 0

    const intervalId = setInterval(() => {
        patternContainer.style.backgroundColor = data.pattern[count]
        count++

        // Reinicia animación CSS para pulso
        patternContainer.classList.remove("pulse");
        void patternContainer.offsetWidth; // fuerza recalculo
        patternContainer.classList.add("pulse");

        if (count >= data.pattern.length) {
            clearInterval(intervalId)
            setTimeout(() => {
                patternContainer.style.backgroundColor = "white"
                patternContainer.classList.remove("pulse");
                window.gameState.isPatternShowing = false
            }, 750)

        }            
    }, 750)
}

let patternAnswer = []

function handlePatternGame(event) {
    const game = "pattern"
    
    if (!event.target.classList.contains("pattern-button")) {
        return
    }

    if (event.target.classList.contains("blue")) {
        patternAnswer.push("blue")
    } else if (event.target.classList.contains("green")) {
        patternAnswer.push("green")
    } else if (event.target.classList.contains("yellow")) {
        patternAnswer.push("yellow")
    }

    if (patternAnswer.length === 3) {
        window.gameState.isPatternShowing = true
        
        fetch("/games/api/validate/", {
            method: "POST",
            body: JSON.stringify({ "game": game, "answer": patternAnswer }),
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": window.csrftoken,
            },
            mode: "same-origin",
        })
          .then((res) => {
            if (!res.ok) {
                console.log("Error: time ended", res.status)
                throw new Error("time ended") 
            }
            return res.json()
          })
          .then((res) => {
            updatePatternGame(res)
            patternAnswer = []

            if (res.correct) {
                window.gameState.score++
                scoreValueEl.textContent = window.gameState.score
            } else {
                window.gameState.timeEnds["global"] = res.penalty_time_end
            }

            fetch("/games/api/game-timers/", {
                method: "POST",
                body: JSON.stringify({ game: "pattern"}),
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": window.csrftoken,
                },
                mode: "same-origin",
            })
              .then((res) => res.json())
              .then((res) => {
                startTimer(res.pattern_time_end, "pattern")
              })
          })
          .catch((err) => {
            console.log(err)
          })
    }

}

document.querySelector(".pattern-game").addEventListener("click", function(event) {
    if (window.gameState.isPatternShowing) {
        return
    }
    handlePatternGame(event)
})