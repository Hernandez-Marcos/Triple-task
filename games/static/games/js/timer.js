window.gameState = {
    isPatternShowing: true,
    timeEnds: {
        global: null,
        math: null,
        grid: null,
        pattern: null,
    },
    score: 0
}

const activeTimers = {

}

const timerConfig = {
    global: {
        getEl: () => document.querySelector(".timer-bar"),
        onFinish: () => {
            window.gameState.score = 0
            document.getElementById("score-value").textContent = 0

            fetch("/games/api/match-ended/", {
                method: "POST",
            })
            
            const finishScreenEl = document.querySelector(".finish-screen")
            finishScreenEl.style.display = "flex"
        }
    },

    math: {
        getEl: () => document.querySelector(".math-game .game-timer-bar"),
        onFinish: () => {
            fetch("/games/api/next-game/", {
                method: "POST",
                body: JSON.stringify({ game: "math" }),
                headers: {
                    "Content-Type": "application/json",
                },
            })
              .then((res) => res.json())
              .then((res) => {
                updateMathGame(res)

                console.log("holaa math", window.gameState.timeEnds["global"])
                window.gameState.timeEnds["global"] = res.penalty_time_end  
                console.log("holaa math", window.gameState.timeEnds["global"])              

                fetch("/games/api/game-timers/", {
                    method: "POST",
                    body: JSON.stringify({ game: "math" }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                  .then((res) => res.json())
                  .then((res) => {
                    startTimer(res.math_time_end, "math")
                  })
              })
        }
    },

    grid: {
        getEl: () => document.querySelector(".grid-game .game-timer-bar"),
        onFinish: () => {
            fetch("/games/api/next-game/", {
                method: "POST",
                body: JSON.stringify({ game: "grid" }),
                headers: {
                    "Content-Type": "application/json",
                },
            })
              .then((res) => res.json())
              .then((res) => {
                updateGridGame(res)

                console.log("holaaa grid", window.gameState.timeEnds["global"])
                window.gameState.timeEnds["global"] = res.penalty_time_end  
                console.log("holaaa grid", window.gameState.timeEnds["global"])   

                fetch("/games/api/game-timers/", {
                    method: "POST",
                    body: JSON.stringify({ game: "grid" }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                  .then((res) => res.json())
                  .then((res) => {
                    startTimer(res.grid_time_end, "grid")
                  })
              })
        }
    },

    pattern: {
        getEl: () => document.querySelector(".pattern-game .game-timer-bar"),
        onFinish: () => {
            fetch("/games/api/next-game/", {
                method: "POST",
                body: JSON.stringify({ game: "pattern" }),
                headers: {
                    "Content-Type": "application/json",
                },
            })
              .then((res) => res.json())
              .then((res) => {
                updatePatternGame(res)
                
                console.log("holaaa pattern", window.gameState.timeEnds["global"])
                window.gameState.timeEnds["global"] = res.penalty_time_end  
                console.log("holaaa pattern", window.gameState.timeEnds["global"])   

                fetch("/games/api/game-timers/", {
                    method: "POST",
                    body: JSON.stringify({ game: "pattern" }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                  .then((res) => res.json())
                  .then((res) => {
                    startTimer(res.pattern_time_end, "pattern")
                  })
              })
        }
    }
}

function startTimer(timeEnd, type) {
    const {getEl, onFinish} = timerConfig[type]
    const timerBarEl = getEl()

    if (!timeEnd) return

    window.gameState.timeEnds[type] = timeEnd
    //convert miliseconds to seconds
    let timeNow = Date.now() / 1000

    const totalTime = timeEnd - timeNow

    if (activeTimers[type]) {
        clearInterval(activeTimers[type])
    }

    activeTimers[type] = setInterval(() => {
        const timeRemaining = window.gameState.timeEnds[type] - Date.now() / 1000
        const widthPercent = (timeRemaining / totalTime) * 100
        timerBarEl.style.width = widthPercent + "%"

        if (timeRemaining <= 0) {
            clearInterval(activeTimers[type])
            timerBarEl.style.width = "0%"
            onFinish()
        }
    }, 50)
}

document.getElementById("start-game").addEventListener("click", () => {
    fetch("/games/api/timer/", {
        method: "POST"
    }).then((res) => res.json())
    .then((res) => {
        const startScreenEl = document.querySelector(".start-screen")
        startScreenEl.style.display = "none"
        startTimer(res.time_end, "global")
        getFirstPattern()
    })

    fetch("/games/api/game-timers/", {
        method: "POST",
        body: JSON.stringify({ game: "all" }),
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json())
    .then((res) => {
        startTimer(res.math_time_end, "math")
        startTimer(res.grid_time_end, "grid")
        startTimer(res.pattern_time_end, "pattern")
    })
})

document.getElementById("play-again").addEventListener("click", () => {
    fetch("/games/api/timer/", {
        method: "POST"
    }).then((res) => res.json())
    .then((res) => {
        const finishScreenEl = document.querySelector(".finish-screen")
        finishScreenEl.style.display = "none"
        startTimer(res.time_end, "global")
        getFirstPattern()
    })

    fetch("/games/api/game-timers/", {
        method: "POST",
        body: JSON.stringify({ game: "all" }),
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json())
    .then((res) => {
        startTimer(res.math_time_end, "math")
        startTimer(res.grid_time_end, "grid")
        startTimer(res.pattern_time_end, "pattern")
    })
})

function getFirstPattern() {
    const patternContainer = document.querySelector(".pattern-game")
    let count = 0

    fetch("/games/api/first-pattern/", {
        method: "GET"
    }).then((res) => res.json())
    .then((res) => {
        const intervalId = setInterval(() => {
            patternContainer.style.backgroundColor = res.pattern[count]
            count++

            // Reinicia animación CSS para pulso
            patternContainer.classList.remove("pulse");
            void patternContainer.offsetWidth; // fuerza recalculo
            patternContainer.classList.add("pulse");

            if (count >= res.pattern.length) {
                clearInterval(intervalId)
                setTimeout(() => {
                    patternContainer.style.backgroundColor = "white"
                    patternContainer.classList.remove("pulse");
                    window.gameState.isPatternShowing = false
                }, 750)

            }            
        }, 750)
    })
}