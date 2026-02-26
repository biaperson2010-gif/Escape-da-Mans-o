const UI = {
    updateInventory() {
        document.getElementById('count-keys').innerText = State.inventory.keys;
        document.getElementById('count-rings').innerText = State.inventory.rings;

        // Final button glow if ready
        const btn = document.getElementById('escape-btn');
        if (State.inventory.keys >= 3 && State.inventory.rings >= 2) {
            btn.style.background = 'var(--success)';
            btn.style.boxShadow = '0 0 30px var(--success)';
        }
    },

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
        document.getElementById(screenId).style.display = 'flex';
    },

    showModal(content) {
        const overlay = document.getElementById('modal-overlay');
        const container = document.getElementById('minigame-content');
        container.innerHTML = content;
        overlay.style.display = 'flex';
    },

    closeModal() {
        document.getElementById('modal-overlay').style.display = 'none';
    }
};
