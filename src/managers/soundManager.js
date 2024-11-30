class SoundManager {
    constructor() {
        this.clips = {};
        this.context = null;
        this.gainNode = null; // объект для управления громкостью звука
        this.loaded = false;

    }

    init(){
        this.context = new AudioContext();
        this.gainNode = this.context.createGain ? this.context.createGain() : this.context.createGainNode();
        this.gainNode.connect(this.context.destination); // подключение к динамикам

        document.addEventListener('click', () => {
            if (this.context.state === 'suspended') {
                this.context.resume().then(() => {
                    console.log('AudioContext resumed successfully');
                }).catch((e) => {
                    console.error('Failed to resume AudioContext:', e);
                });
            }
        });
    }

    load(path, callback){
        if(this.clips[path]){
            callback(this.clips[path]);
            return;
        }

        let clip = {
            path: path,
            buffer: null,
            loaded: false,
        }

        clip.play = (volume, loop) => {
            soundManager.play(
                path,
                {looping: loop ? loop : false, volume: volume ? volume : 1}
            );
        };
        this.clips[path] = clip; // добавляем в массив

        let request = new XMLHttpRequest();
        request.open("GET", path, true);
        request.responseType = "arraybuffer";

        request.onload = () => {
            this.context.decodeAudioData(request.response, (buffer) => {
                clip.buffer = buffer;
                clip.loaded = true;
                callback(clip);
            }).then(()=> "sound ok").catch((e)=> console.log(`${e}`));
        }
        request.send();
    }

    loadArray(array){
        array.forEach((path) => {
            this.load(path, () => {
                if (array.length === Object.keys(this.clips).length) {
                    for(let sd in this.clips){
                        if(!this.clips[sd].loaded){
                            return;
                        }
                    }
                    this.loaded = true;
                }
            });
        });
    }

    play(path, settings){
        if(!this.loaded) {
            setTimeout(()=>{ this.play(path, settings)}, 1000);
            return;
        }

        let looping = false;
        let volume = 1;
        if(settings) {
            if(settings.looping){
                looping = settings.looping;
            }
            if(settings.volume){
                volume = settings.volume;
            }
        }
        let sd = this.clips[path];
        if(sd === null){
            return false;
        }

        let sound = this.context.createBufferSource();
        sound.buffer = sd.buffer; // источник звука
        sound.connect(this.gainNode); // подключение к колонкам
        sound.loop = looping; // повторять дорожку
        this.gainNode.gain.value = volume; // громкость звка
        sound.start(0); // проигрывание звука
        return true;
    }
}

soundManager = new SoundManager();