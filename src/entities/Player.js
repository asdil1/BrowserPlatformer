class Player extends Entity {
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

        this.playerLose = false;
        this.lifetimes = 30;
        this.score = 0;

        this.isOnGround = false;

        this.currentFrame = 0;
        this.frameCounter = 0;
        //this.animationSpeed = 30;
        // Состояние и анимации игрока
        this.state = "idle";
        this.stateLock = false; //  для блокировки состояния
        this.damageTimer = 0; // Таймер для состояния damage

        this.animations = {
            idle: { frames: ["Cyborg_idle-0.png", "Cyborg_idle-1.png", "Cyborg_idle-2.png", "Cyborg_idle-3.png"], speed: 30 },
            walk_right: { frames: ["Cyborg_run-0.png", "Cyborg_run-1.png", "Cyborg_run-2.png", "Cyborg_run-3.png", "Cyborg_run-4.png", "Cyborg_run-5.png"], speed: 20 },
            walk_left: { frames: ["cyborg_run_left (5).png", "cyborg_run_left (4).png", "cyborg_run_left (3).png", "cyborg_run_left (2).png", "cyborg_run_left (1).png", "cyborg_run_left.png"], speed: 20 },
            attack: { frames: ["Cyborg_attack1-0.png", "Cyborg_attack1-1.png", "Cyborg_attack1-2.png", "Cyborg_attack1-3.png", "Cyborg_attack1-4.png", "Cyborg_attack1-5.png"], speed: 15 },
            damage: { frames: ["Cyborg_hurt-0.png", "Cyborg_hurt-1.png"], speed: 30 }
        };

        this.isTakingDamage = false;
        this.damageInterval = null;
        this.timeout = null;

        this.canAttack = true;
        this.attackCooldown = 500;
    }

    changeState(newState){
        if ( this.state !== newState ) {
            console.log(`Состояния игрока измененено ${newState}`)
            this.state = newState;
            this.currentFrame = 0;
        }
    }

    update(){
        this.checkLifetimes();
        this.move();
        physicManager.update(this);
        this.updateAnimation();
    }

    checkLifetimes(){
        if(this.lifetimes <= 0){
            this.lifetimes = 0;
            this.playerLose = true;
        }
    }

    updateAnimation(){
        const animation = this.animations[this.state];
        if (!animation) {
            console.error(`State "${this.state}" does not exist in animations.`);
            this.state = "idle";
        }

        const frames = animation.frames;
        const speed = animation.speed;

        if (this.currentFrame >= frames.length) {
            console.error(`Frame index ${this.currentFrame} out of bounds for state "${this.state}".`);
            this.currentFrame = 0;
        }

        // Обновляем текущий кадр для анимации
        this.frameCounter++;
        if (this.frameCounter >= speed) {
            this.frameCounter = 0;
            this.currentFrame = (this.currentFrame + 1) % frames.length;
        }
    }

    move(){
        //Обновление позиции и состояния на основе нажатых клавиш
        if (eventManager.keysPressed['d']) {
            this.changeState("walk_right");
            this.vel_x = 1;
            //console.log(`Позиция изменена ${this.pos_x} ${this.pos_y}`)
        } else if (eventManager.keysPressed['a']) {
            this.changeState("walk_left");
            this.vel_x = -1;
            //console.log(`Позиция изменена ${this.pos_x} ${this.pos_y}`)
        } else if (eventManager.keysPressed[' ']) {
            this.jump();
            //console.log(`Позиция изменена ${this.pos_x} ${this.pos_y}`)
        } else if (eventManager.keysPressed['e']){
            this.vel_x = 0;
            this.attack();
            this.changeState("attack");
        } else {
            if(!this.stateLock){
                this.changeState("idle");
            } else {
                this.damageTimer--;
                if(this.damageTimer < 0 ){
                    this.stateLock = false;
                }
            }
            this.vel_x = 0;
        }
    }

    jump() {
        if (this.isOnGround) {
            this.vel_y = physicManager.jumpStrength;
            this.isOnGround = false;
        }
    }

    draw(ctx) {
        const animation = this.animations[this.state];
        const frames = animation.frames;
        const currentSprite = frames[this.currentFrame];
        spriteManager.drawSprite(ctx, currentSprite, this.pos_x, this.pos_y);
    }

    attack() {
        if(!this.canAttack) return;

        this.canAttack = false;
        soundManager.play( "../storage/music/attack_player.mp3", { volume: 0.2 });
        const entity = physicManager.entityAtXY(this, this.pos_x, this.pos_y);
        if (entity && entity instanceof Enemy){
            entity.onTouch(this);
        }

        setTimeout(() => {
            this.canAttack = true;
        }, this.attackCooldown)
    }

    onTouch(obj){
        if(obj instanceof Enemy){
            this.lifetimes--;

            if(!this.isTakingDamage){
                this.isTakingDamage = true;

                if(this.damageInterval === null){
                    console.log("Интервал установлен");
                    this.damageInterval = setInterval(() => {
                        this.changeState("damage");
                        this.stateLock = true; // Блокируем состояние
                        this.damageTimer = 60;
                    }, 1000);
                }

                if(this.timeout === null){
                    console.log("Таймаут установлен");
                    this.timeout = setTimeout(() => {
                        clearInterval(this.damageInterval);
                        this.changeState("idle");
                        this.damageInterval = null;
                        this.timeout = null;
                        this.isTakingDamage = false;
                        console.log("Таймаут завершен");
                    }, 4000);
                }
            }
        }

        if(obj instanceof Locker) {
            if(!obj.isOpen){
                soundManager.play("../storage/music/money_sound.mp3", { volume: 0.2 });
                obj.changeState("open");
                this.score += 50;
            }
        }
    }
}
