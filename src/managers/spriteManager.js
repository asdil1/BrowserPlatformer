class SpriteManager {
    constructor() {
        console.log("SpriteManager constructor called");

        this.image = new Image();
        this.sprites = [];
        this.imageLoaded = false;
        this.jsonLoaded = false;
    }

    loadAtlas(atlasJson, atlasImg){
        console.log("Загрузка атласа начата");

        let request = new XMLHttpRequest();
        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200) {
                this.parseAtlas(request.responseText);
            }
        };
        request.onerror = () => {
            console.error("Ошибка загрузки JSON атласа.");
        }

        request.open("GET", atlasJson, true);
        request.send();
        this.loadImg(atlasImg);
    }

    loadImg(imgName) {
        console.log("Загрузка изображения начата");
        this.image.onload = () => {
            console.log(`Изображение загружено ${imgName}`);
            this.imageLoaded = true;
        }
        this.image.src = imgName;
    }


    parseAtlas(atlasJson) {
        console.log("Парсинг JSON атласа");
        const atlas = JSON.parse(atlasJson);
        atlas.frames.forEach(obj => {
            this.sprites.push({
                filename: obj.filename,
                x: obj.frame.x,
                y: obj.frame.y,
                width: obj.frame.w,
                height: obj.frame.h,
            });
        });
        console.log("Атлас успешно распарсен", this.sprites);
        this.jsonLoaded = true;
    }

    getSprite(name) {
        const sprite = this.sprites.find(sprite => sprite.filename === name);
        if (!sprite) {
            console.warn(`Спрайт с именем ${name} не найден`);
        }
        return sprite;
    }

    drawSprite(ctx, name, x, y) {
        if (!this.imageLoaded || !this.jsonLoaded) {
            console.warn("Атлас еще не загружен, повторный вызов drawSprite");
            setTimeout(() => { this.drawSprite(ctx, name, x, y); }, 100);
        } else {
            const sprite = this.getSprite(name);
            if (sprite) {
                ctx.drawImage(
                    this.image, sprite.x, sprite.y, sprite.width, sprite.height, x, y, sprite.width, sprite.height
                );
            } else {
                console.error(`Не удалось найти спрайт ${name} для отрисовки`);
            }
        }
    }
}

const spriteManager = new SpriteManager();