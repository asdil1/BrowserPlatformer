class Enemy extends Entity {
    constructor() {
        super();

        this.vel_x = 0;
        this.vel_y = 0;

        this.hitboxOffset = {
            xOffset: 1,
            yOffset: 15
        }

        this.hitbox = {
            position: {
                x: this.pos_x + this.hitboxOffset.xOffset,
                y: this.pos_y + this.hitboxOffset.yOffset
            },
            width: 20,
            height: 14
        }

        this.lifetimes = 1;

        this.currentFrame = 0;
        this.frameCounter = 0;
        this.animationSpeed = 30;
        // Состояние и анимации игрока
        this.state = "idle";
        this.animations = {
            idle: ["Biker_idle-0.png", "Biker_idle-1.png", "Biker_idle-2.png", "Biker_idle-3.png"],
            walk_right: ["sprite.png", "sprite (1).png", "sprite (2).png", "sprite (3).png", "sprite (4).png", "sprite (5).png"],
            walk_left: ["biker_run_left (5).png", "biker_run_left (4).png", "biker_run_left (3).png", "biker_run_left (2).png", "biker_run_left (1).png", "biker_run_left.png"],
            attack: ["Biker_attack1-0.png", "Biker_attack1-1.png", "Biker_attack1-2.png", "Biker_attack1-3.png", "Biker_attack1-4.png", "Biker_attack1-5.png"]
        };

        this.detectRadius = 150;
        this.canAttack = true;
        this.attackCooldown = 1000;
    }

    update(){
        const player = this.detectPlayer();
        if(player){
            this.move(player);
        } else {
            this.changeState("idle");
        }
        physicManager.update(this);
        this.updateAnimation();
    }

    changeState(newState){
        if ( this.state !== newState ) {
            console.log(`Состояния врага измененено ${newState}`)
            this.state = newState;
            this.currentFrame = 0;
        }
    }

    updateAnimation(){
        // Обновляем текущий кадр для анимации
        if (!this.animations[this.state]) {
            console.error(`State "${this.state}" does not exist in animations.`);
            this.state = "idle";
        }

        const frames = this.animations[this.state];
        if (!frames || frames.length === 0) {
            console.error(`No frames for state "${this.state}" in entity ${this.name}.`);
            this.state = "idle";
        }

        if (this.currentFrame >= frames.length) {
            console.error(`Frame index ${this.currentFrame} out of bounds for state "${this.state}".`);
            this.currentFrame = 0;
        }

        // Обновляем текущий кадр для анимации
        this.frameCounter++;
        if (this.frameCounter >= this.animationSpeed) {
            this.frameCounter = 0;
            this.currentFrame = (this.currentFrame + 1) % frames.length;
        }
    }

    draw(ctx) {
        const frames = this.animations[this.state];
        const currentSprite = frames[this.currentFrame];
        spriteManager.drawSprite(ctx, currentSprite, this.pos_x, this.pos_y);
    }

    onTouch(obj){
        if(obj instanceof Player){
            this.changeState("attack");
            this.lifetimes--;
            console.log(`${this.name} ${this.lifetimes}`);
        }
        if(this.lifetimes === 0){
            gameManager.player.score += 100;
            this.kill();
        }
    }

    kill(){
        gameManager.kill(this);
    }

    detectPlayer(){
        for(let entity of gameManager.entities){
            if(entity instanceof Player){
                const dx = entity.pos_x - this.pos_x;
                const dy = entity.pos_y - this.pos_y;

                const distance = Math.sqrt(dx * dx + dy * dy);

                if(distance <= this.detectRadius){
                    //console.log("Игрок в радиусе обннаружения");
                    return entity; // игрок в радиусе обнаружения
                }
            }
        }
        return null;
    }

    move(player){

        const speed = 0.005; // Скорость движения врага

        // Вычисляем вектор направления от врага к игроку
        const directionX = player.hitbox.position.x - this.hitbox.position.x
        const directionY = player.hitbox.position.y - this.hitbox.position.y

        this.pos_x += directionX * speed;
        this.pos_y += directionY * speed;

        const entity = physicManager.entityAtXY(this, this.pos_x, this.pos_y);
        if (entity && entity instanceof Player){
            if(!this.canAttack) return;

            this.canAttack = false;
            soundManager.play( "../storage/music/attack_enemy.mp3", { volume: 0.2 });
            this.changeState("attack");
            entity.onTouch(this);

            setTimeout(() => {
                this.canAttack = true;
            }, this.attackCooldown);
        } else if (directionX > 0){
            this.changeState("walk_right");
        } else {
            this.changeState("walk_left");
        }
    }
}