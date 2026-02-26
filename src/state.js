const State = {
    inventory: {
        keys: 0,
        rings: 0
    },
    floors: [],
    minigameFloors: [],
    completedFloors: [],
    gameStarted: false,

    init() {
        // Load from localStorage if exists
        const saved = localStorage.getItem('escape_mansion_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.inventory = parsed.inventory || { keys: 0, rings: 0 };
            this.completedFloors = parsed.completedFloors || [];
        }
        
        // Generate mansion layout
        this.generateMansion();
    },

    generateMansion() {
        // 5 floors total.
        // Identify which floors have minigames (2 random floors for rings).
        // The other 3 floors have keys.
        this.floors = [1, 2, 3, 4, 5];
        
        // Pick 2 random unique numbers between 1 and 5 for minigames
        const indices = new Set();
        while(indices.size < 2) {
            indices.add(Math.floor(Math.random() * 5) + 1);
        }
        this.minigameFloors = Array.from(indices);
    },

    save() {
        localStorage.setItem('escape_mansion_state', JSON.stringify({
            inventory: this.inventory,
            completedFloors: this.completedFloors
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

    completeFloor(floorNum) {
        if (!this.completedFloors.includes(floorNum)) {
            this.completedFloors.push(floorNum);
            this.save();
        }
    }
};
