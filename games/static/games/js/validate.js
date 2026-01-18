function handleMathGame() {
    const answer = document.getElementById("math-answer").value

    fetch("/games/api/validate/", {
        method: "POST",
        body: JSON.stringify({ "answer": answer}),
        headers: {
            "Content-Type": "application/json",
        },
    })
      .then((res) => res.json())
      .then((res) => console.log(res))
    
}

document.getElementById("submit-math-answer").addEventListener("click", function(){handleMathGame()})