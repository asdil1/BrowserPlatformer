class EventManager {
    constructor() {
        this.keysPressed = {};
        document.addEventListener('keydown', this.handlePressedButton);
        document.addEventListener('keyup', this.handleReleasedButton);
    }

    handlePressedButton = event => {
        const key = event.key.toLowerCase();
        if (key === 'd' || key === 'a' || key === ' ' || key === 'e') {
            this.keysPressed[key] = true;
        }
    }

    handleReleasedButton = event => {
        const key = event.key.toLowerCase();
        if (key === 'd' || key === 'a' || key === ' ' || key === 'e') {
            this.keysPressed[key] = false;
        }
    }
}

eventManager = new EventManager();