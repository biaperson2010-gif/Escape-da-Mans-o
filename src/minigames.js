const Minigames = {
    currentFloor: null,
    type: null,

    // Ghost Survival state
    ghostGame: {
        timer: 15,
        interval: null,
        canvas: null,
        ctx: null,
        player: { x: 150, y: 350, r: 10 },
        obstacles: [],
        running: false,
        animationFrame: null
    },

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

        const games = ['memory', 'tictactoe', 'ghostsurvival'];
        this.type = games[Math.floor(Math.random() * games.length)];

        if (this.type === 'memory') {
            this.startMemory();
        } else if (this.type === 'tictactoe') {
            this.startTicTacToe();
        } else {
            this.startGhostSurvival(floorNum);
        }
    },

    // --- GHOST SURVIVAL ---
    startGhostSurvival(floorNum) {
        this.currentFloor = floorNum;
        UI.showModal(`
            <div style="text-align: center; position: relative;">
                <h2 style="color: #88f; margin-bottom: 10px;">Fuga do Fantasma!</h2>
                <div id="ghost-timer" style="position: absolute; top: 0; right: 0; font-size: 1.5rem; font-weight: bold; color: var(--accent-color);">15s</div>
                <p style="margin-bottom: 15px; font-size: 0.9rem;">Use o mouse/touch para mover a bolinha branca e desviar dos vultos!</p>
                <canvas id="ghost-canvas" width="400" height="400" style="background: #000; border: 2px solid #333; cursor: none; width: 100%; max-width: 400px; touch-action: none;"></canvas>
            </div>
        `);

        this.initGhostGame();
    },

    initGhostGame() {
        const canvas = document.getElementById('ghost-canvas');
        if (!canvas) return;

        this.ghostGame.canvas = canvas;
        this.ghostGame.ctx = canvas.getContext('2d');
        this.ghostGame.timer = 15,
            this.ghostGame.obstacles = [];
        this.ghostGame.running = true;
        this.ghostGame.player = { x: 200, y: 200, r: 8 };

        // Handle movement
        const moveHandler = (e) => {
            const rect = canvas.getBoundingClientRect();
            let x, y;
            if (e.touches) {
                x = e.touches[0].clientX - rect.left;
                y = e.touches[0].clientY - rect.top;
            } else {
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
            }
            // Scale if needed
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            this.ghostGame.player.x = x * scaleX;
            this.ghostGame.player.y = y * scaleY;
        };

        canvas.addEventListener('mousemove', moveHandler);
        canvas.addEventListener('touchmove', moveHandler);

        this.ghostGame.interval = setInterval(() => {
            this.ghostGame.timer--;
            const timerEl = document.getElementById('ghost-timer');
            if (timerEl) timerEl.innerText = this.ghostGame.timer + 's';

            if (this.ghostGame.timer <= 0) {
                this.endGhostGame(true);
            }
        }, 1000);

        this.ghostLoop();
    },

    ghostLoop() {
        if (!this.ghostGame.running) return;

        const { ctx, canvas, player, obstacles } = this.ghostGame;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Spawn obstacles
        if (Math.random() < 0.1) {
            const side = Math.floor(Math.random() * 4);
            let x, y, vx, vy;
            if (side === 0) { x = Math.random() * 400; y = -20; vx = (Math.random() - 0.5) * 4; vy = Math.random() * 5 + 2; }
            else if (side === 1) { x = 420; y = Math.random() * 400; vx = -(Math.random() * 5 + 2); vy = (Math.random() - 0.5) * 4; }
            else if (side === 2) { x = Math.random() * 400; y = 420; vx = (Math.random() - 0.5) * 4; vy = -(Math.random() * 5 + 2); }
            else { x = -20; y = Math.random() * 400; vx = Math.random() * 5 + 2; vy = (Math.random() - 0.5) * 4; }
            obstacles.push({ x, y, vx, vy, r: Math.random() * 15 + 5 });
        }

        // Update and draw obstacles
        ctx.fillStyle = '#88f4';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#88f';
        obstacles.forEach((o, i) => {
            o.x += o.vx;
            o.y += o.vy;

            ctx.beginPath();
            ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
            ctx.fill();

            // Collision check
            const dx = o.x - player.x;
            const dy = o.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < o.r + player.r) {
                this.endGhostGame(false);
            }

            if (o.x < -50 || o.x > 450 || o.y < -50 || o.y > 450) obstacles.splice(i, 1);
        });

        // Draw player
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#fff';
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        this.ghostGame.animationFrame = requestAnimationFrame(() => this.ghostLoop());
    },

    endGhostGame(success) {
        this.ghostGame.running = false;
        clearInterval(this.ghostGame.interval);
        cancelAnimationFrame(this.ghostGame.animationFrame);

        if (success) {
            UI.showModal(`
                <div style="text-align: center;">
                    <h2 style="color: var(--success); margin-bottom: 20px;">Você escapou!</h2>
                    <p style="margin-bottom: 30px;">O fantasma desistiu da perseguição e desapareceu nas sombras.</p>
                    <button class="btn" onclick="Mansion.dismissGhost(${this.currentFloor})">Continuar</button>
                </div>
            `);
        } else {
            State.damageSanity(5);
            UI.updateInventory();
            UI.showModal(`
                <div style="text-align: center;">
                    <h2 style="color: var(--danger); margin-bottom: 20px;">O Fantasma te pegou!</h2>
                    <p style="margin-bottom: 20px;">Um grito ensurdecedor e um frio mortal... Sua sanidade foi estilhaçada.</p>
                    <p style="color: var(--danger); font-weight: bold; margin-bottom: 30px;">-5 de Sanidade</p>
                    <button class="btn" onclick="Mansion.dismissGhost(${this.currentFloor})">Continuar</button>
                </div>
            `);
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
                <p style="margin-bottom: 15px; font-size: 0.9rem;">Vença o guardião para ganhar a Chave.</p>
                <p id="difficulty-tag" style="font-size: 0.7rem; opacity: 0.6; margin-bottom: 15px;"></p>
                <div id="ttt-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; max-width: 300px; margin: 0 auto;">
                    ${this.renderTTTButtons()}
                </div>
                <div id="ttt-status" style="height: 20px; color: var(--accent-color); font-weight: 600; margin-top: 15px;">Sua vez (X)</div>
            </div>
        `);

        const diffs = ["Infernal", "Difícil", "Médio", "Fácil", "Trivial"];
        const diffIdx = Math.min(State.tttFailureCount, 4);
        document.getElementById('difficulty-tag').innerText = `Dificuldade: ${diffs[diffIdx]}`;
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
            this.handleDraw();
            return;
        }

        this.playerTurn = false;
        document.getElementById('ttt-status').innerText = 'Guardião pensando...';
        setTimeout(() => this.aiMove(), 800);
    },

    makeMove(index, symbol) {
        this.board[index] = symbol;
        const el = document.getElementById(`ttt-${index}`);
        if (el) {
            el.innerText = symbol;
            el.style.color = symbol === 'X' ? 'var(--accent-color)' : 'var(--danger)';
        }
    },

    handleDraw() {
        State.damageSanity(1);
        State.relocateKey(this.currentFloor);
        UI.updateInventory();
        UI.showModal(`
            <div style="text-align: center;">
                <h2 style="color: var(--accent-color); margin-bottom: 20px;">Empate!</h2>
                <p style="margin-bottom: 20px;">O guardião se irrita com o empate. A chave foi movida para outro andar!</p>
                <p style="color: var(--danger); font-weight: bold; margin-bottom: 30px;">-1 de Sanidade</p>
                <button class="btn" onclick="UI.closeModal(); Mansion.renderFloors();">Tentar outro andar</button>
            </div>
        `);
    },

    aiMove() {
        if (State.gameOver) return;

        let move;
        const failRate = Math.min(State.tttFailureCount * 0.2, 0.8);

        if (Math.random() < failRate) {
            // Random move (easy)
            const empty = this.board.map((v, i) => v === null ? i : null).filter(v => v !== null);
            move = empty[Math.floor(Math.random() * empty.length)];
        } else {
            // Minimax move (best)
            move = this.getBestMove();
        }

        this.makeMove(move, 'O');

        if (this.checkTTTWin('O')) {
            State.tttFailureCount++;
            State.damageHealth(3);
            UI.updateInventory();
            document.getElementById('ttt-status').innerText = 'Você perdeu! -3 Vida';
            document.getElementById('ttt-status').style.color = 'var(--danger)';
            setTimeout(() => {
                if (!State.gameOver) this.startTicTacToe();
            }, 2000);
        } else if (this.checkTTTDraw()) {
            this.handleDraw();
        } else {
            this.playerTurn = true;
            document.getElementById('ttt-status').innerText = 'Sua vez (X)';
        }
    },

    getBestMove() {
        let bestScore = -Infinity;
        let move;
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    },

    minimax(board, depth, isMaximizing) {
        if (this.checkTTTWin('O')) return 10 - depth;
        if (this.checkTTTWin('X')) return depth - 10;
        if (this.checkTTTDraw()) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
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
