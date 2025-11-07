// Inicialização do canvas e contexto de desenho
const canvas = document.getElementById('ballCanvas');
const ctx = canvas.getContext('2d');

// Ajusta o tamanho do canvas para a janela
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Reajusta o centro e posições UI após resize
    centerX = canvas.width / 2;
    centerY = (canvas.height - shapeOffsetY) / 2 + shapeOffsetY;
    ballButtonRect.x = canvas.width / 2 - buttonWidth - buttonMargin / 2;
    pantsButtonRect.x = canvas.width / 2 + buttonMargin / 2;
    // Reinicializa os animais (limpa o array antes de recriar)
    seaCreatures.length = 0; 
    initSeaCreatures(); 
}
window.addEventListener('resize', resizeCanvas);

// --- Configuração dos Botões e Texto no Canvas ---
const buttonWidth = 100;
const buttonHeight = 40;
const buttonMargin = 10;
const uiYPosition = 15; // Posição Y para os botões

// Variáveis para as posições dos elementos da UI (serão atualizadas no resize)
let ballButtonRect = {
    x: 0, y: uiYPosition, width: buttonWidth, height: buttonHeight
};
let pantsButtonRect = {
    x: 0, y: uiYPosition, width: buttonWidth, height: buttonHeight
};
let infoTextY = uiYPosition + buttonHeight + 25; 

const shapeOffsetY = 100; // Espaço para a UI no topo

// Configurações de posicionamento e tamanho (globais e ajustadas no resize)
let centerX, centerY;
const radius = 80;

// Variáveis para controle do nível de água
let waterLevel = 0;
const maxWaterLevel = radius * 2;
let targetWaterLevel = 0;
const fillSpeed = 1;
let currentShape = 'ball';

const capacities = {
    ball: 3000,
    pants: 10000
};

// --- Animações de Fundo Marinho (Peixes, Medusas, Arraias) ---
const seaCreatures = [];
const numFish = 10;
const numJellyfish = 5;
const numRay = 2;

// Classe base para criaturas marinhas
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

    // Método para desenhar (CORRIGIDO)
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.direction === -1) {
            ctx.scale(-1, 1); // Vira horizontalmente se estiver indo para a esquerda
        }
        // O ctx.restore() será chamado pela subclasse
    }

    update() {
        this.x += this.speed * this.direction;

        // Reinicia a criatura se sair da tela
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
    constructor(x, y, size, speed, color, direction) {
        super(x, y, size, speed, color, 'fish', direction);
    }

    // Desenho do peixe (CORRIGIDO)
    draw() {
        super.draw(); // Chama save, translate, scale

        // Desenha o peixe sempre virado para a direita (X positivo)
        // O super.draw() cuida de virar o canvas (scale) se a direção for -1
        
        ctx.fillStyle = this.color;
        ctx.strokeStyle = `rgba(0,0,0,0.3)`;
        ctx.lineWidth = 1;

        // Corpo
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cauda
        ctx.beginPath();
        ctx.moveTo(-this.size, 0); // Começa na parte de trás do corpo
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

        ctx.restore(); // Restaura o save() do super.draw()
    }

    update() {
        super.update();
        // Movimento de ondulação suave
        this.y = this.baseY + Math.sin(this.oscillation + Date.now() / 500) * this.size * 0.3;
    }
}

class Jellyfish extends SeaCreature {
    constructor(x, y, size, speed, color, direction) {
        super(x, y, size, speed, color, 'jellyfish', direction);
        this.speed = speed * 0.5; // Medusas são mais lentas
    }

    // Desenho da medusa (Estava correto, pois não usava super.draw())
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        ctx.fillStyle = this.color;
        ctx.strokeStyle = `rgba(0,0,0,0.2)`;
        ctx.lineWidth = 2;

        // Sino (corpo) da medusa
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI, true); // Metade superior
        //ctx.bezierCurveTo(this.size, this.size * 1.5, -this.size, this.size * 1.5, -this.size, 0); // Curva inferior
        //ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Tentáculos
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(-15 + i*7.5, 0);
            const time = Date.now() / 200 + i * 0.5;
            ctx.bezierCurveTo(
                this.size * 0.3 * Math.sin(time), this.size * (1 + i * 0.2),
                -this.size * 0.3 * Math.cos(time), this.size * (1.5 + i * 0.2),
                -15 + i*7.5, this.size * (2)
            );
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();
    }

    update() {
        this.x += this.speed * this.direction;
        this.y = this.baseY + Math.sin(this.oscillation + Date.now() / 700) * this.size * 0.5; // Flutuação vertical

        if (this.direction === 1 && this.x > canvas.width + this.size * 3) {
            this.x = -this.size * 3;
            this.y = Math.random() * canvas.height;
            this.baseY = this.y;
        } else if (this.direction === -1 && this.x < -this.size * 3) {
            this.x = canvas.width + this.size * 3;
            this.y = Math.random() * canvas.height;
            this.baseY = this.y;
        }
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
        
        const flap = Math.sin(Date.now() / 150 + this.oscillation) * this.size * 0.1; // Batida das asas
        
        ctx.fillStyle = this.color;
        ctx.strokeStyle = `rgba(0,0,0,0.2)`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        // Corpo central
        ctx.ellipse(0, 0, this.size , this.size * 0.8, 0, 0, Math.PI * 2);
        
        // Asas
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(this.size * 0, -this.size * 1.5 - flap, this.size * 1.8, 0); // Asa direita
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(this.size * 0, this.size * 1.5 + flap, this.size * 1.8, 0); // Asa direita
        
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-this.size * 0, -this.size * 1.5 - flap, -this.size * 1.8, 0); // Asa esquerda
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-this.size * 0, this.size * 1.5 + flap, -this.size * 1.8, 0); // Asa esquerda

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
    for (let i = 0; i < numFish; i++) {
        seaCreatures.push(new Fish(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 15 + 10, // Tamanho
            Math.random() * 1 + 0.5, // Velocidade
            `hsl(${Math.random() * 60 + 180}, 70%, 70%)`, // Tons de azul/verde
            Math.random() > 0.5 ? 1 : -1
        ));
    }
    for (let i = 0; i < numJellyfish; i++) {
        seaCreatures.push(new Jellyfish(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 15 + 10,
            Math.random() * 0.5 + 0.2,
            `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.2})`, // Branco/transparente
            Math.random() > 0.5 ? 1 : -1
        ));
    }
    for (let i = 0; i < numRay; i++) {
        seaCreatures.push(new Ray(
            Math.random() * canvas.width,
            canvas.height * 0.8 + Math.random() * canvas.height * 0.2, // Arraias mais perto do fundo
            Math.random() * 25 + 15,
            Math.random() * 0.8 + 0.3,
            `rgb(80, 80, 90)`, // Cinza escuro
            Math.random() > 0.5 ? 1 : -1
        ));
    }
}


// --- Funções de Desenho Auxiliares ---

function drawPants() {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY - radius);
    ctx.lineTo(centerX + radius, centerY - radius);
    ctx.lineTo(centerX + radius, centerY + radius);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(centerX - radius, centerY + radius);
    ctx.closePath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2; // Linha mais grossa para destacar do fundo
    ctx.stroke();
    ctx.restore();
}

function drawButtons() {
    ctx.save();
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillStyle = (currentShape === 'ball') ? '#45a049' : '#e0e0e0';
    ctx.fillRect(ballButtonRect.x, ballButtonRect.y, ballButtonRect.width, ballButtonRect.height);
    ctx.fillStyle = (currentShape === 'ball') ? 'white' : 'black';
    ctx.fillText('Bola', ballButtonRect.x + ballButtonRect.width / 2, ballButtonRect.y + ballButtonRect.height / 2);

    ctx.fillStyle = (currentShape === 'pants') ? '#45a049' : '#e0e0e0';
    ctx.fillRect(pantsButtonRect.x, pantsButtonRect.y, pantsButtonRect.width, pantsButtonRect.height);
    ctx.fillStyle = (currentShape === 'pants') ? 'white' : 'black';
    ctx.fillText('Calças', pantsButtonRect.x + pantsButtonRect.width / 2, pantsButtonRect.y + pantsButtonRect.height / 2);
    
    ctx.restore();
}

function drawInfoText() {
    ctx.save();
    const maxCapacity = capacities[currentShape];
    const currentLiters = (waterLevel / maxWaterLevel) * maxCapacity;
    const text = `${currentLiters.toFixed(1)} L / ${maxCapacity} L`;

    ctx.font = '18px Arial';
    // Cor do texto com sombra para legibilidade
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.textAlign = 'center';
    ctx.fillText(text, centerX, infoTextY);
    
    ctx.restore();
}

// Função principal de desenho
function draw() {
    // 1. Limpa o canvas com um gradiente de fundo marinho
    ctx.save();
    const gradientBackground = ctx.createLinearGradient(0, 0, 0, canvas.height);
    const timeFactor = (Date.now() / 20000) % 1;

    gradientBackground.addColorStop(0, `hsl(${200 + timeFactor * 10}, 80%, 20%)`); // Azul escuro (superfície)
    gradientBackground.addColorStop(0.5, `hsl(${210 + timeFactor * 10}, 70%, 30%)`);
    gradientBackground.addColorStop(1, `hsl(${220 + timeFactor * 10}, 60%, 10%)`); // Mais escuro (fundo)
    
    ctx.fillStyle = gradientBackground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // 2. Desenha e atualiza os animais marinhos
    seaCreatures.forEach(creature => {
        creature.update();
        creature.draw();
    });
    
    // 3. Desenha a UI (Botões e Texto)
    drawButtons();
    drawInfoText();

    // 4. Salva o estado do contexto para as formas
    ctx.save();

    // 5. Desenha a forma principal (Bola ou Calças)
    if (currentShape === 'ball') {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFF'; // Contorno branco para destacar
        ctx.lineWidth = 2;
        ctx.stroke();
    } else {
        drawPants();
    }

    // 6. Desenho da água (com recorte)
    if (waterLevel > 0) {
        ctx.beginPath();
        if (currentShape === 'ball') {
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        } else {
            ctx.moveTo(centerX - radius, centerY - radius);
            ctx.lineTo(centerX + radius, centerY - radius);
            ctx.lineTo(centerX + radius, centerY + radius);
            ctx.lineTo(centerX, centerY);
            ctx.lineTo(centerX - radius, centerY + radius);
            ctx.closePath();
        }
        ctx.clip(); 

        const waterHeight = (waterLevel / maxWaterLevel) * (radius * 2);
        const waterY = centerY + radius - waterHeight;

        ctx.beginPath();
        ctx.rect(centerX - radius, waterY, radius * 2, waterHeight);
        
        const gradient = ctx.createLinearGradient(0, centerY - radius, 0, centerY + radius);
        gradient.addColorStop(0, 'rgba(0, 150, 255, 0.6)'); // Mais opaco
        gradient.addColorStop(1, 'rgba(0, 100, 255, 0.8)');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(centerX - radius, waterY);
        for (let x = centerX - radius; x <= centerX + radius; x += 5) {
            const wave = Math.sin((x + Date.now() / 300) / 10) * 2;
            ctx.lineTo(x, waterY + wave);
        }
        ctx.lineTo(centerX + radius, waterY);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    
    ctx.restore(); // Remove o clip

    // 7. Lógica de Animação da Água
    if (waterLevel < targetWaterLevel) {
        waterLevel = Math.min(waterLevel + fillSpeed, targetWaterLevel);
    }
}

// --- Funções de Lógica de Clique ---

function isClickInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
}

function isClickInShape(x, y) {
    if (currentShape === 'ball') {
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        return distance <= radius;
    } else {
        // Precisa recriar o caminho para o isPointInPath funcionar fora do loop de desenho
        ctx.beginPath();
        ctx.moveTo(centerX - radius, centerY - radius);
        ctx.lineTo(centerX + radius, centerY - radius);
        ctx.lineTo(centerX + radius, centerY + radius);
        ctx.lineTo(centerX, centerY);
        ctx.lineTo(centerX - radius, centerY + radius);
        ctx.closePath();
        return ctx.isPointInPath(x, y);
    }
}

function selectBall() {
    currentShape = 'ball';
    waterLevel = 0;
    targetWaterLevel = 0;
}

function selectPants() {
    currentShape = 'pants';
    waterLevel = 0;
    targetWaterLevel = 0;
}


canvas.addEventListener('click', function(event) {
    // Precisamos de getBoundingClientRect() para garantir a precisão
    // em diferentes tamanhos de tela e níveis de zoom.
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isClickInRect(x, y, ballButtonRect)) {
        selectBall();
    } else if (isClickInRect(x, y, pantsButtonRect)) {
        selectPants();
    }
    else if (isClickInShape(x, y)) {
        targetWaterLevel = maxWaterLevel;
    }
});

// --- Loop de Animação ---
function animate() {
    draw();
    requestAnimationFrame(animate);
}

// Inicia tudo
resizeCanvas(); // Chama no início para definir o tamanho
animate();