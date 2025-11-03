// Inicialização do canvas e contexto de desenho
const canvas = document.getElementById('ballCanvas');
const ctx = canvas.getContext('2d');

// Elementos da interface
const bottleButton = document.getElementById('bottleButton');
const shirtButton = document.getElementById('shirtButton');

// Configurações de posicionamento e tamanho
const centerX = canvas.width / 2;  // Centro X do canvas
const centerY = canvas.height / 2;  // Centro Y do canvas
const radius = 80;  // Raio da bola e tamanho base das calças

// Variáveis para controle do nível de água
let waterLevel = 0;  // Nível atual da água (0 a maxWaterLevel)
const maxWaterLevel = radius * 2;  // Nível máximo que a água pode atingir
let targetWaterLevel = 0;  // Nível alvo para animação
const fillTimeInSeconds = 5;  // Tempo total desejado para preencher (em segundos)
let currentShape = 'ball';  // Forma atual selecionada ('ball' ou 'pants')

// Capacidade máxima de água para cada forma em litros
const capacities = {
    ball: 3,    // Bola comporta 3 litros
    pants: 7    // Calças comportam 7 litros
};

// Função para desenhar as calças
function drawPants() {
    ctx.save();  // Salva o estado atual do contexto
    
    // Desenha o formato das calças
    ctx.beginPath();
    // Cintura das calças
    ctx.moveTo(centerX - radius, centerY - radius);
    ctx.lineTo(centerX + radius, centerY - radius);
    // Perna direita
    ctx.lineTo(centerX + radius, centerY + radius);
    // Região central (entre as pernas)
    ctx.lineTo(centerX, centerY);
    // Perna esquerda
    ctx.lineTo(centerX - radius, centerY + radius);
    ctx.closePath();
    
    // Define a cor e desenha o contorno
    ctx.strokeStyle = '#000';
    ctx.stroke();
}

// Função principal de desenho - chamada a cada frame
function drawBall() {
    // Limpa todo o canvas para redesenhar
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Salva o estado do contexto para restaurar depois
    ctx.save();

    if (currentShape === 'ball') {
        // Desenha o círculo exterior (bola)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#000';
        ctx.stroke();
    } else {
        // Desenha as calças se não for bola
        drawPants();
    }

    // Desenho da água
    if (waterLevel > 0) {
        if (currentShape === 'ball') {
            // Define a área de recorte para a bola
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.clip();
        } else {
            // Define a área de recorte para as calças
            ctx.beginPath();
            ctx.moveTo(centerX - radius, centerY - radius);
            ctx.lineTo(centerX + radius, centerY - radius);
            ctx.lineTo(centerX + radius, centerY + radius);
            ctx.lineTo(centerX, centerY);
            ctx.lineTo(centerX - radius, centerY + radius);
            ctx.closePath();
            ctx.clip();
        }

        // Calcula a altura da água baseado no nível atual
        const waterHeight = (waterLevel / maxWaterLevel) * (radius * 2);
        const waterY = centerY + radius - waterHeight;

        // Desenha o retângulo base da água
        ctx.beginPath();
        ctx.rect(centerX - radius, waterY, radius * 2, waterHeight);
        
        // Cria gradiente para efeito de água
        const gradient = ctx.createLinearGradient(0, centerY - radius, 0, centerY + radius);
        gradient.addColorStop(0, 'rgba(0, 150, 255, 0.4)');  // Água mais clara no topo
        gradient.addColorStop(1, 'rgba(0, 100, 255, 0.6)');  // Água mais escura embaixo
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Adiciona efeito de onda na superfície da água
        ctx.beginPath();
        ctx.moveTo(centerX - radius, waterY);
        for (let x = centerX - radius; x <= centerX + radius; x += 5) {
            // Cria movimento de onda usando seno
            const wave = Math.sin((x + Date.now() / 300) / 10) * 2;
            ctx.lineTo(x, waterY + wave);
        }
        ctx.lineTo(centerX + radius, waterY);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Reset clip
        ctx.restore();

        // Animate water level
        if (waterLevel < targetWaterLevel) {
            // Calcula a velocidade com base na capacidade do recipiente
            const maxCapacity = capacities[currentShape];
            // Ajusta a velocidade para manter o tempo de preenchimento constante
            const fillSpeed = (maxWaterLevel / (fillTimeInSeconds * 60)) * (maxCapacity / 3);
            
            // Atualiza o nível da água
            waterLevel = Math.min(waterLevel + fillSpeed, targetWaterLevel);
            
            // Atualiza o display com as informações da água
            const currentLiters = (waterLevel / maxWaterLevel) * maxCapacity;
            document.getElementById('waterInfo').textContent = 
                `${currentLiters.toFixed(1)} L / ${maxCapacity} L`;
        }
    }
}

// Função para verificar se um clique está dentro da forma selecionada
function isClickInShape(x, y) {
    if (currentShape === 'ball') {
        // Para a bola: calcula a distância do clique até o centro
        // Se a distância for menor que o raio, o clique foi dentro da bola
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        return distance <= radius;
    } else {
        // Para as calças: usa o método isPointInPath para verificar se o clique
        // está dentro do caminho definido pelas calças
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

// Evento de clique no canvas
canvas.addEventListener('click', function(event) {
    // Obtém a posição do clique relativa ao canvas
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Verifica se o clique foi dentro da forma
    if (isClickInShape(x, y)) {
        // Define o nível alvo de água para o máximo
        targetWaterLevel = maxWaterLevel;
    }
});

// Manipulador de evento para o botão da bola
ballButton.addEventListener('click', function() {
    // Muda para a forma da bola
    currentShape = 'ball';
    // Reinicia os níveis de água
    waterLevel = 0;
    targetWaterLevel = 0;
    // Atualiza o display com a capacidade da bola
    document.getElementById('waterInfo').textContent = `0.0 L / ${capacities.ball} L`;
    // Atualiza os estilos dos botões
    ballButton.classList.add('active');
    pantsButton.classList.remove('active');
});

// Manipulador de evento para o botão das calças
pantsButton.addEventListener('click', function() {
    // Muda para a forma das calças
    currentShape = 'pants';
    // Reinicia os níveis de água
    waterLevel = 0;
    targetWaterLevel = 0;
    // Atualiza o display com a capacidade das calças
    document.getElementById('waterInfo').textContent = `0.0 L / ${capacities.pants} L`;
    // Atualiza os estilos dos botões
    pantsButton.classList.add('active');
    ballButton.classList.remove('active');
});

// Inicia a animação
function animate() {
    drawBall();
    requestAnimationFrame(animate);
}

// Começa a animação
animate();