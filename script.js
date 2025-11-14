let canvas;
let ctx;
let W;
let H;

// --- VARIÁVEIS ML5 E CÂMARA ---
let video;
let handpose;
let hands = [];
let isCameraLoaded = false;
let fingerHitbox = { x: 0, y: 0, r: 10, smoothing: 0.2 };

// --- VARIÁVEIS DO RATO (REINTRODUZIDAS) ---
let mouseX = 0;
let mouseY = 0;
let isMouseDown = false;
let isFillingActive = false;


// --- NOVAS VARIÁVEIS PARA O SPLASH SCREEN ---
let splashCanvas;
let splashCtx;
const bubbles = [];
const NUM_BUBBLES = 50;

// --- CONSTANTES DE SISTEMA E FÍSICA (Matéria: Aceleração/Física) ---
const GRAVITY = 0.1;
const DROP_RADIUS = 3;
const EMISSION_RATE = 4;
const TOTAL_FILL_STEPS = 500;

// --- CONFIGURAÇÕES DE UI/DESENHO ---
const BUTTON_RADIUS = 45;
const BUTTON_DIAMETER = BUTTON_RADIUS * 2;
const BUTTON_MARGIN = 10;
const UI_Y_POSITION = 195;
const SHAPE_OFFSET_Y = 100;
const SHAPE_RADIUS = 80;

// Variáveis de controle de estado
let centerX, centerY;
let bolaButtonRect = {};
let tshirtButtonRect = {};
let phoneButtonRect = {};
let cupButtonRect = {};

let mascotFish = null;
let isMascotHovered = false;

let fillCounter = 0;
let totalLitersConsumed = 0;
const maxWaterHeight = SHAPE_RADIUS * 2;
const totalCapacity = {
    bola: 3000,
    tshirt: 5000,
    phone: 15000,
    cup: 2000
};
let currentShape = 'bola';

// Variaveis do botão esvaziar
let emptyButtonRect = {};
let emptyButtonOpacity = 0.0;
let emptyButtonScale = 0.5;

// animação
const waterDrops = [];
const seaCreatures = [];
const numFish = 10;
const numJellyfish = 5;
const numRay = 2;


// --- CLASSE BOLHA (Para o Splash Screen) ---
class Bubble {
    constructor(w, h) {
        this.x = Math.random() * w;
        this.y = h + Math.random() * h;
        this.r = Math.random() * 5 + 2;
        this.speed = Math.random() * 1 + 0.5;
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`;
        this.w = w;
        this.h = h;
    }

    update() {
        this.y -= this.speed;
        this.x += Math.sin(this.y / 20) * 0.1;
        if (this.y < -this.r) {
            this.y = this.h + this.r;
            this.x = Math.random() * this.w;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
    }
}


// --- CLASSE GOTA ---
class Gota {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = DROP_RADIUS;
        this.dX = Math.random() * 1;
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


// animação no fundo
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
            this.speed = Math.random() * 1 + 0.5;
        } else if (this.direction === -1 && this.x < -this.size * 3) {
            this.x = canvas.width + this.size * 3;
            this.y = Math.random() * canvas.height;
            this.baseY = this.y;
            this.speed = Math.random() * 1 + 0.5;
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
        // Corpo do peixe
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Cauda
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(-this.size * 1.5, -this.size * 0.5);
        ctx.lineTo(-this.size * 1.5, this.size * 0.5);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Olho
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

        // Corpo do Medusa
        ctx.beginPath(); ctx.arc(0, 0, this.size, 0, Math.PI, true); ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Tentáculos (Bezier Curves)
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

    // Raia
    draw() {
        super.draw();

        const flap = Math.sin(Date.now() / 150 + this.oscillation) * this.size * 0.3;

        ctx.fillStyle = this.color;
        ctx.strokeStyle = `rgba(0,0,0,0.2)`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        // Corpo e Barbatanas
        ctx.moveTo(this.size * 1.2, 0);
        ctx.quadraticCurveTo(this.size * 0.5, -this.size * 1.5 - flap, -this.size * 1.8, 0);
        ctx.quadraticCurveTo(this.size * 0.5, this.size * 1.5 + flap, this.size * 1.2, 0);

        ctx.fill();
        ctx.stroke();

        // Cauda
        ctx.beginPath();
        ctx.moveTo(-this.size * 1.8, 0);
        ctx.lineTo(-this.size * 2.5, 0);
        ctx.stroke();

        // Olhos
        ctx.beginPath();
        ctx.arc(this.size * 0.8, -this.size * 0.2, this.size * 0.1, 0, Math.PI * 2);
        ctx.arc(this.size * 0.8, this.size * 0.2, this.size * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();

        ctx.restore();
    }

    update() {
        super.update();
        this.y = this.baseY + Math.sin(this.oscillation + Date.now() / 600) * this.size * 0.2;
    }
}

// Peixe Mascote
class MascotFish {
    constructor(x, y, size, direction) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = `hsl(30, 90%, 60%)`;
        this.direction = direction || 1;
        this.hitboxR = size * 1.5;
        this.message = "Se custa encheres, imagina a produzir! Pensa no ambiente";
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.direction === -1) {
            ctx.scale(-1, 1);
        }

        // Gradiente pro peixe
        const gradient = ctx.createLinearGradient(-this.size, 0, this.size, 0);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.5, '#FF8C00');
        gradient.addColorStop(1, '#B8860B');

        // Corpo
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = `rgba(0,0,0,0.3)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Cauda
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(-this.size * 1.5, -this.size * 0.5);
        ctx.lineTo(-this.size * 1.5, this.size * 0.5);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

        // Olho
        ctx.beginPath();
        ctx.arc(this.size * 0.6, -this.size * 0.1, this.size * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();


        ctx.restore();
    }

    update() {
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

// Layout

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // ATUALIZA AS VARIÁVEIS GLOBAIS W e H
    W = canvas.width;
    H = canvas.height;

    centerX = canvas.width / 2;
    centerY = (canvas.height - SHAPE_OFFSET_Y) / 2 + SHAPE_OFFSET_Y;

//Butões
    const numButtons = 4;
    const totalButtonsWidth = BUTTON_DIAMETER * numButtons + BUTTON_MARGIN * (numButtons - 1);
    const startX = centerX - totalButtonsWidth / 2 + BUTTON_RADIUS;

    bolaButtonRect = {
        x: startX,
        y: UI_Y_POSITION + BUTTON_RADIUS,
        r: BUTTON_RADIUS
    };
    tshirtButtonRect = {
        x: startX + (BUTTON_DIAMETER + BUTTON_MARGIN),
        y: UI_Y_POSITION + BUTTON_RADIUS,
        r: BUTTON_RADIUS
    };
    phoneButtonRect = {
        x: startX + (BUTTON_DIAMETER + BUTTON_MARGIN) * 2,
        y: UI_Y_POSITION + BUTTON_RADIUS,
        r: BUTTON_RADIUS
    };
    cupButtonRect = {
        x: startX + (BUTTON_DIAMETER + BUTTON_MARGIN) * 3,
        y: UI_Y_POSITION + BUTTON_RADIUS,
        r: BUTTON_RADIUS
    };

    // Posição do botão esvaziar
    emptyButtonRect = {
        x: canvas.width - BUTTON_RADIUS * 0.7 - BUTTON_MARGIN * 70,
        y: canvas.height - BUTTON_RADIUS * 0.7 - BUTTON_MARGIN * 20,
        r: BUTTON_RADIUS * 1
    };

    // Posição da mascote
    const mascotSize = SHAPE_RADIUS * 0.8;
    mascotFish = new MascotFish(
        mascotSize * 2,
        canvas.height - mascotSize * 1.5,
        mascotSize,
        1
    );

    waterDrops.length = 0;
    initSeaCreatures();
}
// Tshirt
function drawTshirt() {
    ctx.save();
    const R = SHAPE_RADIUS;
    const C = { x: centerX, y: centerY };

    // Dimensões relativas da T-shirt
    const neckTopY = C.y - R * 1.0;
    const shoulderOutX = C.x + R * 1.1;
    const sleeveY = C.y - R * 0.3;
    const armpitY = C.y + R * 0.1;
    const bottomY = C.y + R * 1.0;
    const bodyWidth = R * 1.8;

    ctx.beginPath();

    // Ombro direito e manga
    ctx.lineTo(shoulderOutX, neckTopY);
    ctx.lineTo(shoulderOutX + R * 0.3, sleeveY);
    ctx.lineTo(C.x + R * 0.9, armpitY);

    // Lado direito do corpo
    ctx.lineTo(C.x + bodyWidth / 2, bottomY);

    // Parte inferior
    ctx.lineTo(C.x - bodyWidth / 2, bottomY);

    // Lado esquerdo do corpo
    ctx.lineTo(C.x - R * 0.9, armpitY);

    // Ombro esquerdo e manga
    ctx.lineTo(C.x - R * 1.1 - R * 0.3, sleeveY);
    ctx.lineTo(C.x - R * 1.1, neckTopY);

    // Decote
    ctx.arc(C.x, neckTopY, R * 0.25, Math.PI, 0);

    ctx.closePath();

    // Contorno
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore();
}

// copo
function drawCup() {
    ctx.save();
    const R = SHAPE_RADIUS;
    const C = { x: centerX, y: centerY };

    // Dimensões relativas do copo
    const topY = C.y - R * 0.8;
    const bottomY = C.y + R * 1.0;
    const topWidth = R * 1.0;
    const bottomWidth = R * 0.8;

    // Corpo
    ctx.beginPath();
    ctx.moveTo(C.x - topWidth / 2.5, topY);

    ctx.lineTo(C.x + topWidth / 1.5, topY);
    ctx.lineTo(C.x + bottomWidth / 1.19, bottomY);
    ctx.lineTo(C.x - bottomWidth / 2.5, bottomY);
    ctx.closePath();

    // Contorno corpo
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Pega
    const handleCenterX = C.x + topWidth / 2 + R * 0.2;
    const handleCenterY = C.y;
    const handleOuterRadius = R * 0.4;
    const handleInnerRadius = R * 0.3;

    ctx.beginPath();

    ctx.moveTo(handleCenterX, handleCenterY - handleOuterRadius);
    ctx.arc(handleCenterX, handleCenterY, handleOuterRadius, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(handleCenterX, handleCenterY + handleInnerRadius);
    ctx.arc(handleCenterX, handleCenterY, handleInnerRadius, Math.PI / 2, -Math.PI / 2, true);

    ctx.closePath();

    // Contorno Pega
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore();
}

// Telemóvel
function drawPhone() {
    ctx.save();
    const R = SHAPE_RADIUS;
    const C = { x: centerX, y: centerY };

    const width = R * 1.5;
    const height = R * 2.5;
    const borderRadius = R * 0.2;
    const x = C.x - width / 2;
    const y = C.y - height / 2;

    ctx.beginPath();
    ctx.moveTo(x + borderRadius, y);
    ctx.lineTo(x + width - borderRadius, y);
    ctx.arcTo(x + width, y, x + width, y + borderRadius, borderRadius);
    ctx.lineTo(x + width, y + height - borderRadius);
    ctx.arcTo(x + width, y + height, x + width - borderRadius, y + height, borderRadius);
    ctx.lineTo(x + borderRadius, y + height);
    ctx.arcTo(x, y + height, x, y + height - borderRadius, borderRadius);
    ctx.lineTo(x, y + borderRadius);
    ctx.arcTo(x, y, x + borderRadius, y, borderRadius);
    ctx.closePath();

    // Contorno
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Detalhe da camara
    ctx.beginPath();
    ctx.arc(C.x, y + R*0.3, R*0.05, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(C.x, y + R*2.2, R*0.10, 0, Math.PI * 2);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}


// Bola detalhes
function drawBolaPattern() {
    ctx.save();
    ctx.translate(centerX, centerY);

    const radius = SHAPE_RADIUS;
    const numPentagons = 3;
    const pentagonRadius = radius * 0.4;
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
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 4;
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


function drawWaterLevel() {// Calcúla a altura máxima e define o ponto de partida no fundo da forma
    let shapeMaxHeight = maxWaterHeight;
    let shapeBottomY = centerY + SHAPE_RADIUS;
    const R = SHAPE_RADIUS;

    if (currentShape === 'phone') {
        shapeMaxHeight = R * 2.5;
        shapeBottomY = centerY + R * 2.5 / 2;
    } else if (currentShape === 'cup') {
        shapeMaxHeight = R * 1.8;
        shapeBottomY = centerY + R * 1.0;
    }

    const waterHeight = (fillCounter / TOTAL_FILL_STEPS) * shapeMaxHeight;
    const waterY = shapeBottomY - waterHeight;

    ctx.save();

    // 1. Cria a máscara (Clipping Path)
    ctx.beginPath();
    if (currentShape === 'bola') {
        ctx.arc(centerX, centerY, SHAPE_RADIUS, 0, Math.PI * 2);
    } else if (currentShape === 'tshirt') {
        // Clipping t-shirt
        const C = { x: centerX, y: centerY };
        const neckTopY = C.y - R * 1.0;
        const shoulderOutX = C.x + R * 1.1;
        const sleeveY = C.y - R * 0.3;
        const armpitY = C.y + R * 0.1;
        const bottomY = C.y + R * 1.0;
        const bodyWidth = R * 1.8;

        ctx.beginPath();

        ctx.lineTo(shoulderOutX, neckTopY);
        ctx.lineTo(shoulderOutX + R * 0.3, sleeveY);
        ctx.lineTo(C.x + R * 0.9, armpitY);
        ctx.lineTo(C.x + bodyWidth / 2, bottomY);
        ctx.lineTo(C.x - bodyWidth / 2, bottomY);
        ctx.lineTo(C.x - R * 0.9, armpitY);
        ctx.lineTo(C.x - R * 1.1 - R * 0.3, sleeveY);
        ctx.lineTo(C.x - R * 1.1, neckTopY);
        ctx.arc(C.x, neckTopY, R * 0.25, Math.PI, 0);
        ctx.closePath();
    } else if (currentShape === 'phone') {
        // Clipping telemóvel
        const C = { x: centerX, y: centerY };
        const width = R * 1.5;
        const height = R * 2.5;
        const borderRadius = R * 0.2;
        const x = C.x - width / 2;
        const y = C.y - height / 2;

        ctx.moveTo(x + borderRadius, y);
        ctx.lineTo(x + width - borderRadius, y);
        ctx.arcTo(x + width, y, x + width, y + borderRadius, borderRadius);
        ctx.lineTo(x + width, y + height - borderRadius);
        ctx.arcTo(x + width, y + height, x + width - borderRadius, y + height, borderRadius);
        ctx.lineTo(x + borderRadius, y + height);
        ctx.arcTo(x, y + height, x, y + height - borderRadius, borderRadius);
        ctx.lineTo(x, y + borderRadius);
        ctx.arcTo(x, y, x + borderRadius, y, borderRadius);
        ctx.closePath();
    } else if (currentShape === 'cup') {
        // Clipping Copo
        const C = { x: centerX, y: centerY };
        const topY = C.y - R * 0.8;
        const bottomY = C.y + R * 1.0;
        const topWidth = R * 1.0;
        const bottomWidth = R * 0.8;

        ctx.moveTo(C.x - topWidth / 2.5, topY);
        ctx.lineTo(C.x + topWidth / 1.5, topY);
        ctx.lineTo(C.x + bottomWidth / 1.19, bottomY);
        ctx.lineTo(C.x - bottomWidth / 2.5, bottomY);
        ctx.closePath();
    }
    ctx.clip();


    // 2. Desenha a Água (o retângulo que é limitado pela máscara)
    ctx.beginPath();
    ctx.rect(centerX - SHAPE_RADIUS * 2, waterY, SHAPE_RADIUS * 4, shapeBottomY - waterY);
    const gradient = ctx.createLinearGradient(0, centerY - SHAPE_RADIUS, 0, centerY + SHAPE_RADIUS);
    gradient.addColorStop(0, 'rgba(0, 150, 255, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 100, 255, 0.8)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // 3. Desenha a Onda no Topo
    ctx.beginPath();
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
    ctx.fillText(text, centerX, centerY - SHAPE_RADIUS - 50);

    ctx.font = '18px Arial';

    let subtext = 'Aponte o dedo para a forma para a encher (ou clique e arraste com o rato)!';
    if (fillCounter >= TOTAL_FILL_STEPS) {
         subtext = 'Capacidade Máxima Atingida!';
    }

    ctx.fillText(subtext, centerX, centerY + SHAPE_RADIUS + 60);

    const accumulatedText = `Total Acumulado (Todos os produtos): ${totalLitersConsumed.toFixed(0).toLocaleString()} L`;
    ctx.fillText(accumulatedText, centerX, centerY + SHAPE_RADIUS + 85);

    ctx.restore();
}

// Bolha fala mascote
function drawSpeechBubble() {
    if (!isMascotHovered || !mascotFish) return;

    ctx.save();
    const fish = mascotFish;

    const padding = 30;
    const arrowSize = 1;

    // Ondas a mexer
    const time = Date.now() / 400;
    const floatY = Math.sin(time) * 10;
    const scalePulse = Math.sin(time * 0.5) * 0.01 + 1;

    ctx.font = '20px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Mede o texto para dimensionar a bolha
    const lines = fish.message.match(/.{1,40}(\s|$)/g) || [fish.message];
    const lineHeight = 20;
    const textWidth = ctx.measureText(lines[0]).width;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = lines.length * lineHeight + padding * 2;

    const boxX = fish.x + fish.size * 2;
    const boxY = fish.y - boxHeight - arrowSize + floatY;

    // Move para o centro da caixa para aplicar a escala
    const boxCenterX = boxX + boxWidth / 2;
    const boxCenterY = boxY + boxHeight / 2;

    // animação
    ctx.translate(boxCenterX, boxCenterY);
    ctx.scale(scalePulse, scalePulse);
    ctx.translate(-boxCenterX, -boxCenterY);


    // Gradiente bolha fala
    const bubbleGradient = ctx.createRadialGradient(
        boxX + boxWidth * 0.3,
        boxY + boxHeight * 0.3,
        0,
        boxX + boxWidth / 2,
        boxY + boxHeight / 2,
        boxWidth * 0.7
    );
    bubbleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    bubbleGradient.addColorStop(1, 'rgba(150, 200, 255, 0.4)');

    // Bolha
    ctx.fillStyle = bubbleGradient;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 5;

    ctx.beginPath();
    const borderRadius = 60;
    // Utiliza ctx.roundRect (disponível em navegadores modernos) ou recria-o
    if (ctx.roundRect) {
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, borderRadius);
    } else {
        // Fallback simples
        ctx.rect(boxX, boxY, boxWidth, boxHeight);
    }
    ctx.fill();
    ctx.stroke();

    // Texto
    ctx.fillStyle = 'black';
    lines.forEach((line, index) => {
        ctx.fillText(line.trim(), boxX + padding, boxY + padding + index * lineHeight);
    });

    ctx.restore();
}


// Botões

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
    const colorEnd = isActive ? 'rgba(0, 150, 0, 0.1)' : 'rgba(100, 100, 255, 0.3)';

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
        bolaButtonRect.x, bolaButtonRect.y, bolaButtonRect.r,
        'Bola', currentShape === 'bola'
    );

    drawBubbleButton(
        tshirtButtonRect.x, tshirtButtonRect.y, tshirtButtonRect.r,
        'T-shirt', currentShape === 'tshirt'
    );

    drawBubbleButton(
        phoneButtonRect.x, phoneButtonRect.y, phoneButtonRect.r,
        'Telemóvel', currentShape === 'phone'
    );

    drawBubbleButton(
        cupButtonRect.x, cupButtonRect.y, cupButtonRect.r,
        'Copo', currentShape === 'cup'
    );

    ctx.restore();
}


// Desenha o botão "Esvaziar"
function drawEmptyButton() {
    if (emptyButtonOpacity <= 0) return;

    ctx.save();

    const cx = emptyButtonRect.x;
    const cy = emptyButtonRect.y;
    const r = emptyButtonRect.r;

    // Aplica a opacidade e a transformação de escala
    ctx.globalAlpha = emptyButtonOpacity;
    ctx.translate(cx, cy);
    ctx.scale(emptyButtonScale, emptyButtonScale);
    ctx.translate(-cx, -cy);

    // Efeito de Pulso
    const pulse = Math.sin(Date.now() / 400) * 0.05 + 1;

    ctx.translate(cx, cy);
    ctx.scale(pulse, pulse);
    ctx.translate(-cx, -cy);

    // Gradiente de Aviso
    const bubbleGradient = ctx.createRadialGradient(
        cx - r * 0.3, cy - r * 0.3, r * 0.1,
        cx, cy, r
    );

    const colorStart = 'rgba(231, 76, 60, 0.7)';
    const colorEnd = 'rgba(192, 57, 43, 0.4)';

    bubbleGradient.addColorStop(0, colorStart);
    bubbleGradient.addColorStop(0.9, colorEnd);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = bubbleGradient;
    ctx.fill();

    ctx.strokeStyle = 'rgb(255, 150, 150)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Brilho
    ctx.beginPath();
    ctx.arc(cx - r * 0.3, cy - r * 0.4, r * 0.2, 0, Math.PI * 2);
    ctx.globalAlpha = 0.4 * emptyButtonOpacity;
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.globalAlpha = emptyButtonOpacity;

    // Texto
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 2;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ESVAZIAR', cx, cy);

    ctx.restore();
}

// Lógica da animação de aparecer/desaparecer
function updateEmptyButtonAnimation() {
    const hasWater = fillCounter > 0;
    const speed = 0.08;

    if (hasWater) {
        // Aparecer
        emptyButtonOpacity = Math.min(1.0, emptyButtonOpacity + speed);
        emptyButtonScale = Math.min(1.0, emptyButtonScale + speed);
    } else {
        // Desaparecer
        emptyButtonOpacity = Math.max(0.0, emptyButtonOpacity - speed);
        emptyButtonScale = Math.max(0.5, emptyButtonScale - speed);
    }
}


function draw() {
    // 1. Limpa o canvas e adiciona gradiente
    ctx.save();
    const gradientBackground = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradientBackground.addColorStop(0, `hsl(200, 80%, 20%)`);
    gradientBackground.addColorStop(0.5, `hsl(210, 70%, 30%)`);
    gradientBackground.addColorStop(1, `hsl(220, 60%, 10%)`);
    ctx.fillStyle = gradientBackground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();


    // 3. Desenha os animais
    seaCreatures.forEach(creature => {
        creature.update();
        creature.draw(ctx);
    });

    // 4. Determina qual ponteiro usar e se o preenchimento está ativo
    let activeX = mouseX;
    let activeY = mouseY;
    let isFingerDetected = false;

    // Prioridade: Dedo > Rato
    if (hands.length > 0) {
        activeX = fingerHitbox.x;
        activeY = fingerHitbox.y;
        isFingerDetected = true;
    }

    // Define a condição de preenchimento
    const isOverShape = checkPointInShapePath(activeX, activeY);

    const isFillingActive =
        // Preenchimento pelo dedo (ML5): Dedo detetado E está sobre a forma
        (isFingerDetected && isOverShape && fillCounter < TOTAL_FILL_STEPS) ||
        // Preenchimento pelo rato: Rato clicado E está sobre a forma
        (isMouseDown && isOverShape && fillCounter < TOTAL_FILL_STEPS);


    // 5. LÓGICA DE EMISSÃO DE GOTAS E DESENHO DO CURSOR ATIVO

    if (isFillingActive) {
        // Lógica de preenchimento
        const maxCapacity = totalCapacity[currentShape];
        const litersPerStep = maxCapacity / TOTAL_FILL_STEPS;
        totalLitersConsumed += litersPerStep * EMISSION_RATE;

        for (let i = 0; i < EMISSION_RATE; i++) {
            waterDrops.push(new Gota(activeX, activeY));
        }
    }

    // DESENHO DO CURSOR (Seja Dedo ou Rato)
    if (isFingerDetected || (isMouseDown && isOverShape)) {
        // Usa as coordenadas ativas (dedo ou rato)
        const cursorX = activeX;
        const cursorY = activeY;

        // Se for o dedo, desenha o cursor vermelho (emulador de dedo). Se for o rato, desenha verde claro
        ctx.fillStyle = isFingerDetected ? "white" : 'rgba(250,250,250,0.5)';  //midarrrr
        ctx.beginPath();
        ctx.arc(cursorX, cursorY, fingerHitbox.r * 1.5, 0, 2 * Math.PI);
        ctx.fill();
    }


    // Processa a queda e colisão das gotas
    for (let i = waterDrops.length - 1; i >= 0; i--) {
        const drop = waterDrops[i];

        const R = SHAPE_RADIUS;
        let shapeMaxHeight = maxWaterHeight;
        let shapeBottomY = centerY + R;

        // cálculo para a colisao
        if (currentShape === 'phone') {
            shapeMaxHeight = R * 2.5;
            shapeBottomY = centerY + R * 2.5 / 2;
        } else if (currentShape === 'cup') {
            shapeMaxHeight = R * 1.8;
            shapeBottomY = centerY + R * 1.0;
        }

        const waterHeight = (fillCounter / TOTAL_FILL_STEPS) * shapeMaxHeight;
        const currentWaterY = shapeBottomY - waterHeight;


        if (drop.y + drop.r >= currentWaterY && fillCounter < TOTAL_FILL_STEPS) {
            // Verifica se a gota colidiu dentro da forma (reutiliza checkPointInShapePath)
            if (checkPointInShapePath(drop.x, drop.y)) {
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

    // 6. Desenho da forma e água
    drawWaterLevel();

    ctx.save();
    if (currentShape === 'bola') {
        ctx.beginPath();
        ctx.arc(centerX, centerY, SHAPE_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.stroke();

        drawBolaPattern();

    }  else if (currentShape === 'tshirt') {
        drawTshirt();
    } else if (currentShape === 'phone') {
        drawPhone();
    } else if (currentShape === 'cup') {
        drawCup();
    }
    ctx.restore();

    // 7. Mascote
    if (mascotFish) {
        // Lógica de Hover Mascote: usa a posição ativa (dedo ou rato)
        const hoverX = activeX;
        const hoverY = activeY;

        const distance = Math.sqrt(
            Math.pow(hoverX - mascotFish.x, 2) + Math.pow(hoverY - mascotFish.y, 2)
        );
        isMascotHovered = distance <= mascotFish.hitboxR;

        mascotFish.draw();
        drawSpeechBubble();
    }

    // 8. Botões e texto
    drawButtons();
    drawInfoText();
    drawEmptyButton();


    // 9. DESENHA O MINI-VIEW DA CÂMARA NO CANTO SUPERIOR DIREITO
    if (video && isCameraLoaded) {
        const miniW = W / 6; // 1/5 da largura
        const miniH = H / 6; // 1/5 da altura
        const margin = 20;
        const startX = W - miniW - margin;
        const startY = margin;

        ctx.save();

        // CÂMARA MINIATURA (O desenho em si está espelhado)
        ctx.translate(startX + miniW, startY);
        ctx.scale(-1, 1);

        // Desenha o vídeo no mini-retângulo
        ctx.drawImage(video, 0, 0, miniW, miniH);

        ctx.restore();

        // ADICIONAR PONTEIRO NA MINIATURA:
        if (hands.length > 0) {

            // Mapeia as coordenadas do dedo (0 a W/H do ecrã) para as dimensões da miniatura
            const fingerMiniX = startX + (fingerHitbox.x / W) * miniW;
            const fingerMiniY = startY + (fingerHitbox.y / H) * miniH;

            ctx.fillStyle = 'red'; // Usa cor diferente para distinguir
            ctx.beginPath();
            ctx.arc(fingerMiniX, fingerMiniY, fingerHitbox.r * 0.5, 0, 2 * Math.PI); // Raio menor
            ctx.fill();
        }

        // Adiciona a borda
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 5;
        ctx.strokeRect(startX, startY, miniW, miniH);
    }
}

// --- FUNÇÕES ML5.js E CÂMARA ---

// Inicializa a webcam e retorna o elemento de vídeo
async function setupVideo() {
    // Cria um elemento de vídeo no DOM (mas escondido)
    video = document.createElement('video');
    video.id = 'webcamVideo';
    video.width = W;
    video.height = H;
    video.autoplay = true;
    video.playsinline = true;
    document.body.appendChild(video);
    video.style.display = 'none'; // Esconde o elemento de vídeo original

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: W, height: H } });
        video.srcObject = stream;
        await new Promise(resolve => video.onloadedmetadata = resolve); // Espera o carregamento dos metadados
        video.play();
        isCameraLoaded = true;
        return video;
    } catch (e) {
        console.error("Não foi possível aceder à câmara: ", e);
        isCameraLoaded = false;
        return null;
    }
}

// Callback do ML5: Recebe a posição da mão
function gotHands(results) {
    hands = results;

    if (hands.length > 0 && hands[0].index_finger_tip) {
        let indexFingerTip = hands[0].index_finger_tip;

        let mirroredX = W - indexFingerTip.x;

        // Aplica suavização
        fingerHitbox.x += (mirroredX - fingerHitbox.x) * fingerHitbox.smoothing;
        fingerHitbox.y += (indexFingerTip.y - fingerHitbox.y) * fingerHitbox.smoothing;
    }
}

// Inicialização do ML5 e do loop de animação.
async function initGame() {
    canvas = document.getElementById('bolaCanvas');
    if (!canvas) {
        console.error("ERRO GRAVE: Elemento Canvas ('bolaCanvas') não encontrado! O jogo não pode iniciar.");
        return;
    }
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("ERRO GRAVE: Não foi possível obter o contexto 2D do Canvas. O jogo não pode iniciar.");
        return;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // --- ADIÇÃO DOS EVENTOS DO RATO ---
    // Move o ponteiro do rato
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    // Ativa o flag de clique para o preenchimento
    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
    });

    // Desativa o flag de clique
    canvas.addEventListener('mouseup', (e) => {
        isMouseDown = false;
    });
    // --- FIM DA ADIÇÃO DOS EVENTOS DO RATO ---


    // Inicia a câmara e espera
    video = await setupVideo();

    if (isCameraLoaded) {
        console.log("A carregar modelo HandPose...");
        handpose = await ml5.handPose({ flipped: false });
        await handpose.detectStart(video, gotHands);
        console.log("Deteção de mãos iniciada.");
    }

    // Adicionar listener para o clique (para os botões de UI)
    canvas.addEventListener('click', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (isClickInCircle(x, y, bolaButtonRect)) {
            selectShape('bola');
        }  else if (isClickInCircle(x, y, tshirtButtonRect)) {
            selectShape('tshirt');
        } else if (isClickInCircle(x, y, phoneButtonRect)) {
            selectShape('phone');
        } else if (isClickInCircle(x, y, cupButtonRect)) {
            selectShape('cup');
        }
        else if (isClickInCircle(x, y, emptyButtonRect) && fillCounter > 0) {
            fillCounter = 0;
            waterDrops.length = 0;
            return;
        }
    });

    animate();
}

// --- FUNÇÕES DE UTILIDADE ---

function getShapePath() {
    const R = SHAPE_RADIUS;
    const C = { x: centerX, y: centerY };

    ctx.beginPath();

    if (currentShape === 'bola') {
        ctx.arc(centerX, centerY, SHAPE_RADIUS, 0, Math.PI * 2);
    } else if (currentShape === 'tshirt') {
        const neckTopY = C.y - R * 1.0;
        const shoulderOutX = C.x + R * 1.1;
        const sleeveY = C.y - R * 0.3;
        const armpitY = C.y + R * 0.1;
        const bottomY = C.y + R * 1.0;
        const bodyWidth = R * 1.8;

        ctx.lineTo(shoulderOutX, neckTopY);
        ctx.lineTo(shoulderOutX + R * 0.3, sleeveY);
        ctx.lineTo(C.x + R * 0.9, armpitY);
        ctx.lineTo(C.x + bodyWidth / 2, bottomY);
        ctx.lineTo(C.x - bodyWidth / 2, bottomY);
        ctx.lineTo(C.x - R * 0.9, armpitY);
        ctx.lineTo(C.x - R * 1.1 - R * 0.3, sleeveY);
        ctx.lineTo(C.x - R * 1.1, neckTopY);
        ctx.arc(C.x, neckTopY, R * 0.25, Math.PI, 0);
        ctx.closePath();
    } else if (currentShape === 'phone') {
        const width = R * 1.5;
        const height = R * 2.5;
        const borderRadius = R * 0.2;
        const x = C.x - width / 2;
        const y = C.y - height / 2;

        ctx.moveTo(x + borderRadius, y);
        ctx.lineTo(x + width - borderRadius, y);
        ctx.arcTo(x + width, y, x + width, y + borderRadius, borderRadius);
        ctx.lineTo(x + width, y + height - borderRadius);
        ctx.arcTo(x + width, y + height, x + width - borderRadius, y + height, borderRadius);
        ctx.lineTo(x + borderRadius, y + height);
        ctx.arcTo(x, y + height, x, y + height - borderRadius, borderRadius);
        ctx.lineTo(x, y + borderRadius);
        ctx.arcTo(x, y, x + borderRadius, y, borderRadius);
        ctx.closePath();
    } else if (currentShape === 'cup') {
        const topY = C.y - R * 0.8;
        const bottomY = C.y + R * 1.0;
        const topWidth = R * 1.0;
        const bottomWidth = R * 0.8;

        ctx.moveTo(C.x - topWidth / 2.5, topY);
        ctx.lineTo(C.x + topWidth / 1.5, topY);
        ctx.lineTo(C.x + bottomWidth / 1.19, bottomY);
        ctx.lineTo(C.x - bottomWidth / 2.5, bottomY);
        ctx.closePath();
    }
}

// Colisão: Verifica se o ponto está dentro da área da forma
function checkFingerInShape(x, y) {
    getShapePath();
    return ctx.isPointInPath(x, y);
}

function checkPointInShapePath(x, y) {
    getShapePath();
    return ctx.isPointInPath(x, y);
}

function selectShape(shape) {
    currentShape = shape;
    fillCounter = 0;
    waterDrops.length = 0;
}

function isClickInCircle(x, y, circle) {
    const distance = Math.sqrt(Math.pow(x - circle.x, 2) + Math.pow(y - circle.y, 2));
    return distance <= circle.r;
}


// Loop de animação
function animate() {
    draw();
    updateEmptyButtonAnimation();
    requestAnimationFrame(animate);
}

// --- LÓGICA DO SPLASH SCREEN ---

function initSplash() {
    const splashScreenElement = document.getElementById('splash-screen');
    if (!splashScreenElement) {
        initGame();
        return;
    }

    splashCanvas = document.createElement('canvas');
    splashCanvas.id = 'splashCanvas';
    splashScreenElement.prepend(splashCanvas);

    splashCtx = splashCanvas.getContext('2d');
    resizeSplashCanvas();
    window.addEventListener('resize', resizeSplashCanvas);

    for (let i = 0; i < NUM_BUBBLES; i++) {
        bubbles.push(new Bubble(splashCanvas.width, splashCanvas.height));
    }

    animateSplash();
}

function resizeSplashCanvas() {
    if (!splashCanvas) return;
    splashCanvas.width = window.innerWidth;
    splashCanvas.height = window.innerHeight;

    bubbles.forEach(bubble => {
        bubble.w = splashCanvas.width;
        bubble.h = splashCanvas.height;
    });
}

function animateSplash() {
    if (!splashCtx) return;

    const gradientBackground = splashCtx.createLinearGradient(0, 0, 0, splashCanvas.height);
    gradientBackground.addColorStop(0, `hsl(200, 80%, 20%)`);
    gradientBackground.addColorStop(0.5, `hsl(210, 70%, 30%)`);
    gradientBackground.addColorStop(1, `hsl(220, 60%, 10%)`);
    splashCtx.globalAlpha = 1.0;
    splashCtx.fillStyle = gradientBackground;
    splashCtx.fillRect(0, 0, splashCanvas.width, splashCanvas.height);

    bubbles.forEach(bubble => {
        bubble.update();
        bubble.draw(splashCtx);
    });

    const splash = document.getElementById('splash-screen');
    if (splash && splash.classList.contains('visible')) {
        requestAnimationFrame(animateSplash);
    } else {
        splashCanvas.remove();
        window.removeEventListener('resize', resizeSplashCanvas);
        initGame();
    }
}


window.addEventListener('load', initSplash);