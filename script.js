// MUDANÇA: Declaração de canvas e ctx com 'let' no escopo global, sem atribuição imediata.
let canvas;
let ctx;

// --- CONSTANTES DE SISTEMA E FÍSICA (Matéria: Aceleração/Física) ---
const GRAVITY = 0.1; // Aceleração constante em Y
const DROP_RADIUS = 3;
const EMISSION_RATE = 10; // Gotas a emitir por clique
const TOTAL_FILL_STEPS = 500; // Número de gotas/steps para encher totalmente

// --- CONFIGURAÇÕES DE UI/DESENHO ---
const BUTTON_RADIUS = 40;
const BUTTON_DIAMETER = BUTTON_RADIUS * 2;
const BUTTON_MARGIN = 10;
const UI_Y_POSITION = 15;
const SHAPE_OFFSET_Y = 100;
const SHAPE_RADIUS = 80;

// Variáveis de controle de estado
let centerX, centerY;
let ballButtonRect = {};
let pantsButtonRect = {};
// MUDANÇA: Novo botão para a T-shirt
let tshirtButtonRect = {};

let fillCounter = 0;
let totalLitersConsumed = 0; // Contador de litros global (NÃO RESETA)
const maxWaterHeight = SHAPE_RADIUS * 2;
const totalCapacity = {
    ball: 3000,
    pants: 10000,
    // MUDANÇA: Capacidade para a T-shirt
    tshirt: 5000
};
let currentShape = 'ball';

// --- ARRAYS DE OBJETOS EM ANIMAÇÃO NO CANVAS (Matéria: Classes/Partículas) ---
const waterDrops = [];
const seaCreatures = [];
const numFish = 10;
const numJellyfish = 5;
const numRay = 2;


// --- CLASSE GOTA (Matéria: Classes, Movimento Acelerado/Projetil) ---
class Gota {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = DROP_RADIUS;
        this.dX = (Math.random() - 0.5) * 1.5;
        this.dY = Math.random() * 2;
        this.color = `rgba(100, 180, 255, ${Math.random() * 0.4 + 0.6})`;
        this.alive = true;
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
    }

    update(canvasH) {
        if (!this.alive) return;
        this.dY += GRAVITY;
        this.x += this.dX;
        this.y += this.dY;
        if (this.y > canvasH + this.r) {
            this.alive = false;
        }
    }
}


// --- CLASSE BASE E SUBCLASSES DE ANIMAÇÃO DE FUNDO (100% Canvas) ---
class SeaCreature {
    constructor(x, y, size, speed, color, shape, direction) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.color = color;
        this.shape = shape;
        this.direction = direction || (Math.random() > 0.5 ? 1 : -1);
        this.baseY = y;
        this.oscillation = Math.random() * Math.PI * 2;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.direction === -1) {
            ctx.scale(-1, 1);
        }
    }

    update() {
        this.x += this.speed * this.direction;
        this.y = this.baseY + Math.sin(this.oscillation + Date.now() / 500) * this.size * 0.3;
        if (this.direction === 1 && this.x > canvas.width + this.size * 3) {
            this.x = -this.size * 3;
            this.y = Math.random() * canvas.height;
            this.baseY = this.y;
            this.speed = Math.random() * 0.5 + 0.5;
        } else if (this.direction === -1 && this.x < -this.size * 3) {
            this.x = canvas.width + this.size * 3;
            this.y = Math.random() * canvas.height;
            this.baseY = this.y;
            this.speed = Math.random() * 0.5 + 0.5;
        }
    }
}

class Fish extends SeaCreature {
    constructor(x, y, size, speed, color, direction) { super(x, y, size, speed, color, 'fish', direction); }
    draw() {
        super.draw();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = `rgba(0,0,0,0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(-this.size * 1.5, -this.size * 0.5);
        ctx.lineTo(-this.size * 1.5, this.size * 0.5);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.size * 0.6, -this.size * 0.1, this.size * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = 'black'; ctx.fill();
        ctx.restore();
    }
}

class Jellyfish extends SeaCreature {
    constructor(x, y, size, speed, color, direction) { super(x, y, size, speed, color, 'jellyfish', direction); this.speed *= 0.5; }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.color;
        ctx.strokeStyle = `rgba(0,0,0,0.2)`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, this.size, 0, Math.PI, true); ctx.closePath();
        ctx.fill(); ctx.stroke();
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const startX = (i / 4) * (this.size * 1.6) - (this.size * 0.8);
            ctx.moveTo(startX, this.size * 0.5);
            const time = Date.now() / 200 + i * 0.5;
            ctx.bezierCurveTo(
                startX + (this.size * 0.3 * Math.sin(time)), this.size * (1 + i * 0.2),
                startX + (-this.size * 0.3 * Math.cos(time)), this.size * (1.5 + i * 0.2),
                startX, this.size * (2 + i * 0.2)
            );
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.restore();
    }
}

class Ray extends SeaCreature {
    constructor(x, y, size, speed, color, direction) {
        super(x, y, size, speed, color, 'ray', direction);
        this.speed = speed * 0.7;
    }

    // Desenho da arraia (CORRIGIDO)
    draw() {
        super.draw(); // Chama save, translate, scale

        const flap = Math.sin(Date.now() / 150 + this.oscillation) * this.size * 0.3; // Batida das asas

        ctx.fillStyle = this.color;
        ctx.strokeStyle = `rgba(0,0,0,0.2)`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        // Corpo central
        ctx.ellipse(0, 0, this.size * 1.2, this.size * 0.8, 0, 0, Math.PI * 2);

        // Asas
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(this.size * 0.5, -this.size * 1.5 - flap, this.size * 1.8, 0); // Asa direita
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(this.size * 0.5, this.size * 1.5 + flap, this.size * 1.8, 0); // Asa direita

        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-this.size * 0.5, -this.size * 1.5 - flap, -this.size * 1.8, 0); // Asa esquerda
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-this.size * 0.5, this.size * 1.5 + flap, -this.size * 1.8, 0); // Asa esquerda

        // Cauda
        ctx.moveTo(-this.size * 0.8, 0);
        ctx.lineTo(-this.size * 2.5, 0);

        ctx.fill();
        ctx.stroke();

        // Olho (desenha 2 olhos)
        ctx.beginPath();
        ctx.arc(this.size * 0.5, -this.size * 0.2, this.size * 0.1, 0, Math.PI * 2);
        ctx.arc(this.size * 0.2, -this.size * 0.2, this.size * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();

        ctx.restore(); // Restaura o save() do super.draw()
    }

    update() {
        super.update();
        this.y = this.baseY + Math.sin(this.oscillation + Date.now() / 600) * this.size * 0.2;
    }
}

function initSeaCreatures() {
    seaCreatures.length = 0;
    for (let i = 0; i < numFish; i++) {
        seaCreatures.push(new Fish(
            Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 15 + 10,
            Math.random() * 1 + 0.5, `hsl(${Math.random() * 60 + 180}, 70%, 70%)`, Math.random() > 0.5 ? 1 : -1
        ));
    }
    for (let i = 0; i < numJellyfish; i++) {
        seaCreatures.push(new Jellyfish(
            Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 15 + 10,
            Math.random() * 0.5 + 0.2, `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.2})`, Math.random() > 0.5 ? 1 : -1
        ));
    }
    for (let i = 0; i < numRay; i++) {
        seaCreatures.push(new Ray(
            Math.random() * canvas.width, canvas.height * 0.8 + Math.random() * canvas.height * 0.2,
            Math.random() * 25 + 15, Math.random() * 0.8 + 0.3, `rgb(80, 80, 90)`, Math.random() > 0.5 ? 1 : -1
        ));
    }
}

// --- FUNÇÕES DE LAYOUT/REDIMENSIONAMENTO ---

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    centerX = canvas.width / 2;
    centerY = (canvas.height - SHAPE_OFFSET_Y) / 2 + SHAPE_OFFSET_Y;

    // MUDANÇA: Ajusta o posicionamento dos botões para 3 opções
    const totalButtonsWidth = BUTTON_DIAMETER * 3 + BUTTON_MARGIN * 2;
    const startX = centerX - totalButtonsWidth / 2 + BUTTON_RADIUS;

    ballButtonRect = {
        x: startX,
        y: UI_Y_POSITION + BUTTON_RADIUS,
        r: BUTTON_RADIUS
    };
    pantsButtonRect = {
        x: startX + BUTTON_DIAMETER + BUTTON_MARGIN,
        y: UI_Y_POSITION + BUTTON_RADIUS,
        r: BUTTON_RADIUS
    };
    tshirtButtonRect = {
        x: startX + (BUTTON_DIAMETER + BUTTON_MARGIN) * 2,
        y: UI_Y_POSITION + BUTTON_RADIUS,
        r: BUTTON_RADIUS
    };

    waterDrops.length = 0;
    initSeaCreatures();
}

// FUNÇÃO DE DESENHO DE CALÇAS (Estilo Ícone em V - FINAL)
function drawPants() {
    ctx.save();
    const R = SHAPE_RADIUS;
    const C = { x: centerX, y: centerY };

    // Dimensões relativas
    const waistY = C.y - R * 1.0;
    const bottomY = C.y + R * 0.8;
    const waistWidth = R * 1.8;
    const legOuterWidth = R * 0.9;
    const legInnerWidth = R * 0.4;

    // 1. Desenhar a forma principal (V invertido)
    ctx.beginPath();

    // Cintura
    ctx.moveTo(C.x - waistWidth / 2, waistY);
    ctx.lineTo(C.x + waistWidth / 2, waistY);

    // Perna direita
    ctx.lineTo(C.x + legOuterWidth, bottomY);
    ctx.lineTo(C.x + legInnerWidth, bottomY);

    // Virilha (Ponta do V)
    ctx.lineTo(C.x, C.y + R * 0.2);

    // Perna esquerda
    ctx.lineTo(C.x - legInnerWidth, bottomY);
    ctx.lineTo(C.x - legOuterWidth, bottomY);

    ctx.closePath();

    // Preenchimento e Contorno (Corpo da Calça)


    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore();
}

// MUDANÇA: Nova função para desenhar a T-shirt
function drawTshirt() {
    ctx.save();
    const R = SHAPE_RADIUS;
    const C = { x: centerX, y: centerY };

    // Dimensões relativas da T-shirt
    const neckTopY = C.y - R * 1;
    const shoulderOutX = C.x + R * 1.1;
    const sleeveY = C.y - R * 0.3;
    const armpitY = C.y + R * 0.1;
    const bottomY = C.y + R * 1.0;
    const bodyWidth = R * 1.8;

    ctx.beginPath();


    // Ombro direito e manga
    ctx.lineTo(shoulderOutX, neckTopY);
    ctx.lineTo(shoulderOutX + R * 0.3, sleeveY); // Ponta da manga
    ctx.lineTo(C.x + R * 0.9, armpitY); // Axila

    // Lado direito do corpo
    ctx.lineTo(C.x + bodyWidth / 2, bottomY);

    // Parte inferior
    ctx.lineTo(C.x - bodyWidth / 2, bottomY);

    // Lado esquerdo do corpo
    ctx.lineTo(C.x - R * 0.9, armpitY); // Axila

    // Ombro esquerdo e manga
    ctx.lineTo(shoulderOutX * -1 - R * 0.3 + C.x * 2, sleeveY); // Ponta da manga (adaptado para o centro)
    ctx.lineTo(shoulderOutX + -170, neckTopY); // Ombro

    ctx.closePath();

    // Preenchimento e Contorno
    ctx.strokeStyle = 'white'; // Contorno
    ctx.lineWidth = 2;
    ctx.stroke();



    ctx.restore();
}


// Padrão de bola simples (mantido)
function drawBallPattern() {
    ctx.save();
    ctx.translate(centerX, centerY);

    const radius = SHAPE_RADIUS;
    const numPentagons = 6;
    const pentagonRadius = radius * 0.3;
    const rotationSpeed = Date.now() / 5000;

    ctx.rotate(rotationSpeed);

    for (let i = 0; i < numPentagons; i++) {
        const angle = (i / numPentagons) * (Math.PI * 2);
        const x = radius * 0.55 * Math.cos(angle);
        const y = radius * 0.55 * Math.sin(angle);

        ctx.beginPath();

        for (let j = 0; j < 5; j++) {
            const pointAngle = angle + (j / 5) * (Math.PI * 2);
            const px = x + pentagonRadius * Math.cos(pointAngle);
            const py = y + pentagonRadius * Math.sin(pointAngle);
            if (j === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }

        ctx.closePath();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.globalAlpha = 0.2;
    const shadowGradient = ctx.createRadialGradient(
        radius * 0.3, radius * 0.3, radius * 0.1,
        0, 0, radius
    );
    shadowGradient.addColorStop(0, 'transparent');
    shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    ctx.fillStyle = shadowGradient;
    ctx.fill();
    ctx.globalAlpha = 1.0;

    ctx.restore();
}


function drawWaterLevel() {
    const waterHeight = (fillCounter / TOTAL_FILL_STEPS) * maxWaterHeight;
    const waterY = centerY + SHAPE_RADIUS - waterHeight;

    ctx.save();

    // 1. Recorte da Forma (Matéria: Paths, Clip)
    ctx.beginPath();
    if (currentShape === 'ball') {
        ctx.arc(centerX, centerY, SHAPE_RADIUS, 0, Math.PI * 2);
    } else if (currentShape === 'pants') {
        // Usa o PATH da forma das calças para o clipping
        const R = SHAPE_RADIUS;
        const C = { x: centerX, y: centerY };
        const waistY = C.y - R * 1.0;
        const bottomY = C.y + R * 0.8;
        const waistWidth = R * 1.8;
        const legOuterWidth = R * 0.9;
        const legInnerWidth = R * 0.4;

        ctx.moveTo(C.x - waistWidth / 2, waistY);
        ctx.lineTo(C.x + waistWidth / 2, waistY);
        ctx.lineTo(C.x + legOuterWidth, bottomY);
        ctx.lineTo(C.x + legInnerWidth, bottomY);
        ctx.lineTo(C.x, C.y + R * 0.2);
        ctx.lineTo(C.x - legInnerWidth, bottomY);
        ctx.lineTo(C.x - legOuterWidth, bottomY);
        ctx.closePath();
    } else if (currentShape === 'tshirt') { // MUDANÇA: Clipping para a T-shirt
        const R = SHAPE_RADIUS;
        const C = { x: centerX, y: centerY };
        const neckTopY = C.y - R * 1.1;
        const shoulderOutX = C.x + R * 1.1;
        const sleeveY = C.y - R * 0.3;
        const armpitY = C.y + R * 0.1;
        const bottomY = C.y + R * 1.0;
        const bodyWidth = R * 1.8;

        ctx.arc(C.x, neckTopY + R * 0.2, R * 0.3, Math.PI, Math.PI * 2);
        ctx.lineTo(shoulderOutX, neckTopY);
        ctx.lineTo(shoulderOutX + R * 0.3, sleeveY);
        ctx.lineTo(C.x + R * 0.9, armpitY);
        ctx.lineTo(C.x + bodyWidth / 2, bottomY);
        ctx.lineTo(C.x - bodyWidth / 2, bottomY);
        ctx.lineTo(C.x - R * 0.9, armpitY);
        ctx.lineTo(shoulderOutX * -1 - R * 0.3 + C.x * 2, sleeveY);
        ctx.lineTo(C.x - shoulderOutX, neckTopY);
        ctx.closePath();
    }
    ctx.clip();

    // 2. Desenho do Corpo da Água (Preenchimento)
    // Ajustado para ser maior, cobrindo qualquer forma
    ctx.beginPath();
    ctx.rect(centerX - SHAPE_RADIUS * 2, waterY, SHAPE_RADIUS * 4, waterHeight);

    const gradient = ctx.createLinearGradient(0, centerY - SHAPE_RADIUS, 0, centerY + SHAPE_RADIUS);
    gradient.addColorStop(0, 'rgba(0, 150, 255, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 100, 255, 0.8)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // 3. Onda da Água (Animação feita no Canvas)
    ctx.beginPath();
    // A onda deve cobrir a largura da forma atual, ou uma largura fixa segura
    const waveWidth = SHAPE_RADIUS * 2;
    ctx.moveTo(centerX - waveWidth / 2, waterY);
    for (let x = centerX - waveWidth / 2; x <= centerX + waveWidth / 2; x += 5) {
        const wave = Math.sin((x + Date.now() / 300) / 10) * 2;
        ctx.lineTo(x, waterY + wave);
    }
    ctx.lineTo(centerX + waveWidth / 2, waterY);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
}

function drawInfoText() {
    ctx.save();
    const maxCapacity = totalCapacity[currentShape];
    const currentLiters = (fillCounter / TOTAL_FILL_STEPS) * maxCapacity;

    const text = `Consumo Atual: ${currentLiters.toFixed(0).toLocaleString()} L / ${maxCapacity.toLocaleString()} L`;

    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 6;
    ctx.textAlign = 'center';
    ctx.fillText(text, centerX, centerY - SHAPE_RADIUS - 20);

    ctx.font = '16px Arial';
    ctx.fillText('Clique na forma para a encher!', centerX, centerY + SHAPE_RADIUS + 40);

    const accumulatedText = `Total Acumulado (Todos os produtos): ${totalLitersConsumed.toFixed(0).toLocaleString()} L`;
    ctx.fillText(accumulatedText, centerX, centerY + SHAPE_RADIUS + 65);

    ctx.restore();
}


// --- FUNÇÃO DE DESENHO DO BOTÃO BOLHA (100% Canvas com Transparência) ---

function drawBubbleButton(cx, cy, r, text, isActive) {
    ctx.save();

    const pulse = Math.sin(Date.now() / 400) * 0.05 + 1;

    if (isActive) {
        ctx.translate(cx, cy);
        ctx.scale(pulse, pulse);
        ctx.translate(-cx, -cy);
    }

    const bubbleGradient = ctx.createRadialGradient(
        cx - r * 0.3, cy - r * 0.3, r * 0.1,
        cx, cy, r
    );

    const colorStart = isActive ? 'rgba(150, 255, 150, 0.55)' : 'rgba(255, 255, 255, 0.55)';
    const colorEnd = isActive ? 'rgba(0, 150, 0, 0.1)' : 'rgba(100, 100, 255, 0.1)';

    bubbleGradient.addColorStop(0, colorStart);
    bubbleGradient.addColorStop(0.9, colorEnd);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = bubbleGradient;
    ctx.fill();

    ctx.strokeStyle = isActive ? 'rgb(0, 255, 0)' : 'rgba(255, 255, 255, 1.0)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx - r * 0.3, cy - r * 0.4, r * 0.2, 0, Math.PI * 2);
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = isActive ? 'white' : 'black';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 2;
    ctx.fillText(text, cx, cy);

    ctx.restore();
}

function drawButtons() {
    ctx.save();
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    drawBubbleButton(
        ballButtonRect.x, ballButtonRect.y, ballButtonRect.r,
        'Bola', currentShape === 'ball'
    );

    drawBubbleButton(
        pantsButtonRect.x, pantsButtonRect.y, pantsButtonRect.r,
        'Calças', currentShape === 'pants'
    );

    // MUDANÇA: Novo botão para a T-shirt
    drawBubbleButton(
        tshirtButtonRect.x, tshirtButtonRect.y, tshirtButtonRect.r,
        'T-shirt', currentShape === 'tshirt'
    );

    ctx.restore();
}

// --- FUNÇÃO PRINCIPAL DE DESENHO (LOOP DE ANIMAÇÃO) ---
function draw() {
    // 1. Limpa o canvas com um gradiente de fundo marinho
    ctx.save();
    const gradientBackground = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradientBackground.addColorStop(0, `hsl(200, 80%, 20%)`);
    gradientBackground.addColorStop(0.5, `hsl(210, 70%, 30%)`);
    gradientBackground.addColorStop(1, `hsl(220, 60%, 10%)`);
    ctx.fillStyle = gradientBackground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // 2. Desenha e atualiza os animais marinhos (Animação de Fundo)
    seaCreatures.forEach(creature => {
        creature.update();
        creature.draw(ctx);
    });

    // 3. Colisão, Atualização e Desenho das Gotas (Particle System)
    for (let i = waterDrops.length - 1; i >= 0; i--) {
        const drop = waterDrops[i];

        const waterHeight = (fillCounter / TOTAL_FILL_STEPS) * maxWaterHeight;
        const currentWaterY = centerY + SHAPE_RADIUS - waterHeight;

        if (drop.y + drop.r >= currentWaterY && fillCounter < TOTAL_FILL_STEPS) {
            // Verifica se a gota colidiu DENTRO da forma preenchível
            // Para isso, precisamos de um PATH temporário para testar isPointInPath
            ctx.beginPath();
            if (currentShape === 'ball') {
                ctx.arc(centerX, centerY, SHAPE_RADIUS, 0, Math.PI * 2);
            } else if (currentShape === 'pants') {
                const R = SHAPE_RADIUS;
                const C = { x: centerX, y: centerY };
                const waistY = C.y - R * 1.0;
                const bottomY = C.y + R * 0.8;
                const waistWidth = R * 1.8;
                const legOuterWidth = R * 0.9;
                const legInnerWidth = R * 0.4;
                ctx.moveTo(C.x - waistWidth / 2, waistY);
                ctx.lineTo(C.x + waistWidth / 2, waistY);
                ctx.lineTo(C.x + legOuterWidth, bottomY);
                ctx.lineTo(C.x + legInnerWidth, bottomY);
                ctx.lineTo(C.x, C.y + R * 0.2);
                ctx.lineTo(C.x - legInnerWidth, bottomY);
                ctx.lineTo(C.x - legOuterWidth, bottomY);
                ctx.closePath();
            } else if (currentShape === 'tshirt') { // MUDANÇA: Colisão para T-shirt
                const R = SHAPE_RADIUS;
                const C = { x: centerX, y: centerY };
                const neckTopY = C.y - R * 1.1;
                const shoulderOutX = C.x + R * 1.1;
                const sleeveY = C.y - R * 0.3;
                const armpitY = C.y + R * 0.1;
                const bottomY = C.y + R * 1.0;
                const bodyWidth = R * 1.8;

                ctx.arc(C.x, neckTopY + R * 0.2, R * 0.3, Math.PI, Math.PI * 2);
                ctx.lineTo(shoulderOutX, neckTopY);
                ctx.lineTo(shoulderOutX + R * 0.3, sleeveY);
                ctx.lineTo(C.x + R * 0.9, armpitY);
                ctx.lineTo(C.x + bodyWidth / 2, bottomY);
                ctx.lineTo(C.x - bodyWidth / 2, bottomY);
                ctx.lineTo(C.x - R * 0.9, armpitY);
                ctx.lineTo(shoulderOutX * -1 - R * 0.3 + C.x * 2, sleeveY);
                ctx.lineTo(C.x - shoulderOutX, neckTopY);
                ctx.closePath();
            }

            if (ctx.isPointInPath(drop.x, drop.y)) { // Testar se a gota está dentro do caminho da forma
                drop.alive = false;
                fillCounter++;
            }
        }
        drop.update(canvas.height);
        drop.draw(ctx);
        if (!drop.alive) {
            waterDrops.splice(i, 1);
        }
    }

    drawWaterLevel();

    // 4. Desenha a FORMA PRINCIPAL
    ctx.save();
    if (currentShape === 'ball') {
        // DESENHO DA BOLA SIMPLES (Círculo)
        ctx.beginPath();
        ctx.arc(centerX, centerY, SHAPE_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        drawBallPattern();

    } else if (currentShape === 'pants') {
        drawPants();
    } else if (currentShape === 'tshirt') { // MUDANÇA: Desenha a T-shirt
        drawTshirt();
    }
    ctx.restore();

    // 5. Desenha a UI (Botões e Texto) - 100% Canvas
    drawButtons();
    drawInfoText();
}

// --- FUNÇÕES DE INTERAÇÃO (Colisão Círculo-Ponto) ---

function selectShape(shape) {
    currentShape = shape;
    fillCounter = 0;
    waterDrops.length = 0;
}

function isClickInCircle(x, y, circle) {
    const distance = Math.sqrt(Math.pow(x - circle.x, 2) + Math.pow(y - circle.y, 2));
    return distance <= circle.r;
}

function isClickInShape(x, y) {
    ctx.beginPath();
    if (currentShape === 'ball') {
        ctx.arc(centerX, centerY, SHAPE_RADIUS, 0, Math.PI * 2);
    } else if (currentShape === 'pants') {
        // Usa o PATH da nova forma para detetar o clique
        const R = SHAPE_RADIUS;
        const C = { x: centerX, y: centerY };
        const waistY = C.y - R * 1.0;
        const bottomY = C.y + R * 0.8;
        const waistWidth = R * 1.8;
        const legOuterWidth = R * 0.9;
        const legInnerWidth = R * 0.4;

        ctx.moveTo(C.x - waistWidth / 2, waistY);
        ctx.lineTo(C.x + waistWidth / 2, waistY);
        ctx.lineTo(C.x + legOuterWidth, bottomY);
        ctx.lineTo(C.x + legInnerWidth, bottomY);
        ctx.lineTo(C.x, C.y + R * 0.2);
        ctx.lineTo(C.x - legInnerWidth, bottomY);
        ctx.lineTo(C.x - legOuterWidth, bottomY);
        ctx.closePath();
    } else if (currentShape === 'tshirt') { // MUDANÇA: Detecção de clique para a T-shirt
        const R = SHAPE_RADIUS;
        const C = { x: centerX, y: centerY };
        const neckTopY = C.y - R * 1.1;
        const shoulderOutX = C.x + R * 1.1;
        const sleeveY = C.y - R * 0.3;
        const armpitY = C.y + R * 0.1;
        const bottomY = C.y + R * 1.0;
        const bodyWidth = R * 1.8;

        ctx.arc(C.x, neckTopY + R * 0.2, R * 0.3, Math.PI, Math.PI * 2);
        ctx.lineTo(shoulderOutX, neckTopY);
        ctx.lineTo(shoulderOutX + R * 0.3, sleeveY);
        ctx.lineTo(C.x + R * 0.9, armpitY);
        ctx.lineTo(C.x + bodyWidth / 2, bottomY);
        ctx.lineTo(C.x - bodyWidth / 2, bottomY);
        ctx.lineTo(C.x - R * 0.9, armpitY);
        ctx.lineTo(shoulderOutX * -1 - R * 0.3 + C.x * 2, sleeveY);
        ctx.lineTo(C.x - shoulderOutX, neckTopY);
        ctx.closePath();
    }
    return ctx.isPointInPath(x, y);
}

// --- FUNÇÃO DE INICIALIZAÇÃO E EVENTOS ---

function init() {
    canvas = document.getElementById('ballCanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    ctx = canvas.getContext('2d');

    canvas.addEventListener('click', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (isClickInCircle(x, y, ballButtonRect)) {
            selectShape('ball');
        } else if (isClickInCircle(x, y, pantsButtonRect)) {
            selectShape('pants');
        } else if (isClickInCircle(x, y, tshirtButtonRect)) { // MUDANÇA: Clique no botão T-shirt
            selectShape('tshirt');
        }
        else if (isClickInShape(x, y) && fillCounter < TOTAL_FILL_STEPS) {
            const maxCapacity = totalCapacity[currentShape];
            const litersPerStep = maxCapacity / TOTAL_FILL_STEPS;
            totalLitersConsumed += litersPerStep * EMISSION_RATE;

            for (let i = 0; i < EMISSION_RATE; i++) {
                if (fillCounter < TOTAL_FILL_STEPS) {
                    waterDrops.push(new Gota(x, y));
                }
            }
        }
    });

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
}

// --- Loop de Animação ---
function animate() {
    draw();
    requestAnimationFrame(animate);
}

// Ponto de entrada final
window.addEventListener('load', init);