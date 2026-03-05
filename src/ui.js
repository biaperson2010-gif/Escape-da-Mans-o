const UI = {
    updateInventory() {
        document.getElementById('count-keys').innerText = State.inventory.keys;
        document.getElementById('count-rings').innerText = State.inventory.rings;

        const healthEl = document.getElementById('count-health');
        if (healthEl) healthEl.innerText = State.stats.health;

        const sanityEl = document.getElementById('count-sanity');
        if (sanityEl) sanityEl.innerText = State.stats.sanity;

        // Final button glow if ready
        const btn = document.getElementById('escape-btn');
        if (btn) {
            if (State.inventory.keys >= 3 && State.inventory.rings >= 2) {
                btn.classList.add('ready');
                btn.style.background = 'var(--success)';
                btn.style.boxShadow = '0 0 30px var(--success)';
            } else {
                btn.classList.remove('ready');
                btn.style.background = '';
                btn.style.boxShadow = '';
            }
        }
    },

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
        const screen = document.getElementById(screenId);
        if (screen) screen.style.display = 'flex';
    },

    showModal(content) {
        const overlay = document.getElementById('modal-overlay');
        const container = document.getElementById('minigame-content');
        container.innerHTML = content;
        overlay.style.display = 'flex';
    },

    closeModal() {
        document.getElementById('modal-overlay').style.display = 'none';
        if (State.gameOver) {
            // Screen update if game over
        }
    }
};

