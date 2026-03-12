const Game = {
    init() {
        State.init();
        UI.updateInventory();
        this.checkContinuing();
    },

    checkContinuing() {
        const startBtn = document.getElementById('start-game-btn');
        const resetBtn = document.getElementById('reset-game-btn');

        // If user already has any items or has explored any floor
        const hasProgress = State.inventory.keys > 0 ||
            State.inventory.rings > 0 ||
            Object.values(State.floorContent).some(f => f.completed);

        if (hasProgress && startBtn && resetBtn) {
            startBtn.innerText = 'Continuar Aventura';
            resetBtn.style.display = 'inline-block';
        }
    },

    start() {
        State.gameStarted = true;
        UI.showScreen('screen-mansion');
        Mansion.renderFloors();
        UI.updateInventory();
    },

    reset() {
        if (confirm('Deseja realmente apagar todo o progresso e recomeçar?')) {
            State.clearState();
            location.reload();
        }
    },

    tryEscape() {
        if (State.inventory.keys >= 3 && State.inventory.rings >= 2) {
            UI.showScreen('screen-win');
            State.clearState(); // Reset for next game
        } else {
            const missing = [];
            if (State.inventory.keys < 3) missing.push(`${3 - State.inventory.keys} chaves`);
            if (State.inventory.rings < 2) missing.push(`${2 - State.inventory.rings} anéis`);
            alert(`Você ainda não tem todos os itens necessários! Falta coletar: ${missing.join(' e ')}.`);
        }
    }
};

window.onload = () => {
    Game.init();
};
