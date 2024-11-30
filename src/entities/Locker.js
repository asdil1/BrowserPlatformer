class Locker extends Entity {
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
            width: 32,
            height: 14
        }

        this.isOpen = false;
        this.state = "idle";
        this.currentFrame = 0;
        this.frameCounter = 0;
        this.animationSpeed = 30;

        this.animations = {
            idle: ["Locker4.png"],
            open: ["tile000.png", "tile001.png", "tile002.png", "tile003.png", "tile004.png", "tile005.png"],
        };

        this.timeout = null;
    }

    update() {
        this.updateAnimation();
        physicManager.update(this);

        const entity = physicManager.entityAtXY(this, this.pos_x, this.pos_y);
        if(entity && entity instanceof Player){
            entity.onTouch(this);
            this.isOpen = true;

            if(this.timeout === null){
                this.timeout = setTimeout(() => {
                    this.kill();
                    console.log("Открыт ящик");
                    clearTimeout(this.timeout);
                }, 2000);
            }
        }
    }

    draw(ctx) {
        const frames = this.animations[this.state];
        const currentSprite = frames[this.currentFrame];
        spriteManager.drawSprite(ctx, currentSprite, this.pos_x, this.pos_y);
    }

    kill() {
        gameManager.kill(this)
    }

    changeState(newState){
        if ( this.state !== newState ) {
            console.log(`Состояния ящика измененено ${newState}`)
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
}