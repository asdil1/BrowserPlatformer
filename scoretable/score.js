document.addEventListener("DOMContentLoaded", () => {
   const resultContainer = document.getElementById("results");

   resultContainer.innerHTML = "";

   const results = JSON.parse(localStorage.getItem("gameResults")) || [];
    if (results.length > 0) {
        results.sort((a, b) => b.score - a.score);

        results.forEach(result => {
            const newResult = document.createElement("div");
            newResult.className = "result";
            newResult.innerHTML = `<p>Уровень: ${result.lvl}, ${result.name}: ${result.score}</p>`;
            resultContainer.appendChild(newResult);
        });
    } else {
        resultContainer.innerText = "Результаты не найдены";
    }
});