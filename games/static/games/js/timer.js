import { flashGameWrapper, playSoundFeedback } from './validate.js'

window.gameState = {
    patternGame: {
        isPatternShowing: true,
        intervalId: null,
        timeoutId: null,
    },
    timeEnds: {
        global: null,
        math: null,
        grid: null,
        pattern: null,
    },    
    score: 0,
    gameEnded: false
}

window.timeOffset = 0

function syncTime() {
    const t1 = Date.now() / 1000

    return fetch("/games/api/server-time/")
      .then((res) => res.json())
      .then((res) => {
        const t2 = Date.now() / 1000
        const midPoint = (t1+t2)/2
        window.timeOffset = res.server_time - midPoint
        console.log(window.timeOffset )
      })
}

function getServerNow() {
    return Date.now() / 1000 + window.timeOffset
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
window.csrftoken = getCookie('csrftoken');

const activeTimers = {

}

function clearPatternGame() {
    clearInterval(window.gameState.patternGame.intervalId)
    clearTimeout(window.gameState.patternGame.timeoutId)

    const patternContainer = document.querySelector(".pattern-game")

    patternContainer.style.backgroundColor = "#1E1E1E"
    patternContainer.classList.remove("pulse");
}

const timerConfig = {
    global: {
        getEl: () => document.querySelector(".timer-bar"),
        onFinish: () => {
            const finalScore = window.gameState.score
            document.querySelector(".game-score").textContent = finalScore

            window.gameState.score = 0
            document.getElementById("score-value").textContent = 0

            fetch("/games/api/match-ended/", {
                method: "POST",
                headers: { "X-CSRFToken": window.csrftoken },
                mode: "same-origin"
            })
              .then(res => res.json())
              .then(res => {
                console.log(res, "ewee")
                document.querySelector(".record-score").textContent = res.user_score_record
              })

            window.gameState.gameEnded = true

            for (const id of Object.values(activeTimers)) {
                console.log("clearing", id)
                clearInterval(id)
            }
            
            const finishScreenEl = document.querySelector(".finish-screen")
            finishScreenEl.style.display = "flex"
        }
    },

    math: {
        getEl: () => document.getElementById("math-timer"),
        onFinish: () => {
            flashGameWrapper(document.querySelector(".math-game"), false)
            playSoundFeedback(false)

            fetch("/games/api/next-game/", {
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
                updateMathGame(res)

                console.log("holaa math", window.gameState.timeEnds["global"])
                console.log(res.penalty_time_end)
                window.gameState.timeEnds["global"] = res.penalty_time_end  
                console.log("holaa math", window.gameState.timeEnds["global"])              

                fetch("/games/api/game-timers/", {
                    method: "POST",
                    body: JSON.stringify({ game: "math" }),
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": window.csrftoken
                    },
                    mode: "same-origin",
                })
                  .then((res) => res.json())
                  .then((res) => {
                    startTimer(res.math_time_end, "math")
                  })
              })
        }
    },

    grid: {
        getEl: () => document.getElementById("grid-timer"),
        onFinish: () => {
            flashGameWrapper(document.querySelector(".grid-game"), false)
            playSoundFeedback(false)

            fetch("/games/api/next-game/", {
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
                updateGridGame(res)

                console.log("holaaa grid", window.gameState.timeEnds["global"])
                console.log(res.penalty_time_end)
                window.gameState.timeEnds["global"] = res.penalty_time_end  
                console.log("holaaa grid", window.gameState.timeEnds["global"])   

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
        }
    },

    pattern: {
        getEl: () => document.getElementById("pattern-timer"),
        onFinish: () => {
            flashGameWrapper(document.querySelector(".pattern-game"), false)
            playSoundFeedback(false)

            fetch("/games/api/next-game/", {
                method: "POST",
                body: JSON.stringify({ game: "pattern" }),
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": window.csrftoken,
                },
                mode: "same-origin",
            })
              .then((res) => res.json())
              .then((res) => {
                updatePatternGame(res)
                
                console.log("holaaa pattern", window.gameState.timeEnds["global"])
                console.log(res.penalty_time_end)
                window.gameState.timeEnds["global"] = res.penalty_time_end  
                console.log("holaaa pattern", window.gameState.timeEnds["global"])   

                fetch("/games/api/game-timers/", {
                    method: "POST",
                    body: JSON.stringify({ game: "pattern" }),
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
        }
    }
}

function startTimer(timeEnd, type) {
    const {getEl, onFinish} = timerConfig[type]
    const timerBarEl = getEl()

    if (!timeEnd) return

    window.gameState.timeEnds[type] = timeEnd

    const totalTime = timeEnd - getServerNow()
    console.log("Timer set:", type, "timeEnd:", timeEnd, "totalTime:", totalTime)
    if (activeTimers[type]) {
        clearInterval(activeTimers[type])
    }

    if (window.gameState.gameEnded) return

    activeTimers[type] = setInterval(() => {
        const timeRemaining = window.gameState.timeEnds[type] - getServerNow()
        const widthPercent = (timeRemaining / totalTime) * 100
        timerBarEl.style.width = widthPercent + "%"

        if (timeRemaining <= 0) {
            clearInterval(activeTimers[type])
            timerBarEl.style.width = "0%"
            onFinish()
        }
    }, 50)
}

document.getElementById("start-game-button").addEventListener("click", async () => {
    window.gameState.gameEnded = false

    await syncTime()

    const fetchGlobalTimer = fetch("/games/api/timer/", {
        method: "POST",
        headers: { "X-CSRFToken": window.csrftoken },
        mode: "same-origin",
    }).then((res) => res.json())

    const fetchGameTimers = fetch("/games/api/game-timers/", {
        method: "POST",
        body: JSON.stringify({ game: "all" }),
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": window.csrftoken,
        },
        mode: "same-origin",
    }).then((res) => res.json())

    Promise.all([fetchGlobalTimer, fetchGameTimers])
        .then(([globalTimerData, gameTimersData]) => {
                startTimer(globalTimerData.time_end, "global")
        
                startTimer(gameTimersData.math_time_end, "math")
                startTimer(gameTimersData.grid_time_end, "grid")
                startTimer(gameTimersData.pattern_time_end, "pattern")
        
                getFirstPattern()
        
                const startScreenEl = document.querySelector(".start-screen")
                startScreenEl.style.display = "none"
        }) 
})

document.getElementById("play-again-button").addEventListener("click", async () => {
    window.gameState.gameEnded = false

    await syncTime()

    const fetchGlobalTimer = fetch("/games/api/timer/", {
        method: "POST",
        headers: { "X-CSRFToken": window.csrftoken },
        mode: "same-origin"
    }).then((res) => res.json())

    const fetchGameTimers = fetch("/games/api/game-timers/", {
        method: "POST",
        body: JSON.stringify({ game: "all" }),
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": window.csrftoken
        },
        mode: "same-origin",
    }).then((res) => res.json())

    Promise.all([fetchGlobalTimer, fetchGameTimers])
        .then(([globalTimerData, gameTimersData]) => {
            clearPatternGame()

            startTimer(globalTimerData.time_end, "global")

            startTimer(gameTimersData.math_time_end, "math")
            startTimer(gameTimersData.grid_time_end, "grid")
            startTimer(gameTimersData.pattern_time_end, "pattern")

            getFirstPattern()

            const finishScreenEl = document.querySelector(".finish-screen")
            finishScreenEl.style.display = "none"
        })
})

function getFirstPattern() {
    const patternContainer = document.querySelector(".pattern-game")
    let count = 0

    if (window.gameState.patternGame.intervalId) {
        clearInterval(window.gameState.patternGame.intervalId)
    }

    if (window.gameState.patternGame.timeoutId) {
        clearTimeout(window.gameState.patternGame.timeoutId)
    }

    window.gameState.patternGame.isPatternShowing = true

    fetch("/games/api/first-pattern/", {
        method: "GET"
    }).then((res) => res.json())
    .then((res) => {
        window.gameState.patternGame.intervalId = setInterval(() => {
            patternContainer.style.backgroundColor = res.pattern[count]
            count++

            // Reinicia animación CSS para pulso
            patternContainer.classList.remove("pulse");
            void patternContainer.offsetWidth; // fuerza recalculo
            patternContainer.classList.add("pulse");

            if (count >= res.pattern.length) {
                clearInterval(window.gameState.patternGame.intervalId)
                window.gameState.patternGame.timeoutId = setTimeout(() => {
                    patternContainer.style.backgroundColor = "#1E1E1E"
                    patternContainer.classList.remove("pulse");
                    window.gameState.patternGame.isPatternShowing = false
                }, 750)

            }            
        }, 750)
    })
}

window.startTimer = startTimer