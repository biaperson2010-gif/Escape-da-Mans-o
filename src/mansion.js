const Mansion = {
    renderFloors() {
        const grid = document.getElementById('floor-grid');
        grid.innerHTML = '';

        State.floors.forEach(floorNum => {
            const content = State.floorContent[floorNum];
            const isCompleted = content.completed;

            const btn = document.createElement('div');
            btn.className = `floor-btn ${isCompleted ? 'completed' : ''}`;

            btn.innerHTML = `
                <span style="font-size: 0.8rem; opacity: 0.6">ANDAR</span>
                <span style="font-size: 2rem; font-weight: 700;">${floorNum}</span>
                <span style="font-size: 0.7rem; color: var(--accent-color)">
                    ${isCompleted ? 'EXPLORADO' : 'EXPLORAR'}
                </span>
            `;

            if (!isCompleted && !State.gameOver) {
                btn.onclick = () => this.visitFloor(floorNum);
            }

            grid.appendChild(btn);
        });
    },

    visitFloor(floorNum) {
        const content = State.floorContent[floorNum];

        if (content.type === 'key') {
            Minigames.start(floorNum, 'key');
        } else if (content.type === 'ring') {
            UI.showModal(`
                <div style="text-align: center;">
                    <h2 style="color: var(--accent-color); margin-bottom: 20px;">Você encontrou um Anel!</h2>
                    <img src="assets/ring.png" style="width: 150px; margin-bottom: 20px; filter: drop-shadow(0 0 15px var(--accent-glow));">
                    <p style="margin-bottom: 30px;">Um anel antigo com uma pedra preciosa estava escondido em uma gaveta secreta.</p>
                    <button class="btn" onclick="Mansion.collectRing(${floorNum})">Coletar</button>
                </div>
            `);
        } else if (content.type === 'ghost') {
            State.damageSanity(2);
            UI.showModal(`
                <div style="text-align: center;">
                    <h2 style="color: #88f; margin-bottom: 20px;">Um Fantasma Apareceu!</h2>
                    <div style="font-size: 100px; margin-bottom: 20px;">👻</div>
                    <p style="margin-bottom: 20px;">Um vulto gélido atravessou seu corpo. Você sente sua sanidade fraquejar.</p>
                    <p style="color: var(--danger); font-weight: bold; margin-bottom: 30px;">-2 de Sanidade</p>
                    <button class="btn" onclick="Mansion.dismissGhost(${floorNum})">Continuar</button>
                </div>
            `);
        }
    },

    dismissGhost(floorNum) {
        State.completeFloor(floorNum);
        UI.closeModal();
        UI.updateInventory();
        this.renderFloors();
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

