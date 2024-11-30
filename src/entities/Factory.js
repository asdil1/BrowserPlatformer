class Factory {
    constructor() {
        this.types = {};
    }

    registerNewType(type, typeClass) {
        this.types[type] = typeClass;
    }

    createObj(type) {
        const TypeClass = this.types[type];
        if (TypeClass) {
            return new TypeClass();
        } else {
            throw new Error(`Unknown entity type: ${type}`);
        }
    }
}

