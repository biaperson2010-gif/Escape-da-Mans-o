const Minigames = {
    currentFloor: null,
    type: null,

    // Memory Game state
    sequence: [],
    playerSequence: [],
    isShowing: false,

    // Tic Tac Toe state
    board: Array(9).fill(null),
    playerTurn: true,

    start(floorNum, itemType) {
        this.currentFloor = floorNum;
        this.itemType = itemType;

        // Randomly pick minigame type
        const games = ['memory', 'tictactoe'];
        this.type = games[Math.floor(Math.random() * games.length)];

        if (this.type === 'memory') {
            this.startMemory();
        } else {
            this.startTicTacToe();
        }
    },

    // --- MEMORY GAME ---
    startMemory() {
        this.sequence = [];
        this.playerSequence = [];
        UI.showModal(`
            <div style="text-align: center;">
                <h2 style="color: var(--accent-color); margin-bottom: 10px;">Enigma das Runas</h2>
                <p style="margin-bottom: 20px; font-size: 0.9rem;">Repita a sequência para liberar a Chave.</p>
                <div id="puzzle-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
                    ${this.renderMemoryButtons()}
                </div>
                <div id="puzzle-status" style="height: 20px; color: var(--accent-color); font-weight: 600;"></div>
                <button class="btn" id="start-puzzle-btn" onclick="Minigames.playMemorySequence()" style="margin-top: 20px;">Iniciar</button>
            </div>
        `);
    },

    renderMemoryButtons() {
        let html = '';
        for (let i = 0; i < 9; i++) {
            html += `<div class="floor-btn" id="rune-${i}" onclick="Minigames.handleMemoryInput(${i})" style="padding: 20px; font-size: 1.5rem; transition: background 0.2s;">ᛉ</div>`;
        }
        return html;
    },

    playMemorySequence() {
        if (this.isShowing) return;
        this.isShowing = true;
        this.playerSequence = [];

        if (this.sequence.length === 0) {
            for (let i = 0; i < 3; i++) this.sequence.push(Math.floor(Math.random() * 9));
        } else {
            this.sequence.push(Math.floor(Math.random() * 9));
        }

        document.getElementById('start-puzzle-btn').style.display = 'none';
        document.getElementById('puzzle-status').innerText = 'Observe...';

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
        if (!el) return;
        el.style.background = 'var(--accent-color)';
        el.style.color = 'black';
        setTimeout(() => {
            el.style.background = '';
            el.style.color = '';
        }, 500);
    },

    handleMemoryInput(index) {
        if (this.isShowing) return;
        this.flashRune(index);
        this.playerSequence.push(index);
        const currentIdx = this.playerSequence.length - 1;

        if (this.playerSequence[currentIdx] !== this.sequence[currentIdx]) {
            State.damageHealth(3);
            UI.updateInventory();
            document.getElementById('puzzle-status').innerText = 'Erro! -3 Vida';
            document.getElementById('puzzle-status').style.color = 'var(--danger)';
            this.sequence = [];
            this.playerSequence = [];
            setTimeout(() => {
                if (!State.gameOver) {
                    document.getElementById('puzzle-status').style.color = '';
                    document.getElementById('start-puzzle-btn').style.display = 'inline-block';
                }
            }, 1000);
            return;
        }

        if (this.playerSequence.length === this.sequence.length) {
            if (this.sequence.length >= 4) {
                this.win();
            } else {
                setTimeout(() => this.playMemorySequence(), 1000);
            }
        }
    },

    // --- TIC TAC TOE ---
    startTicTacToe() {
        this.board = Array(9).fill(null);
        this.playerTurn = true;
        UI.showModal(`
            <div style="text-align: center;">
                <h2 style="color: var(--accent-color); margin-bottom: 10px;">Jogo da Velha Maldito</h2>
                <p style="margin-bottom: 20px; font-size: 0.9rem;">Vença o guardião para ganhar a Chave.</p>
                <div id="ttt-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; max-width: 300px; margin: 0 auto;">
                    ${this.renderTTTButtons()}
                </div>
                <div id="ttt-status" style="height: 20px; color: var(--accent-color); font-weight: 600; margin-top: 15px;">Sua vez (X)</div>
            </div>
        `);
    },

    renderTTTButtons() {
        let html = '';
        for (let i = 0; i < 9; i++) {
            html += `<div class="floor-btn" id="ttt-${i}" onclick="Minigames.handleTTTInput(${i})" style="padding: 25px; font-size: 2rem; height: 80px; width: 80px; display: flex; align-items: center; justify-content: center;"></div>`;
        }
        return html;
    },

    handleTTTInput(index) {
        if (!this.playerTurn || this.board[index] || State.gameOver) return;

        this.makeMove(index, 'X');
        if (this.checkTTTWin('X')) {
            setTimeout(() => this.win(), 500);
            return;
        }
        if (this.checkTTTDraw()) {
            document.getElementById('ttt-status').innerText = 'Empate! Tente novamente.';
            setTimeout(() => this.startTicTacToe(), 1500);
            return;
        }

        this.playerTurn = false;
        document.getElementById('ttt-status').innerText = 'Guardião pensando...';
        setTimeout(() => this.aiMove(), 800);
    },

    makeMove(index, symbol) {
        this.board[index] = symbol;
        const el = document.getElementById(`ttt-${index}`);
        el.innerText = symbol;
        el.style.color = symbol === 'X' ? 'var(--accent-color)' : 'var(--danger)';
    },

    aiMove() {
        if (State.gameOver) return;
        const emptyIndices = this.board.map((v, i) => v === null ? i : null).filter(v => v !== null);
        if (emptyIndices.length === 0) return;

        // Simple AI: pick random
        const move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        this.makeMove(move, 'O');

        if (this.checkTTTWin('O')) {
            State.damageHealth(3);
            UI.updateInventory();
            document.getElementById('ttt-status').innerText = 'Você perdeu! -3 Vida';
            document.getElementById('ttt-status').style.color = 'var(--danger)';
            setTimeout(() => {
                if (!State.gameOver) this.startTicTacToe();
            }, 2000);
        } else if (this.checkTTTDraw()) {
            document.getElementById('ttt-status').innerText = 'Empate! Tente novamente.';
            setTimeout(() => this.startTicTacToe(), 1500);
        } else {
            this.playerTurn = true;
            document.getElementById('ttt-status').innerText = 'Sua vez (X)';
        }
    },

    checkTTTWin(symbol) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return lines.some(line => line.every(i => this.board[i] === symbol));
    },

    checkTTTDraw() {
        return this.board.every(v => v !== null);
    },

    win() {
        UI.showModal(`
            <div style="text-align: center;">
                <h2 style="color: var(--success); margin-bottom: 20px;">Enigma Resolvido!</h2>
                <img src="assets/key.png" style="width: 150px; margin-bottom: 20px; filter: drop-shadow(0 0 15px var(--accent-glow));">
                <p style="margin-bottom: 30px;">O guardião recua. A Chave Dourada agora é sua.</p>
                <button class="btn" onclick="Mansion.collectKey(${this.currentFloor})">Continuar</button>
            </div>
        `);
    }
};

