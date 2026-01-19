function updateMathGame(data) {
    let num_1 = document.getElementById("num-1")
    let num_2 = document.getElementById("num-2")

    num_1.textContent = data["num_1"]
    num_2.textContent = data["num_2"]
    document.getElementById("math-answer").value = ""



    console.log(data)

}

function handleMathGame() {
    const game = "math"
    const answer = document.getElementById("math-answer").value
    

    if (answer == "") {
        return
    }
        
    fetch("/games/api/validate/", {
        method: "POST",
        body: JSON.stringify({ "answer": answer, "game": game}),
        headers: {
            "Content-Type": "application/json",
        },
    })
      .then((res) => res.json())
      .then((res) => updateMathGame(res))
    
}

document.getElementById("submit-math-answer").addEventListener("click", handleMathGame)


function updateGridGame(data) {
    console.log(data)
}

function handleGridGame(event) {
    const game = "grid"

    if (!event.target.classList.contains("square")) {
        return
    }
    
    answer = event.target.classList.contains("red") ? "red" : "blue"

    console.log("holaaa", answer)

    fetch("/games/api/validate/", {
        method: "POST",
        body: JSON.stringify({ "answer": answer, "game": game}),
        headers: {
            "Content-Type": "application/json",
        },
    })
      .then((res) => res.json())
      .then((res) => updateGridGame(res))

}

document.querySelector(".grid-game").addEventListener("click", handleGridGame)