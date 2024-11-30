class GameManager {
    constructor() {
        this.factory = new Factory();

        this.factory.registerNewType('player', Player);
        this.factory.registerNewType('enemy', Enemy);
        this.factory.registerNewType('Locker', Locker);

        this.entities = [];
        this.player = null;
        this.laterKill = [];
        this.levels = ["../storage/map/map.json", "../storage/map/map2.json"];

        this.lose = false;
        this.win = false;

        this.music = [
            "../storage/music/background.mp3",
            "../storage/music/attack_enemy.mp3",
            "../storage/music/attack_player.mp3",
            "../storage/music/money_sound.mp3"
        ];
    }

    initPlayer(obj) {
        this.player = obj;
    }

    kill(obj) {
        this.laterKill.push(obj);
    }

    update(ctx) {
        if(this.player === null){
            return;
        }

        this.entities.forEach(entity => {
            entity.update()
        });

        this.laterKill.forEach(objForKill => {
            const idx = this.entities.indexOf(objForKill);

            if(idx > -1){
                console.log(`Удалена сущность ${this.entities[idx].name}`);
                this.entities.splice(idx, 1);
            }
        });

        this.updateScore();
        this.updateLives();
        this.playerLost();
        this.playerWin();


        if(this.entities.length === 1 && lvl === 1){
            saveResult(lvl);
            window.location.href = "../level2/level2.html";
        } else if (this.win) {
            saveResult(lvl);
            window.location.href = "../scoretable/score.html";
        }
    }

    draw(ctx){
        // Очищаем холст перед перерисовкой
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        mapManager.drawMap(ctx);
        this.entities.forEach(entity => entity.draw(ctx));
    }

    loadAll(ctx, lvl){
        mapManager.loadMap(this.levels[lvl - 1]);
        spriteManager.loadAtlas(
          "../storage/sprites/sprites.json",
          "../storage/sprites/spritessheet.png"
        );
        soundManager.init();
        soundManager.loadArray(this.music);
        mapManager.parseEntities();
        mapManager.drawMap(ctx);
        //soundManager.play("../storage/music/background.mp3", {looping:true, volume: 0.2 });

        this.play(ctx);
    }

    play(ctx) {
        const gameLoop = () => {
            if (this.lose || this.win){
                return;
            }
            this.update(ctx);
            this.draw(ctx);
            requestAnimationFrame(gameLoop);
        };
        if(!this.lose || !this.win){
            requestAnimationFrame(gameLoop);
        }
    }

    updateScore() {
        const scoreElement = document.getElementById("score");
        scoreElement.textContent = `Score: ${gameManager.player.score}`;
    }

    updateLives() {
        const livesElement = document.getElementById("lives");
        livesElement.textContent = `Lives: ${gameManager.player.lifetimes}`;
    }

    playerLost(){
        if(this.player.playerLose){
            this.lose = true;
            saveResult(lvl);
            window.location.href = "../scoretable/score.html";
        }
    }

    playerWin(){
        if(this.entities.length === 1 && lvl === 2){
            this.win = true;
        }
    }
}

const gameManager = new GameManager();