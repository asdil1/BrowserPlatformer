class MapManager {
    constructor() {
        console.log("MapManager создан");
        this.mapData = null;
        this.tilesets = [];
        this.tLayer = null;
        this.xCount = 0; // ширина и высота в блоках
        this.yCount = 0;
        this.tSize = {x: 0, y: 0}; // размер блока
        this.mapSize = {x: 0, y: 0}; // размер карты
        this.imageLoadCount = 0;
        this.imgLoaded = false;
        this.jsonLoaded = false;

        this.collision = [];
    }

    loadMap(path) {
        console.log(`Загрузка карты начата с пути: ${path}`);
        const request = new XMLHttpRequest();
        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200) {
                console.log("Карта успешно загружена");
                this.parseMap(request.responseText);
            }
        };
        request.onerror = () => {
            console.error("Ошибка загрузки JSON карты.");
        }
        request.open("GET", path, true);
        request.send();
    }

    loadImage(imagePath, tileset) {
        let image = new Image();

        image.onload = () => {
            this.imageLoadCount++;
            console.log(`Изображение загружено: ${imagePath} (${this.imageLoadCount}/${this.mapData.tilesets.length})`);
            if (this.imageLoadCount === this.mapData.tilesets.length) {
                this.imgLoaded = true;
                console.log("Все изображения тайлсетов загружены");
            }
        };

        image.onerror = () => {
            console.error(`Ошибка при загрузке изображения: ${imagePath}`);
        };

        image.src = imagePath;

        let ts = {
            firstgid: tileset.firstgid,
            image: image,
            name: tileset.name,
            xCount: Math.floor(tileset.imagewidth / this.tSize.x),
            yCount: Math.floor(tileset.imageheight / this.tSize.y),
        };

        this.tilesets.push(ts);
    }

    parseMap(data) {
        console.log("Начат парсинг данных карты");
        this.mapData = JSON.parse(data);
        this.xCount = this.mapData.width;
        this.yCount = this.mapData.height;
        this.tSize.x = this.mapData.tilewidth;
        this.tSize.y = this.mapData.tileheight;
        this.mapSize.x = this.xCount * this.tSize.x;
        this.mapSize.y = this.yCount * this.tSize.y;

        this.mapData.tilesets.forEach(tileset => {
            if (tileset.image) {
                this.loadImage(tileset.image, tileset);
            }
        });

        this.jsonLoaded = true;
        console.log("Парсинг карты завершен");
    }

    getTileSet(tileIndex) {
        for (let i = this.tilesets.length - 1; i >= 0; i--) {
            if (this.tilesets[i].firstgid <= tileIndex) {
                return this.tilesets[i];
            }
        }
        console.warn(`Тайлсет не найден для индекса ${tileIndex}`);
        return null;
    }

    getTile(tileIndex) {
        let tile = {
            img: null,
            px: 0,
            py: 0,
        };

        let tileset = this.getTileSet(tileIndex);
        if (!tileset) {
            console.error(`Тайлсет не найден для индекса ${tileIndex}`);
            return null;
        }
        tile.img = tileset.image;
        let id = tileIndex - tileset.firstgid;
        let x = id % tileset.xCount;
        let y = Math.floor(id / tileset.xCount);

        tile.px = x * this.tSize.x;
        tile.py = y * this.tSize.y;
        return tile;
    }

    drawMap(ctx) {
        if (!this.imgLoaded || !this.jsonLoaded) {
            console.warn("Карта или изображения еще не загружены, ожидание перед повторным вызовом drawMap");
            setTimeout(() => { this.drawMap(ctx); }, 100);
        } else {
            if (this.tLayer === null) {
                this.mapData.layers.forEach(layer => {
                    if(layer.name === "collision"){

                        this.collision = layer.data.parse2D(this.xCount).createObjectsFrom2D();
                        //const towDArray = this.convertTo2DArray(layer.data, this.mapSize.x);
                        physicManager.setCollisionLayer(this.collision);
                        console.log("Найден collision для карты");
                    }

                    if(layer.type === "tilelayer" && layer.class !== 'collision') {
                        this.tLayer = layer;
                        console.log("Найден tilelayer для карты");
                    }
                });
            }
            for(let i = 0; i < this.tLayer.data.length; i++) {
                if (this.tLayer.data[i] !== 0) {
                    let tile = this.getTile(this.tLayer.data[i]);
                    if (!tile || !tile.img) {
                        console.warn(`Пропуск тайла с индексом ${this.tLayer.data[i]}`);
                        continue;
                    }
                    let px = (i % this.xCount) * this.tSize.x;
                    let py = Math.floor(i / this.xCount) * this.tSize.y;
                    ctx.drawImage(
                        tile.img, tile.px, tile.py, this.tSize.x, this.tSize.y, px, py, this.tSize.x, this.tSize.y
                    );
                }
            }
        }
    }

    parseEntities() {
        if (!this.imgLoaded || !this.jsonLoaded) {
            console.warn("Карта или изображения еще не загружены, ожидание перед парсингом сущностей");
            setTimeout(() => { this.parseEntities(); }, 100);
        } else {
            console.log("Парсинг сущностей начат");
            this.mapData.layers.forEach(layer => {
                if (layer.type === "objectgroup") {
                    const entities = layer.objects;
                    console.log(`Найден слой objectgroup с ${entities.length} сущностями`);
                    entities.forEach(e => {
                        try {
                            const obj = gameManager.factory.createObj(e.type);
                            obj.name = e.name;
                            obj.pos_x = e.x;
                            obj.pos_y = e.y - e.width;
                            obj.size_x = e.width;
                            obj.size_y = e.height;

                            gameManager.entities.push(obj);
                            console.log(`Сущность добавлена: ${e.type}, позиция (${e.x}, ${e.y})`);

                            if (obj.name === 'player') {
                                gameManager.initPlayer(obj);
                                console.log("Игрок инициализирован");
                            }

                            if(obj instanceof Enemy){
                                obj.initialX = obj.pos_x;
                                obj.initialY = obj.pos_y;
                            }
                        } catch (ex) {
                            console.error(`Ошибка при создании сущности [${e.gid}] ${e.type}: ${ex}`);
                        }
                    });
                }
            });
        }
    }
}


const mapManager = new MapManager();
