window.gameState = {
    isPatternShowing: true
}

const timerConfig = {
    global: {
        getEl: () => document.querySelector(".timer-bar"),
        onFinish: () => {
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
                
                fetch("/games/api/game-timers/", {
                    method: "POST"
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

                fetch("/games/api/game-timers/", {
                    method: "POST"
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

                fetch("/games/api/game-timers/", {
                    method: "POST"
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
    console.log("timeend:", timeEnd)
    const {getEl, onFinish} = timerConfig[type]
    const timerBarEl = getEl()

    if (!timeEnd) return
    //convert miliseconds to seconds
    let timeNow = Date.now() / 1000
    console.log("timenow:", timeNow)

    const totalTime = timeEnd - timeNow

    console.log(totalTime)

    const intervalId = setInterval(() => {
        const timeRemaining = timeEnd - Date.now() / 1000
        const widthPercent = (timeRemaining / totalTime) * 100
        timerBarEl.style.width = widthPercent + "%"

        if (timeRemaining <= 0) {
            clearInterval(intervalId)
            timerBarEl.style.width = "0%"
            onFinish()
        }
    }, 50)

    console.log("asdasdasdasd", totalTime)
    
}

document.getElementById("start-game").addEventListener("click", () => {
    console.log("holaa, empezando partida")
    fetch("/games/api/timer/", {
        method: "POST"
    }).then((res) => res.json())
    .then((res) => {
        console.log(res)
        const startScreenEl = document.querySelector(".start-screen")
        startScreenEl.style.display = "none"
        startTimer(res.time_end, "global")
        getFirstPattern()
    })

    fetch("/games/api/game-timers/", {
        method: "POST",
    }).then((res) => res.json())
    .then((res) => {
        console.log(res)
        startTimer(res.math_time_end, "math")
        startTimer(res.grid_time_end, "grid")
        startTimer(res.pattern_time_end, "pattern")
    })
})

document.getElementById("play-again").addEventListener("click", () => {
    console.log("holaa, empezando partida otra vez")
    fetch("/games/api/timer/", {
        method: "POST"
    }).then((res) => res.json())
    .then((res) => {
        console.log(res)
        const finishScreenEl = document.querySelector(".finish-screen")
        finishScreenEl.style.display = "none"
        startTimer(res.time_end, "global")
        getFirstPattern()
    })

    fetch("/games/api/game-timers/", {
        method: "POST",
    }).then((res) => res.json())
    .then((res) => {
        console.log(res)
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
        console.log(res)
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