const Minigames = {
    currentFloor: null,
    sequence: [],
    playerSequence: [],
    isShowing: false,

    start(floorNum) {
        this.currentFloor = floorNum;
        this.sequence = [];
        this.playerSequence = [];

        UI.showModal(`
            <div style="text-align: center;">
                <h2 style="color: var(--accent-color); margin-bottom: 10px;">Enigma dos Símbolos</h2>
                <p style="margin-bottom: 20px; font-size: 0.9rem;">Repita a sequência das runas para liberar o Anel Antigo.</p>
                <div id="puzzle-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
                    ${this.renderPuzzleButtons()}
                </div>
                <div id="puzzle-status" style="height: 20px; color: var(--accent-color); font-weight: 600;"></div>
                <button class="btn" id="start-puzzle-btn" onclick="Minigames.playSequence()" style="margin-top: 20px;">Iniciar</button>
            </div>
        `);
    },

    renderPuzzleButtons() {
        let html = '';
        for (let i = 0; i < 9; i++) {
            html += `<div class="floor-btn" id="rune-${i}" onclick="Minigames.handleInput(${i})" style="padding: 20px; font-size: 1.5rem; transition: background 0.2s;">ᚠ</div>`;
        }
        return html;
    },

    playSequence() {
        if (this.isShowing) return;
        this.isShowing = true;
        this.playerSequence = [];

        // Add random rune
        if (this.sequence.length === 0) {
            for (let i = 0; i < 3; i++) this.sequence.push(Math.floor(Math.random() * 9));
        } else {
            this.sequence.push(Math.floor(Math.random() * 9));
        }

        document.getElementById('start-puzzle-btn').style.display = 'none';
        document.getElementById('puzzle-status').innerText = 'Observe a sequência...';

        let i = 0;
        const interval = setInterval(() => {
            if (i >= this.sequence.length) {
                clearInterval(interval);
                this.isShowing = false;
                document.getElementById('puzzle-status').innerText = 'Sua vez!';
                return;
            }
            this.flashRune(this.sequence[i]);
            i++;
        }, 800);
    },

    flashRune(index) {
        const el = document.getElementById(`rune-${index}`);
        el.style.background = 'var(--accent-color)';
        el.style.color = 'black';
        setTimeout(() => {
            el.style.background = '';
            el.style.color = '';
        }, 500);
    },

    handleInput(index) {
        if (this.isShowing) return;

        this.flashRune(index);
        this.playerSequence.push(index);

        const currentIdx = this.playerSequence.length - 1;

        if (this.playerSequence[currentIdx] !== this.sequence[currentIdx]) {
            document.getElementById('puzzle-status').innerText = 'Erro! Tente novamente.';
            this.sequence = [];
            this.playerSequence = [];
            document.getElementById('start-puzzle-btn').style.display = 'inline-block';
            return;
        }

        if (this.playerSequence.length === this.sequence.length) {
            if (this.sequence.length >= 4) { // Level 4 to win
                this.win();
            } else {
                setTimeout(() => this.playSequence(), 1000);
            }
        }
    },

    win() {
        UI.showModal(`
            <div style="text-align: center;">
                <h2 style="color: var(--success); margin-bottom: 20px;">Enigma Resolvido!</h2>
                <img src="assets/ring.png" style="width: 150px; margin-bottom: 20px; filter: drop-shadow(0 0 15px var(--accent-glow));">
                <p style="margin-bottom: 30px;">O brilho do anel ilumina a sala. Você o coletou com sucesso.</p>
                <button class="btn" onclick="Mansion.collectRing(${this.currentFloor})">Continuar</button>
            </div>
        `);
    }
};
