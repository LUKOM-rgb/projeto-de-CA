// ========== FUNDO MARINHO ==========
function createMarineBackground() {
    const background = document.getElementById('marineBackground');
    if (!background) return;

    // Criar bolhas
    for (let i = 0; i < 15; i++) {
        createBubble(background);
    }

    // Criar peixes
    for (let i = 0; i < 8; i++) {
        createFish(background);
    }

    // Criar algas
    for (let i = 0; i < 6; i++) {
        createSeaweed(background);
    }

    // Criar tesouros
    for (let i = 0; i < 3; i++) {
        createTreasure(background);
    }

    // Criar estrelas do mar
    for (let i = 0; i < 4; i++) {
        createStarfish(background);
    }

    // Criar tartarugas
    for (let i = 0; i < 2; i++) {
        createTurtle(background);
    }
}

function createBubble(container) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const size = Math.random() * 30 + 10;
    const left = Math.random() * 100;
    const duration = Math.random() * 10 + 10;
    const delay = Math.random() * 15;

    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${left}%`;
    bubble.style.animationDuration = `${duration}s`;
    bubble.style.animationDelay = `${delay}s`;

    container.appendChild(bubble);
}

function createFish(container) {
    const fish = document.createElement('div');
    fish.className = 'fish';

    const top = Math.random() * 70 + 10;
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * 5;
    const size = Math.random() * 20 + 20;

    fish.style.top = `${top}%`;
    fish.style.fontSize = `${size}px`;
    fish.style.animationDuration = `${duration}s`;
    fish.style.animationDelay = `${delay}s`;

    // Direção aleatória
    const goRight = Math.random() > 0.5;
    if (goRight) {
        fish.style.left = '-50px';
        fish.style.animationName = 'swim-right';
    } else {
        fish.style.left = 'calc(100% + 50px)';
        fish.style.animationName = 'swim-left';
    }

    container.appendChild(fish);
}

function createSeaweed(container) {
    const seaweed = document.createElement('div');
    seaweed.className = 'seaweed';

    const left = Math.random() * 90 + 5;
    const height = Math.random() * 80 + 60;

    seaweed.style.left = `${left}%`;
    seaweed.style.height = `${height}px`;

    container.appendChild(seaweed);
}

function createTreasure(container) {
    const treasure = document.createElement('div');
    treasure.className = 'treasure-chest';

    const left = Math.random() * 80 + 10;

    treasure.style.left = `${left}%`;

    container.appendChild(treasure);
}

function createStarfish(container) {
    const starfish = document.createElement('div');
    starfish.className = 'starfish';

    const left = Math.random() * 85 + 5;

    starfish.style.left = `${left}%`;

    container.appendChild(starfish);
}

function createTurtle(container) {
    const turtle = document.createElement('div');
    turtle.className = 'sea-turtle';

    const top = Math.random() * 50 + 20;
    const duration = Math.random() * 25 + 20;
    const delay = Math.random() * 10;

    turtle.style.top = `${top}%`;
    turtle.style.animationDuration = `${duration}s`;
    turtle.style.animationDelay = `${delay}s`;

    // Direção aleatória
    const goRight = Math.random() > 0.5;
    if (goRight) {
        turtle.style.left = '-50px';
        turtle.style.animationName = 'turtle-swim-right';
    } else {
        turtle.style.left = 'calc(100% + 50px)';
        turtle.style.animationName = 'turtle-swim-left';
    }

    container.appendChild(turtle);
}

// ========== ANIMAÇÃO DA ÁGUA ==========
const canvas = document.getElementById('ballCanvas');
const ctx = canvas.getContext('2d');

const ballBtn = document.getElementById('ballButton');
const pantsBtn = document.getElementById('pantsButton');
const emptyBtn = document.getElementById('emptyButton');
const info = document.getElementById('waterInfo');

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 90;

const capacities = { ball: 3000, pants: 10000 };
const fillSpeed = 0.8;
let waterLevel = 0;
let targetWaterLevel = 0;
let currentShape = 'ball';
const maxWaterLevel = radius * 2;
let isEmptying = false;

// Array para guardar as posições das bolhas
let bubblePositions = [];

// Função para posicionar botões aleatoriamente
function positionButtonsRandomly() {
    const controls = document.querySelector('.bubble-container');
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Posições aleatórias para os botões
    const positions = [
        { top: '10%', left: '10%' },    // Canto superior esquerdo
        { top: '10%', left: '80%' },    // Canto superior direito
        { top: '80%', left: '10%' },    // Canto inferior esquerdo
        { top: '80%', left: '80%' },    // Canto inferior direito
        { top: '40%', left: '5%' },     // Centro esquerdo
        { top: '40%', left: '85%' },    // Centro direito
        { top: '20%', left: '50%' },    // Topo centro
        { top: '70%', left: '50%' }     // Fundo centro
    ];

    // Embaralhar as posições
    const shuffledPositions = [...positions].sort(() => Math.random() - 0.5);

    // Aplicar posições aos botões
    const buttons = controls.querySelectorAll('.bubble-button');
    buttons.forEach((button, index) => {
        if (shuffledPositions[index]) {
            button.style.position = 'absolute';
            button.style.top = shuffledPositions[index].top;
            button.style.left = shuffledPositions[index].left;
            button.style.transform = 'translate(-50%, -50%)';
            button.style.zIndex = '100';
        }
    });

    // Posicionar o container dos botões
    controls.style.position = 'fixed';
    controls.style.top = '0';
    controls.style.left = '0';
    controls.style.width = '100%';
    controls.style.height = '100%';
    controls.style.pointerEvents = 'none';

    // Permitir cliques apenas nos botões
    buttons.forEach(button => {
        button.style.pointerEvents = 'auto';
    });
}

// Função para gerar posições aleatórias para as bolhas
function generateRandomBubbles() {
    bubblePositions = [];
    const bubbleCount = Math.floor(Math.random() * 8) + 5; // 5-12 bolhas

    for (let i = 0; i < bubbleCount; i++) {
        bubblePositions.push({
            x: Math.random() * (radius * 2 - 20) + (centerX - radius + 10),
            y: Math.random() * (radius * 2 - 20) + (centerY - radius + 10),
            size: Math.random() * 8 + 4,
            speed: Math.random() * 2 + 1,
            offset: Math.random() * Math.PI * 2
        });
    }
}

// Função para desenhar bolhas na água
function drawBubbles() {
    if (waterLevel > 0 && bubblePositions.length > 0) {
        const waterHeight = (waterLevel / maxWaterLevel) * (radius * 2);
        const waterY = centerY + radius - waterHeight;

        bubblePositions.forEach((bubble, index) => {
            // Só desenha bolhas que estão abaixo da superfície da água
            if (bubble.y > waterY) {
                const time = Date.now() / 1000;
                const wave = Math.sin(time * bubble.speed + bubble.offset) * 2;

                ctx.beginPath();
                ctx.arc(bubble.x + wave, bubble.y, bubble.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time + index) * 0.2})`;
                ctx.fill();

                // Bolha de reflexo
                ctx.beginPath();
                ctx.arc(bubble.x + wave - bubble.size * 0.3, bubble.y - bubble.size * 0.3, bubble.size * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.fill();
            }
        });
    }
}

// Função para mostrar/esconder o botão esvaziar
function updateEmptyButtonVisibility() {
    if (waterLevel > 0 && !isEmptying) {
        emptyBtn.style.display = 'inline-block';
        emptyBtn.style.animation = 'float 3s ease-in-out infinite';
        emptyBtn.style.opacity = '1';
        emptyBtn.style.transform = 'scale(1)';
    } else if (waterLevel === 0) {
        emptyBtn.style.display = 'none';
        isEmptying = false;
    }
}

// Função para animação de bolha a arrebentar
function bubblePopAnimation(button) {
    isEmptying = true;
    button.style.animation = 'none';
    button.classList.add('bubble-pop');

    setTimeout(() => {
        button.classList.remove('bubble-pop');
        button.style.display = 'none';
    }, 600);
}

function drawPants() {
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY - radius);
    ctx.lineTo(centerX + radius, centerY - radius);
    ctx.lineTo(centerX + radius, centerY + radius);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(centerX - radius, centerY + radius);
    ctx.closePath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawBallOrPants() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentShape === 'ball') {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
    } else {
        drawPants();
    }

    if (waterLevel > 0) {
        ctx.save();
        if (currentShape === 'ball') {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.clip();
        } else {
            ctx.beginPath();
            ctx.moveTo(centerX - radius, centerY - radius);
            ctx.lineTo(centerX + radius, centerY - radius);
            ctx.lineTo(centerX + radius, centerY + radius);
            ctx.lineTo(centerX, centerY);
            ctx.lineTo(centerX - radius, centerY + radius);
            ctx.closePath();
            ctx.clip();
        }

        const waterHeight = (waterLevel / maxWaterLevel) * (radius * 2);
        const waterY = centerY + radius - waterHeight;

        const gradient = ctx.createLinearGradient(0, centerY - radius, 0, centerY + radius);
        gradient.addColorStop(0, 'rgba(0, 170, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 100, 255, 0.7)');

        ctx.beginPath();
        for (let x = centerX - radius; x <= centerX + radius; x += 2) {
            const wave = Math.sin((x + Date.now() / 120) / 10) * 3;
            ctx.lineTo(x, waterY + wave);
        }
        ctx.lineTo(centerX + radius, centerY + radius);
        ctx.lineTo(centerX - radius, centerY + radius);
        ctx.closePath();

        ctx.fillStyle = gradient;
        ctx.fill();

        // Desenhar bolhas na água
        drawBubbles();

        ctx.restore();
    }

    if (waterLevel < targetWaterLevel) {
        waterLevel = Math.min(waterLevel + fillSpeed, targetWaterLevel);
    } else if (waterLevel > targetWaterLevel) {
        waterLevel = Math.max(waterLevel - fillSpeed, targetWaterLevel);
    }

    const currentLiters = (waterLevel / maxWaterLevel) * capacities[currentShape];
    info.textContent = `${currentLiters.toFixed(1)} L / ${capacities[currentShape]} L`;

    if (!isEmptying) {
        updateEmptyButtonVisibility();
    }
}

// Evento de clique no canvas
canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentShape === 'ball') {
        const d = Math.hypot(x - centerX, y - centerY);
        if (d <= radius) {
            targetWaterLevel = maxWaterLevel;
            isEmptying = false;
            // Gerar novas bolhas aleatórias quando encher
            generateRandomBubbles();
        }
    } else {
        ctx.beginPath();
        drawPants();
        if (ctx.isPointInPath(x, y)) {
            targetWaterLevel = maxWaterLevel;
            isEmptying = false;
            // Gerar novas bolhas aleatórias quando encher
            generateRandomBubbles();
        }
    }
});

// Botão da bola
ballBtn.onclick = () => {
    currentShape = 'ball';
    waterLevel = 0;
    targetWaterLevel = 0;
    ballBtn.classList.add('active');
    pantsBtn.classList.remove('active');
    info.textContent = `0.0 L / ${capacities.ball} L`;
    isEmptying = false;
    updateEmptyButtonVisibility();
    // Gerar novas bolhas quando mudar de forma
    generateRandomBubbles();
    // Reposicionar botões aleatoriamente
    positionButtonsRandomly();
};

// Botão das calças
pantsBtn.onclick = () => {
    currentShape = 'pants';
    waterLevel = 0;
    targetWaterLevel = 0;
    pantsBtn.classList.add('active');
    ballBtn.classList.remove('active');
    info.textContent = `0.0 L / ${capacities.pants} L`;
    isEmptying = false;
    updateEmptyButtonVisibility();
    // Gerar novas bolhas quando mudar de forma
    generateRandomBubbles();
    // Reposicionar botões aleatoriamente
    positionButtonsRandomly();
};

// Botão esvaziar
emptyBtn.onclick = () => {
    targetWaterLevel = 0;
    bubblePopAnimation(emptyBtn);
    // Limpar bolhas quando esvaziar
    bubblePositions = [];
    // Reposicionar botões aleatoriamente
    positionButtonsRandomly();
};

function animate() {
    drawBallOrPants();
    requestAnimationFrame(animate);
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    createMarineBackground();
    generateRandomBubbles(); // Gerar bolhas iniciais
    positionButtonsRandomly(); // Posicionar botões aleatoriamente
    animate();
});

// Reposicionar botões quando a janela é redimensionada
window.addEventListener('resize', positionButtonsRandomly);