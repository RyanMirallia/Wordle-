// Controller.js - Responsável por coordenar Model e View

import { Model } from '../model/Model.js';
import View from '../views/View.js';

export class Controller {

    constructor() {

        this.model = new Model();

        this.view = new View();

        this.inicializarEventos();

    }

    

    // Configura os event listeners

    inicializarEventos() {

        // Captura teclas digitadas

        window.addEventListener('keydown', (evento) => this.tratarTeclado(evento));

        

        // Configura os botões de idioma

        this.configurarBotoesIdioma();

    }

    

    // Configura os botões de seleção de idioma

    configurarBotoesIdioma() {

        const botoes = document.querySelectorAll('.btn-idioma');

        botoes.forEach(botao => {

            botao.addEventListener('click', () => {

                const idioma = botao.textContent === 'Português' ? 'pt' : 'en';

                this.iniciarJogo(idioma);

            });

        });

    }

    

    // Inicia o jogo com o idioma selecionado

    iniciarJogo(idioma) {

        this.model.iniciarPartida(idioma);

        this.view.showGameScreen();

        this.view.renderBoard();

        

        // Define a mensagem de instrução baseada no idioma

        const mensagem = idioma === 'pt' 

            ? "Tente adivinhar a palavra de 5 letras."

            : "Guess the 5-letter word.";

        this.view.showMessage(mensagem);

        

        // Atualiza os indicadores

        this.view.updateScore(this.model.pontuacao);

        this.view.updateRound(this.model.rodada);

    }

    

    // Trata as teclas pressionadas pelo jogador

    tratarTeclado(evento) {

        // Ignora se o jogo acabou ou não foi iniciado

        if (this.model.fim_de_jogo || this.model.idioma_atual === '') {

            return;

        }

        

        const tecla = evento.key.toUpperCase();

        

        // BACKSPACE: remove última letra

        if (tecla === 'BACKSPACE') {

            this.tratarBackspace();

        }

        // ENTER: valida a tentativa

        else if (tecla === 'ENTER') {

            this.tratarEnter();

        }

        // Letra A-Z: adiciona no tabuleiro

        else if (/^[A-Z]$/.test(tecla)) {

            this.tratarLetra(tecla);

        }

    }

    

    // Remove a última letra digitada

    tratarBackspace() {

        if (this.model.removerLetra()) {

            const linha = this.model.linha_atual;

            const coluna = this.model.coluna_atual;

            this.view.updateTile(linha, coluna, "");

        }

    }

    

    // Adiciona uma letra no tabuleiro

    tratarLetra(letra) {

        const linha = this.model.linha_atual;

        const coluna = this.model.coluna_atual;

        

        if (this.model.adicionarLetra(letra)) {

            this.view.updateTile(linha, coluna, letra);

        }

    }

    

    // Valida a tentativa quando o jogador pressiona ENTER

    tratarEnter() {

        // Só valida se a linha estiver completa

        if (!this.model.linhaCompleta()) {

            return;

        }

        

        const linha = this.model.linha_atual;

        const cores = this.model.validarTentativa();

        

        // Aplica as cores nas tiles

        this.aplicarCores(linha, cores);

        

        // Atualiza a pontuação

        this.view.updateScore(this.model.pontuacao);

        

        // Verifica se acertou a palavra

        if (this.model.verificarVitoria()) {

            this.tratarVitoria();

        } else {

            this.model.proximaLinha();

            

            // Verifica se acabaram as tentativas

            if (this.model.fim_de_jogo) {

                this.tratarDerrota();

            }

        }

    }

    

    // Aplica as cores nas tiles da linha

    aplicarCores(linha, cores) {

        const mapaCores = {

            'correto': '#538d4e',

            'presente': '#b59f3b',

            'erro': '#3a3a3c'

        };

        

        for (let coluna = 0; coluna < cores.length; coluna++) {

            const cor = mapaCores[cores[coluna]];

            this.view.colorTile(linha, coluna, cor);

        }

    }

    

    // Trata a vitória do jogador

    tratarVitoria() {

        const mensagem = this.model.idioma_atual === 'pt' 

            ? "Acertou!" 

            : "Correct!";

        

        alert(mensagem);

        

        // Avança para a próxima rodada

        this.model.proximaRodada();

        this.view.updateRound(this.model.rodada);

        this.view.clearBoard();

    }

    

    // Trata a derrota do jogador

    tratarDerrota() {

        const mensagem = this.model.idioma_atual === 'pt'

            ? `Fim! A palavra era: ${this.model.palavra_alvo}`

            : `End! The word was: ${this.model.palavra_alvo}`;

        

        alert(mensagem);

    }

}

// Inicializa o jogo quando a página carregar

window.addEventListener('DOMContentLoaded', () => {

    new Controller();

});
