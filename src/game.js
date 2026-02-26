const Game = {
    init() {
        State.init();
        UI.updateInventory();
    },

    start() {
        State.gameStarted = true;
        UI.showScreen('screen-mansion');
        Mansion.renderFloors();
    },

    tryEscape() {
        if (State.inventory.keys >= 3 && State.inventory.rings >= 2) {
            UI.showScreen('screen-win');
            localStorage.removeItem('escape_mansion_state'); // Reset for next game
        } else {
            alert('Você ainda não tem todos os itens necessários! (3 Chaves e 2 Anéis)');
        }
    }
};

window.onload = () => {
    Game.init();
};
