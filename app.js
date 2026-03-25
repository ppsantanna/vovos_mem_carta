/**
 * Memória por Posição - Vovô & Vovó
 * Lógica do Jogo
 */

const gameData = {
    score: 0,
    bestScore: 0,
    timeLeft: 120,
    memoTimeLeft: 15,
    timer: null,
    memoTimer: null,
    cards: [],
    selectedCard: null,
    isProcessing: false,
    settings: {
        numCards: 12,
        memoTime: 15,
        gameTime: 120,
        confirmMode: false,
        soundOn: true,
        volume: 0.5,
        fontSize: 'large',
        highContrast: false,
        dontShowHelp: false
    }
};

// Elementos do DOM
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    gameOver: document.getElementById('game-over-screen')
};

const components = {
    grid: document.getElementById('game-grid'),
    score: document.getElementById('current-score'),
    timer: document.getElementById('game-timer'),
    best: document.getElementById('best-score'),
    message: document.getElementById('game-message'),
    confirmBtn: document.getElementById('btn-confirm'),
    memoOverlay: document.getElementById('memorize-timer-overlay'),
    memoSeconds: document.getElementById('memorize-seconds'),
    finalScore: document.getElementById('final-score-val'),
    finalBest: document.getElementById('final-best-val')
};

// Sons (Suporte a .wav e .mp3)
const sounds = {
    success: new Audio(),
    error: new Audio()
};

function initAudio() {
    const formats = ['wav', 'mp3'];
    const setupAudio = (key, baseName) => {
        let currentFormat = 0;
        const tryNext = () => {
            if (currentFormat < formats.length) {
                sounds[key].src = `audio/${baseName}.${formats[currentFormat]}`;
                currentFormat++;
            }
        };
        sounds[key].onerror = tryNext;
        tryNext();
    };

    setupAudio('success', 'success');
    setupAudio('error', 'error');
}
initAudio();

/**
 * Inicialização
 */
function init() {
    loadSettings();
    applySettings();
    showScreen('start');

    // Listeners
    document.getElementById('btn-start').onclick = startGame;
    document.getElementById('btn-settings').onclick = openSettings;
    document.getElementById('btn-help').onclick = openHelp;
    document.getElementById('btn-exit').onclick = () => window.close();
    document.getElementById('btn-restart').onclick = startGame;
    document.getElementById('btn-back-home').onclick = () => showScreen('start');
    document.getElementById('btn-save-settings').onclick = saveSettings;
    document.getElementById('btn-close-help').onclick = closeHelp;
    document.getElementById('btn-confirm').onclick = handleConfirm;
}

/**
 * Gestão de Telas
 */
function showScreen(screenKey) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens[screenKey].classList.remove('hidden');
}

/**
 * Iniciar Jogo
 */
function startGame() {
    gameData.score = 0;
    gameData.timeLeft = gameData.settings.gameTime;
    gameData.memoTimeLeft = gameData.settings.memoTime;
    gameData.selectedCard = null;
    gameData.isProcessing = false;

    updateStats();
    showScreen('game');
    components.message.textContent = "Memorize as posições!";

    setupGrid();
    startMemorizationPhase();
}

/**
 * Configuração do Grid
 */
function setupGrid() {
    components.grid.innerHTML = '';
    const num = gameData.settings.numCards;

    // Imagens locais (SVG criados na pasta images/)
    const availableImages = [
        'images/card1.png',
        'images/card2.png',
        'images/card3.png',
        'images/card4.png',
        'images/card5.png',
        'images/card6.png'
    ];

    // Selecionar apenas a quantidade necessária
    const images = availableImages.slice(0, num / 2);

    // Se precisar de mais imagens do que as disponíveis (ex: grid maior), duplicar
    while (images.length < num / 2) {
        images.push(availableImages[images.length % availableImages.length]);
    }

    // Duplicar para formar pares
    let cardPool = [...images, ...images];

    // Caso num for ímpar ou não exato para pares (mas garantimos par no menu)
    if (cardPool.length < num) {
        while (cardPool.length < num) cardPool.push(images[0]);
    }

    // Embaralhar
    cardPool = cardPool.sort(() => Math.random() - 0.5);

    gameData.cards = cardPool.map((img, index) => ({
        id: index,
        image: img,
        matchingId: null // No desafio de posição, não precisamos do par exato no momento da seleção, apenas saber qual carta é qual
    }));

    gameData.cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card flipped'; // Começa virada para cima para memorização
        cardEl.dataset.id = card.id;
        cardEl.innerHTML = `
            <div class="card-back">
                <img src="images/card_back.png" alt="Verso da carta">
            </div>
            <div class="card-front">
                <img src="${card.image}" alt="Carta ${card.id}">
            </div>
        `;
        cardEl.onclick = () => onCardClick(cardEl, card);
        components.grid.appendChild(cardEl);
    });
}

/**
 * Fase de Memorização
 */
function startMemorizationPhase() {
    components.memoOverlay.classList.remove('hidden');
    components.memoSeconds.textContent = gameData.memoTimeLeft;

    clearInterval(gameData.memoTimer);
    gameData.memoTimer = setInterval(() => {
        gameData.memoTimeLeft--;
        components.memoSeconds.textContent = gameData.memoTimeLeft;

        if (gameData.memoTimeLeft <= 0) {
            clearInterval(gameData.memoTimer);
            endMemorizationPhase();
        }
    }, 1000);
}

function endMemorizationPhase() {
    components.memoOverlay.classList.add('hidden');
    // Virar todas para baixo
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(c => c.classList.remove('flipped'));

    components.message.textContent = "Escolha uma carta e seu par!";
    startCountdown();
}

/**
 * Fase de Desafio
 */
function startCountdown() {
    clearInterval(gameData.timer);
    gameData.timer = setInterval(() => {
        gameData.timeLeft--;
        components.timer.textContent = gameData.timeLeft;

        if (gameData.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

/**
 * Click na Carta
 */
function onCardClick(el, card) {
    if (gameData.isProcessing || el.classList.contains('correct')) return;

    // Primeira escolha: Revelar a carta
    if (!gameData.selectedCard) {
        gameData.selectedCard = { el, card };
        el.classList.add('flipped');
        components.message.textContent = "Agora toque onde estava a outra igual!";
        return;
    }

    // Segunda escolha: Tentar acertar a posição
    if (el === gameData.selectedCard.el) return; // Não pode clicar na mesma

    if (gameData.settings.confirmMode) {
        // Modo confirmar ativo: apenas seleciona visualmente e libera botão
        document.querySelectorAll('.card.pending').forEach(c => c.classList.remove('pending'));
        el.classList.add('pending');
        gameData.pendingChoice = { el, card };
        components.confirmBtn.classList.remove('hidden');
    } else {
        validateChoice(el, card);
    }
}

function handleConfirm() {
    if (!gameData.pendingChoice) return;
    components.confirmBtn.classList.add('hidden');
    validateChoice(gameData.pendingChoice.el, gameData.pendingChoice.card);
    gameData.pendingChoice = null;
}

function validateChoice(el, card) {
    gameData.isProcessing = true;
    el.classList.add('flipped');

    const choice1 = gameData.selectedCard;
    const choice2 = { el, card };

    if (choice1.card.image === choice2.card.image) {
        // ACERTO
        gameData.score++;
        playSound('success');
        choice1.el.classList.add('correct');
        choice2.el.classList.add('correct');
        components.message.textContent = "Acertou!";

        checkWin();
    } else {
        // ERRO
        gameData.score = Math.max(0, gameData.score - 1);
        playSound('error');
        choice1.el.classList.add('wrong');
        choice2.el.classList.add('wrong');
        components.message.textContent = "Errou. Tente novamente.";

        setTimeout(() => {
            choice1.el.classList.remove('flipped', 'wrong');
            choice2.el.classList.remove('flipped', 'wrong');
        }, 1000);
    }

    gameData.selectedCard = null;
    updateStats();

    setTimeout(() => {
        gameData.isProcessing = false;
        if (gameData.message.textContent !== "Acertou!") {
            components.message.textContent = "Escolha uma carta!";
        }
    }, 1200);
}

function checkWin() {
    const totalPairs = gameData.settings.numCards / 2;
    if (gameData.score === totalPairs) {
        endGame();
    }
}

/**
 * Fim de Jogo
 */
function endGame() {
    clearInterval(gameData.timer);
    clearInterval(gameData.memoTimer);

    if (gameData.score > gameData.bestScore) {
        gameData.bestScore = gameData.score;
        localStorage.setItem('vovos_best_score', gameData.bestScore);
    }

    components.finalScore.textContent = gameData.score;
    components.finalBest.textContent = gameData.bestScore;
    showScreen('gameOver');
}

/**
 * Utilitários
 */
function updateStats() {
    components.score.textContent = gameData.score;
    components.timer.textContent = gameData.timeLeft;
    components.best.textContent = gameData.bestScore;
}

function playSound(type) {
    if (!gameData.settings.soundOn) return;
    sounds[type].volume = gameData.settings.volume;
    sounds[type].currentTime = 0;
    sounds[type].play().catch(e => console.log("Audio play blocked"));
}

/**
 * Settings
 */
function openSettings() {
    document.getElementById('settings-modal').classList.remove('hidden');
}

function saveSettings() {
    const s = gameData.settings;
    s.numCards = parseInt(document.getElementById('num-cards').value);
    s.memoTime = parseInt(document.getElementById('memo-time').value);
    s.gameTime = parseInt(document.getElementById('game-time').value);
    s.confirmMode = document.getElementById('confirm-mode').checked;
    s.soundOn = document.getElementById('sound-on').checked;
    s.volume = parseFloat(document.getElementById('volume').value);
    s.fontSize = document.getElementById('font-size').value;
    s.highContrast = document.getElementById('high-contrast').checked;

    localStorage.setItem('vovos_settings', JSON.stringify(s));
    applySettings();
    document.getElementById('settings-modal').classList.add('hidden');
}

function loadSettings() {
    const saved = localStorage.getItem('vovos_settings');
    if (saved) {
        gameData.settings = { ...gameData.settings, ...JSON.parse(saved) };
    }

    gameData.bestScore = parseInt(localStorage.getItem('vovos_best_score')) || 0;

    // Preencher formulário
    const s = gameData.settings;
    document.getElementById('num-cards').value = s.numCards;
    document.getElementById('memo-time').value = s.memoTime;
    document.getElementById('game-time').value = s.gameTime;
    document.getElementById('confirm-mode').checked = s.confirmMode;
    document.getElementById('sound-on').checked = s.soundOn;
    document.getElementById('volume').value = s.volume;
    document.getElementById('font-size').value = s.fontSize;
    document.getElementById('high-contrast').checked = s.highContrast;
}

function applySettings() {
    const body = document.body;
    body.classList.remove('high-contrast', 'font-large', 'font-xlarge');

    if (gameData.settings.highContrast) body.classList.add('high-contrast');
    if (gameData.settings.fontSize === 'large') body.classList.add('font-large');
    if (gameData.settings.fontSize === 'xlarge') body.classList.add('font-xlarge');
}

/**
 * Help
 */
function openHelp() {
    document.getElementById('help-modal').classList.remove('hidden');
}

function closeHelp() {
    gameData.settings.dontShowHelp = document.getElementById('dont-show-help').checked;
    localStorage.setItem('vovos_settings', JSON.stringify(gameData.settings));
    document.getElementById('help-modal').classList.add('hidden');
}

// Iniciar ao carregar
window.onload = init;
