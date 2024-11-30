const playerName = localStorage.getItem("username");
const playerNameElement = document.getElementById("playerName");


playerNameElement.innerText = `Player: ${playerName}`;


const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

const lvl = 2;

gameManager.loadAll(context, lvl);
