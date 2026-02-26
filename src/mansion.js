const Mansion = {
    renderFloors() {
        const grid = document.getElementById('floor-grid');
        grid.innerHTML = '';

        State.floors.forEach(floorNum => {
            const isMinigame = State.minigameFloors.includes(floorNum);
            const isCompleted = State.completedFloors.includes(floorNum);

            const btn = document.createElement('div');
            btn.className = `floor-btn ${isCompleted ? 'completed' : ''}`;

            btn.innerHTML = `
                <span style="font-size: 0.8rem; opacity: 0.6">ANDAR</span>
                <span style="font-size: 2rem; font-weight: 700;">${floorNum}</span>
                <span style="font-size: 0.7rem; color: var(--accent-color)">
                    ${isCompleted ? 'COLETADO' : 'EXPLORAR'}
                </span>
            `;

            if (!isCompleted) {
                btn.onclick = () => this.visitFloor(floorNum, isMinigame);
            }

            grid.appendChild(btn);
        });
    },

    visitFloor(floorNum, isMinigame) {
        if (isMinigame) {
            Minigames.start(floorNum);
        } else {
            // Static reward: Key
            UI.showModal(`
                <div style="text-align: center;">
                    <h2 style="color: var(--accent-color); margin-bottom: 20px;">Você encontrou uma Chave!</h2>
                    <img src="assets/key.png" style="width: 150px; margin-bottom: 20px; filter: drop-shadow(0 0 15px var(--accent-glow));">
                    <p style="margin-bottom: 30px;">Uma chave dourada ornamentada estava escondida sob um tapete antigo.</p>
                    <button class="btn" onclick="Mansion.collectKey(${floorNum})">Coletar</button>
                </div>
            `);
        }
    },

    collectKey(floorNum) {
        State.addKey();
        State.completeFloor(floorNum);
        UI.closeModal();
        UI.updateInventory();
        this.renderFloors();
    },

    collectRing(floorNum) {
        State.addRing();
        State.completeFloor(floorNum);
        UI.closeModal();
        UI.updateInventory();
        this.renderFloors();
    }
};
