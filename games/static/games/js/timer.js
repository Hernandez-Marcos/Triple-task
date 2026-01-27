function startTimer() {
    const timerBarEl = document.querySelector(".timer-bar")
    
    fetch("/games/api/timer/", {
        method: "GET"
    }).then((res) => res.json())
    .then((data) => {
        console.log(data)
        
        let timeRemaining = data.time_remaining
        if (!timeRemaining) return

        const totalTime = timeRemaining

        const intervalId = setInterval(() => {
            timeRemaining -= 0.05
            const widthPercent = (timeRemaining / totalTime) * 100
            timerBarEl.style.width = widthPercent + "%"

            if (timeRemaining <= 0) {
                clearInterval(intervalId)
                const finishScreenEl = document.querySelector(".finish-screen")
                finishScreenEl.style.display = "block"
            }
        }, 50)

        console.log("asdasdasdasd", timeRemaining)
    })
}

document.getElementById("start-game").addEventListener("click", () => {
    console.log("holaa")
    fetch("/games/api/timer/", {
        method: "POST"
    }).then((res) => res.json())
    .then((res) => {
        console.log(res)
        const startScreenEl = document.querySelector(".start-screen")
        startScreenEl.style.display = "none"
        startTimer()
    })
})