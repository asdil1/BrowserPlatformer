Array.prototype.parse2D = function (len) {
    const rows = []
    for (let i = 0; i < this.length; i += len) {
        rows.push(this.slice(i, i + len))
    }

    return rows
}

Array.prototype.createObjectsFrom2D = function () {
    const objects = []
    this.forEach((row, y) => {
        row.forEach((symbol, x) => {
            if (symbol !== 0) {
                const block = new CollisionBlock({
                    position: {
                        x: x * 32,
                        y: y * 32
                    }
                });
                objects.push(block)
            }
        });
    });

    return objects
}

saveResult = (lvl) => {
    const name = localStorage.getItem("username");
    const score = gameManager.player.score;

    const results = JSON.parse(localStorage.getItem("gameResults")) || [];

    const existingPlayer = results.find(player => player.name === name && player.lvl === lvl);
    if (existingPlayer) {
        if (score > existingPlayer.score){
            existingPlayer.score = score;
        }
    } else {
        results.push({ name, score, lvl});
    }

    localStorage.setItem("gameResults", JSON.stringify(results));
}
