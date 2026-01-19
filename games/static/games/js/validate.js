function updateMathGame(data) {
    let num_1 = document.getElementById("num-1")
    let num_2 = document.getElementById("num-2")

    num_1.textContent = data["num_1"]
    num_2.textContent = data["num_2"]
    document.getElementById("math-answer").value = ""



    console.log(data)

}

function handleMathGame() {
    const answer = document.getElementById("math-answer").value
    const game = "math"

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