class PhysicManager {
    constructor() {
        this.gravity = 0.2;
        this.jumpStrength = -9;
        this.collisionLayer = null;
    }

    setCollisionLayer(collisionLayer) {
        this.collisionLayer = collisionLayer;
    }

    update(entity){
        entity.pos_x += entity.vel_x;
        this.updateHitbox(entity);
        this.checkForHorizontalCollision(entity);
        this.applyGravity(entity);
        this.updateHitbox(entity);
        this.checkForVerticalCollision(entity);
        this.checkForMapBounds(entity);
    }

    updateHitbox(entity){
        entity.hitbox = {
            position: {
                x: entity.pos_x + entity.hitboxOffset.xOffset,
                y: entity.pos_y + entity.hitboxOffset.yOffset
            },
            width: entity.hitbox.width,
            height: entity.hitbox.height
        }
    }

    applyGravity(entity){
        entity.vel_y += this.gravity;
        entity.pos_y += entity.vel_y;
    }

    checkForHorizontalCollision(entity){
        for (let collisionBlock of this.collisionLayer) {
            if (
                entity.hitbox.position.x < collisionBlock.position.x + collisionBlock.width &&
                entity.hitbox.position.x + entity.hitbox.width > collisionBlock.position.x &&
                entity.hitbox.position.y + entity.hitbox.height > collisionBlock.position.y &&
                entity.hitbox.position.y < collisionBlock.position.y + collisionBlock.height
            ) {
                if (entity.vel_x < 0) {
                    // Столкновение слева
                    const offset = entity.hitbox.position.x - entity.pos_x; // Смещение хитбокса относительно позиции
                    entity.pos_x = collisionBlock.position.x + collisionBlock.width - offset;
                } else if (entity.vel_x > 0) {
                    // Столкновение справа
                    const offset = entity.hitbox.position.x - entity.pos_x + entity.hitbox.width;
                    entity.pos_x = collisionBlock.position.x - offset;
                }
                entity.vel_x = 0; // Останавливаем движение по оси X
                break;
            }
        }
    }

    checkForVerticalCollision(entity){
        let onGround = false;
        for (let collisionBlock of this.collisionLayer) {
            if (
                entity.hitbox.position.x < collisionBlock.position.x + collisionBlock.width &&
                entity.hitbox.position.x + entity.hitbox.width > collisionBlock.position.x &&
                entity.hitbox.position.y + entity.hitbox.height > collisionBlock.position.y &&
                entity.hitbox.position.y < collisionBlock.position.y + collisionBlock.height
            ) {
                if (entity.vel_y < 0) {
                    const offset = entity.hitbox.position.y - entity.pos_y;
                    entity.pos_y = collisionBlock.position.y + collisionBlock.height - offset;
                }

                if (entity.vel_y > 0) {
                    const offset = entity.hitbox.position.y - entity.pos_y;
                    entity.pos_y = collisionBlock.position.y - entity.hitbox.height - offset;
                    onGround = true;
                }
                entity.vel_y = 0;
                break;
            }
        }

        if(entity instanceof  Player){
            entity.isOnGround = onGround;
        }
    }

    checkForMapBounds(entity) {
        // Проверка по оси X (горизонтальное перемещение)
        if (entity.pos_x < 0) {
            entity.pos_x = 0; // Ограничиваем левую границу
        } else if (entity.pos_x + entity.hitbox.width > mapManager.mapSize.x) {
            entity.pos_x = mapManager.mapSize.x - entity.hitbox.width; // Ограничиваем правую границу
        }

        // Проверка по оси Y (вертикальное перемещение)
        if (entity.pos_y < 0) {
            entity.pos_y = 0; // Ограничиваем верхнюю границу
        } else if (entity.pos_y + entity.hitbox.height > mapManager.mapSize.y) {
            entity.pos_y = mapManager.mapSize.y - entity.hitbox.height; // Ограничиваем нижнюю границу
        }
    }

    entityAtXY = (obj, x, y) => {
        for (let i = 0; i < gameManager.entities.length; i++) {
            let e = gameManager.entities[i]
            if (e.name !== obj.name) {

                if(
                    x + obj.hitbox.width < e.pos_x ||
                    y + obj.hitbox.height < e.pos_y ||
                    x > e.pos_x + e.hitbox.width ||
                    y > e.pos_y + e.hitbox.height
                ) {
                 continue;
                }

                return e;
            }
        }
        return null
    }
}

const physicManager = new PhysicManager();