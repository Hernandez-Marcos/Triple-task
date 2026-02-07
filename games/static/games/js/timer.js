window.gameState = {
    isPatternShowing: true
}

function startTimer(timeEnd) {
    const timerBarEl = document.querySelector(".timer-bar")

    console.log("timeend:", timeEnd)

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
            const finishScreenEl = document.querySelector(".finish-screen")
            finishScreenEl.style.display = "flex"
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
        startTimer(res.time_end)
        getFirstPattern()
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
        startTimer(res.time_end)
        getFirstPattern()
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