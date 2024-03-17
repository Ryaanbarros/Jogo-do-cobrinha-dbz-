const snd_mastigar = './snd/mastigar.mp3';
const img_fundo = new Image();
img_fundo.src = './img/kamisama.png';
const canvas = document.getElementById('canvas');  // área de desenho
const ctx = canvas.getContext('2d');
const esfera = new Image();
esfera.src = './img/esfera_dragao.png';
const esferaTitulo = new Image();
esferaTitulo.src = './img/esfera.png';
const nuvemGoku = new Image();
nuvemGoku.src = './img/nuvem.png'; // Caminho para a imagem da nuvem do Goku

let nuvemPosicaoX = canvas.width / 2 + 574; // Posição inicial da nuvem
let nuvemPosicaoY = 420; // Posição vertical fixa da nuvem

let backgroundMusic = document.getElementById('backgroundMusic');
backgroundMusic.addEventListener('ended', function() {
    this.currentTime = 0; // Reinicia a música para o início
    this.play(); // Inicia a reprodução novamente
})
backgroundMusic.play();

document.getElementById('portfolioLink').addEventListener('click', function() {
    window.location.href = 'https://ryaanbarros.com.br';
});

let alim = {
    x: 0,  // posição x
    y: 0,  // posição y
    raio: 0,  // raio do círculo que representa o alimento
    ativo: false
};

let inicio = {
    desl: 0,  // deslocamento em x da tela de início
    sx: 1  // sentido do balanço da tela de início
};

let jogo = {
    fase: 0,  // fase atual de jogo (0: tela inicial; 1: jogando)
};

let snake = {
    corpo: [{x: 100, y: canvas.height / 2}],
    sx: 1,  // sentido horizontal (-1: esqueda e 1: direita)
    sy: 0,  // sentido vertical (-1: sobe e 1: desce)
    tam: 1,  // tamanho do corpo
    aum: 100,  // aumento gerado pelo alimento
    vel: 1,  // o aumento na velocidade
    lingua: false,
    linguaFora: false,
    linguaMovimento: 0
};

// Ajusta o tamanho do canvas de acordo com o tamanho da janela do navegador
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Redefine a posição inicial da cobra e do alimento para se ajustar ao novo tamanho do canvas
snake.corpo[0].x = canvas.width / 2;
snake.corpo[0].y = canvas.height / 2;

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Redefine a posição inicial da cobra e do alimento para se ajustar ao novo tamanho do canvas
    snake.corpo[0].x = canvas.width / 2;
    snake.corpo[0].y = canvas.height / 2;
});

window.addEventListener('keydown', teclado);
function teclado(ptecla) {
    if (ptecla.key == 'Enter' && jogo.fase == 0) {
        jogo.fase = 1;  // 1 indica jogando
        iniciar_variaveis_jogo();
        backgroundMusic.play();
    } else if (ptecla.key == 'Escape') {
        jogo.fase = 0;  // 0 indica tela inicial
        iniciar_variaveis_jogo();
    }
    if (jogo.fase == 1) {
        if (ptecla.key == 'ArrowLeft' && snake.sx != 1) {
            snake.sx = -1;
            snake.sy = 0;
        } else if (ptecla.key == 'ArrowRight' && snake.sx != -1) {
            snake.sx = 1;
            snake.sy = 0;
        } else if (ptecla.key == 'ArrowUp'  && snake.sy != 1) {
            snake.sx = 0;
            snake.sy = -1;
        } else if (ptecla.key == 'ArrowDown' && snake.sy != -1) {
            snake.sx = 0;
            snake.sy = 1;
        }
    }
}

function gameloop(ptemp) {
    if (jogo.fase == 0) {
        atualizar_inicio();
        desenhar_inicio(); 
    } else {
        atualizar_jogo();
        desenhar_jogo();    
    }
    window.requestAnimationFrame(gameloop);  // agenda próxima chamada de gameloop
}
let recarregandoPagina = false; // Variável para controlar se a página está sendo recarregada

window.addEventListener('beforeunload', function(event) {
    // Define recarregandoPagina como true quando a página está sendo recarregada
    recarregandoPagina = true;
});

function verificarColisaoCorpo() {
    // Verifica se a cabeça da cobra colidiu com alguma parte do corpo
    for (let i = 1; i < snake.tam; i++) {
        if (snake.corpo[0].x === snake.corpo[i].x && snake.corpo[0].y === snake.corpo[i].y) {
            return true; // Colisão detectada
        }
    }
    return false; // Nenhuma colisão detectada
}

function atualizar_jogo() {
    // IA e atualização das variáveis de jogo
    // aumentar o tamanho da snake
    if (snake.aum > 0) {
        snake.aum -= 1;
        snake.tam += 1;
        snake.corpo.push({x: 0, y: 0})
    }
    
    // movimentar corpo da snake
    for (let i = snake.tam - 1; i > 0; i--) {
        snake.corpo[i].x = snake.corpo[i - 1].x;  // x
        snake.corpo[i].y = snake.corpo[i - 1].y;  // y
    }

    if (snake.corpo[0].y > canvas.height) {
        snake.corpo[0].y = 0;  // Aparece na parte superior da tela
    } else if (snake.corpo[0].y < 0) {
        snake.corpo[0].y = canvas.height;  // Aparece na parte inferior da tela
    }

    // movimentar cabeça da snake
    snake.corpo[0].x += snake.sx * 5 * snake.vel;  // x
    snake.corpo[0].y += snake.sy * 5 * snake.vel;  // y

    // passagens laterais
    if (snake.corpo[0].x > canvas.width + 15) {
        snake.corpo[0].x = -15;
    } else if (snake.corpo[0].x < -15) {
        snake.corpo[0].x = canvas.width + 15;
    }

    // gerar alimento
    if (alim.ativo == false) {
        gerar_alim();
    }
    // aumentar o tamanho do alimento gradualmente
    if (alim.raio < 12) {
        alim.raio += 0.1;
        if (alim.raio > 12) {
            alim.raio = 12;
        }
    }

    // verifica colisão da snake (cabeça) com o alimento
    if (alim.ativo == true && 
        snake.corpo[0].x > alim.x - 14 && snake.corpo[0].x < alim.x + 14 && 
        snake.corpo[0].y > alim.y - 14 && snake.corpo[0].y < alim.y + 14) {
        som(snd_mastigar, 0.8, 1.4);
        snake.lingua = true;
        alim.ativo = false;
        snake.aum = Math.floor(Math.random() * 20 + 1);
        if (snake.vel < 2) {  // no máximo 100% de aumento
            snake.vel += 0.05;  // 5% de aumento na velocidade
        }
        iniciarMovimentoLingua()
    }

    // colisão com o corpo
    
    if (verificarColisaoCorpo()) {
        // Verifica se a página está sendo recarregada, se sim, não exibe a mensagem
        if (!recarregandoPagina) {
            backgroundMusic.pause(); // Pausar música de fundo
            // Exibir mensagem
            alert("Você perdeu :(");
            const tentarNovamente = confirm("Tentar novamente?");
            if (tentarNovamente) {
                iniciar_variaveis_jogo(); // Reiniciar o jogo
                backgroundMusic.play(); // Retomar a música de fundo
            } else {
                // Voltar para o menu principal
                jogo.fase = 0;
                iniciar_variaveis_jogo();
            }
            return; // Parar o loop de atualização do jogo
        }
    }
}
// Reinicializa a variável recarregandoPagina quando o jogo é reiniciado
function iniciar_variaveis_jogo() {
    recarregandoPagina = false;
    // Restante do código...
}

// Verifica se a página está sendo recarregada ou se é um novo jogo
window.onload = function() {
    iniciar_variaveis_jogo();
};


function desenhar_jogo() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img_fundo, 0, 0);
    ctx.save(); //daqui
    ctx.beginPath();
    ctx.arc(alim.x, alim.y, alim.raio, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();// até aqui estou recortando a esfera do dragao, ou seja, se chama mascara de recorte
    if (snake.lingua){
      // Movimento da "linguinha" entrando e saindo
      if (snake.linguaFora) {
        snake.linguaMovimento += 0.1;
        if (snake.linguaMovimento >= 1) {
            snake.linguaFora = false;
        }
    } else {
        snake.linguaMovimento -= 0.1;
        if (snake.linguaMovimento <= 0) {
            snake.lingua = false;
        }
    }
    

    // Desenhar a "linguinha" com base no movimento
    let linguaPos = snake.linguaFora ? 20 * snake.linguaMovimento : 20 * (1 - snake.linguaMovimento);
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(snake.corpo[0].x + snake.sx * linguaPos, snake.corpo[0].y + snake.sy * linguaPos, 5, 0, 2 * Math.PI);
    ctx.fill();
}

    // desenhar alimento
    if (alim.ativo) {
        ctx.drawImage(esfera, alim.x - alim.raio, alim.y - alim.raio, alim.raio * 2, alim.raio * 2);
    }
    ctx.restore(); // recorta a esfera do dragao
    // desenhar sombra
    ctx.fillStyle = '#0007';
    for (let c of snake.corpo) {
        ctx.beginPath();
        ctx.arc(c.x + 6, c.y + 6, 15, 0, 2 * Math.PI);
        ctx.fill();
    }
    // desenhar snake
    ctx.fillStyle = 'cyan';
    for (let c of snake.corpo) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 15, 0, 2 * Math.PI);
        ctx.fill();
    }

    // desenhar olhos
    if (snake.sy == 0) { // movimento horizontal
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(snake.corpo[0].x + snake.sx * 6, snake.corpo[0].y - 3, 4, 0, 2 * Math.PI);
        ctx.fill();
    } else {  // movimento vertical
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(snake.corpo[0].x - 6, snake.corpo[0].y + snake.sy * 5, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.arc(snake.corpo[0].x + 6, snake.corpo[0].y + snake.sy * 5, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
}
function iniciarMovimentoLingua() {
    snake.lingua = true;
    snake.linguaFora = true;
}
function atualizar_inicio() {
    atualizar_jogo();
    // Movimento da nuvem voadora do Goku
    nuvemPosicaoX += 0.7 * inicio.sx;

    // Verifica se a nuvem atingiu os limites da tela
    if (nuvemPosicaoX > canvas.width + 100) {
        nuvemPosicaoX = -100; // Reposiciona a nuvem para a esquerda
    } else if (nuvemPosicaoX < -100) {
        nuvemPosicaoX = canvas.width + 100; // Reposiciona a nuvem para a direita
    }
    // evita ultrapassar os limites da tela
    if (snake.corpo[0].x < 25 || snake.corpo[0].x > 1075) {  
        snake.corpo[0].x += -snake.sx * 5;
        snake.sx = 0;
        snake.corpo[0].y < canvas.height / 2 ? snake.sy = 1 : snake.sy = -1;
    } else if (snake.corpo[0].y < 25 || snake.corpo[0].y > 525) {
        snake.corpo[0].y += -snake.sy * 5;
        snake.sy = 0;
        snake.corpo[0].x < canvas.width / 2 ? snake.sx = 1 : snake.sx = -1;
    }
    // 2% de chance de mudar de sentido
    if (Math.floor(Math.random() * 100) < 2) {  
        if (snake.sx == 0) {
            snake.sy = 0;
            snake.corpo[0].y < canvas.height / 2 ? snake.sx = 1 : snake.sx = -1;
        } else {
            snake.sx = 0;
            snake.corpo[0].x < canvas.width / 2 ? snake.sy = 1 : snake.sy = -1;
        }
    }
    // efetua o movimento das palavras na tela inicial
    inicio.desl += 0.7 * inicio.sx;
    if (inicio.desl > 20 || inicio.desl < -20) {
        inicio.desl = 20 * inicio.sx;
        inicio.sx *= -1;
    }
}

// Função para desenhar a esfera do dragão do titulo sem bordas brancas
function desenharEsferaTitulo(x, y, width, height) {
    ctx.save(); // Salva o estado do contexto

    // Desenha a sombra
    ctx.beginPath();
    ctx.arc(x + width / 2 + 6, y + height / 2.3 + 5, width / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();
    
    // Recorte circular para a esfera
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 2, width / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip(); // Aplica um recorte circular

    // Desenha a esfera do dragão
    ctx.drawImage(esferaTitulo, x, y, width, height);

    ctx.restore(); // Restaura o estado do contexto
}

function desenhar_inicio() {
    desenhar_jogo();
    
    // Desenhar o título "Snake" com cores do Dragon Ball e contorno preto
    ctx.font = "300px Trebuchet MS";
    
    // Desenhar "SNA" (amarelo) com contorno preto
    ctx.fillStyle = '#000'; // Contorno preto
    ctx.strokeStyle = '#000'; // Contorno preto
    ctx.lineWidth = 4; // Largura do contorno
    ctx.textAlign = 'center';

    // Letra "S" (amarelo)
    ctx.fillStyle = '#FEDB00'; // Amarelo Dragon Ball
    ctx.fillText("S", canvas.width / 2 + inicio.desl - 330, 355);
    ctx.strokeText("S", canvas.width / 2 + inicio.desl - 330, 355);

    // Letra "N" (amarelo)
    ctx.fillStyle = '#FEDB00'; // Amarelo Dragon Ball
    ctx.fillText("N", canvas.width / 2 + inicio.desl - 178, 355);
    ctx.strokeText("N", canvas.width / 2 + inicio.desl - 178, 355);

    // Letra "A" (amarelo)
    ctx.fillStyle = '#FEDB00'; // Amarelo Dragon Ball
    ctx.fillText("A", canvas.width / 2 + inicio.desl, 359);
    ctx.strokeText("A", canvas.width / 2 + inicio.desl, 359);

    // Letra "KE" (vermelho)
    ctx.fillStyle = '#DB0000'; // Vermelho Dragon Ball
    ctx.fillText("KE", canvas.width / 2 + inicio.desl + 255, 360);
    ctx.strokeText("KE", canvas.width / 2 + inicio.desl + 255, 360);
    
    // Desenhar o texto "Press ENTER to Start" com sombra
    ctx.font = "60px Impact";
    ctx.fillStyle = '#000a'; // Sombra
    ctx.fillText("Press ENTER t     Start", canvas.width / 2 + inicio.desl + 5, 425); // Sombra
    ctx.fillStyle = 'orange'; // Texto
    ctx.fillText("Press ENTER t     Start", canvas.width / 2 + inicio.desl, 420); // Texto

    // Desenhar a esfera do dragão sem bordas brancas
    desenharEsferaTitulo(canvas.width / 2 + inicio.desl - -77, 384, 40, 40);

    // Desenhar a sombra da nuvem voadora do Goku
    ctx.save(); // Salva o estado do contexto
    ctx.filter = 'brightness(30%)'; // Aplica um filtro de brilho para escurecer a imagem
    ctx.drawImage(nuvemGoku, nuvemPosicaoX + 10, nuvemPosicaoY + 10, 550, 240); // Desenha a sombra da nuvem
    ctx.restore(); // Restaura o estado do contexto para remover o filtro aplicado

    // Desenhar a nuvem voadora do Goku
    ctx.drawImage(nuvemGoku, nuvemPosicaoX, nuvemPosicaoY, 550, 240); // Redimensiona a imagem da nuvem
}

function iniciar_variaveis_jogo() {
    snake.corpo = [{x: 100, y: canvas.height / 2}];
    snake.sx = 1;
    snake.sy = 0;
    snake.tam = 1;
    snake.aum = 0;
    snake.vel = 1;
    gerar_alim();
}

function gerar_alim() {
    alim.x = Math.floor(Math.random() * 1060 + 20);
    alim.y = Math.floor(Math.random() * 510 + 20);
    alim.raio = 0;
    alim.ativo = true;

    esfera.onload = function() {
        desenhar_jogo();
    }
}

function som(psom, pvol, pvel) {
    let snd = new Audio(psom);
    snd.volume = pvol;
    snd.playbackRate = pvel;
    snd.play();
}

window.requestAnimationFrame(gameloop);  // agenda próxima chamada de gameloop