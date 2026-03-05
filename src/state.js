const State = {
    stats: {
        health: 12,
        sanity: 20
    },
    maxStats: {
        health: 12,
        sanity: 20
    },
    inventory: {
        keys: 0,
        rings: 0
    },
    floors: [],
    floorContent: {}, // floorNum -> { type: 'key' | 'ring' | 'ghost', completed: boolean }
    gameStarted: false,
    gameOver: false,
    tttFailureCount: 0,

    init() {
        const saved = localStorage.getItem('escape_mansion_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.stats = parsed.stats || { health: 12, sanity: 20 };
            this.inventory = parsed.inventory || { keys: 0, rings: 0 };
            this.floorContent = parsed.floorContent || {};
            this.tttFailureCount = parsed.tttFailureCount || 0;
        }

        this.generateMansion();
    },

    generateMansion() {
        this.floors = Array.from({ length: 10 }, (_, i) => i + 1);

        // Only generate if not already loaded
        if (Object.keys(this.floorContent).length === 0) {
            const possibleFloors = [...this.floors];
            this.shuffleArray(possibleFloors);

            const keyFloors = possibleFloors.slice(0, 3);
            const ringFloors = possibleFloors.slice(3, 5);
            const ghostFloors = possibleFloors.slice(5, 10);

            keyFloors.forEach(f => this.floorContent[f] = { type: 'key', completed: false });
            ringFloors.forEach(f => this.floorContent[f] = { type: 'ring', completed: false });
            ghostFloors.forEach(f => this.floorContent[f] = { type: 'ghost', completed: false });
        }
    },

    relocateKey(oldFloor) {
        // Find an unvisited floor that doesn't have a key or ring
        const availableFloors = this.floors.filter(f =>
            f !== oldFloor &&
            !this.floorContent[f].completed &&
            this.floorContent[f].type !== 'key' &&
            this.floorContent[f].type !== 'ring'
        );

        if (availableFloors.length > 0) {
            const newFloor = availableFloors[Math.floor(Math.random() * availableFloors.length)];
            const oldType = this.floorContent[oldFloor].type;
            const newType = this.floorContent[newFloor].type;

            // Swap contents (effectively moving the key)
            this.floorContent[newFloor].type = 'key';
            this.floorContent[oldFloor].type = newType;

            this.save();
            return true;
        }
        return false;
    },

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    },

    save() {
        localStorage.setItem('escape_mansion_state', JSON.stringify({
            stats: this.stats,
            inventory: this.inventory,
            floorContent: this.floorContent,
            tttFailureCount: this.tttFailureCount
        }));
    },

    addKey() {
        this.inventory.keys++;
        this.save();
    },

    addRing() {
        this.inventory.rings++;
        this.save();
    },

    damageHealth(amount) {
        this.stats.health = Math.max(0, this.stats.health - amount);
        this.save();
        if (this.stats.health <= 0) this.lose('viva');
    },

    damageSanity(amount) {
        this.stats.sanity = Math.max(0, this.stats.sanity - amount);
        this.save();
        if (this.stats.sanity <= 0) this.lose('sanity');
    },

    completeFloor(floorNum) {
        if (this.floorContent[floorNum]) {
            this.floorContent[floorNum].completed = true;
            this.save();
        }
    },

    lose(reason) {
        this.gameOver = true;
        if (reason === 'viva') {
            UI.showScreen('screen-lose-health');
        } else {
            UI.showScreen('screen-lose-sanity');
        }
        localStorage.removeItem('escape_mansion_state');
    }
};

