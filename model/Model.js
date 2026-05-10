export class Model {
    
    constructor() {
        this.TENTATIVAS_MAXIMAS = 6;
        this.TAMANHO_PALAVRA = 5;

        const palavras = {
            'pt' : ["PORTA", "VALOR", "FELIZ", "AMIGO", "MUNDO", "PRATO"],
            'en' : ["APPLE", "HOUSE", "HAPPY", "BROKE", "WORLD", "BRAVE"]
        }

        this.dicionario = {
            'pt' : palavras['pt'].filter(palavra => palavra.length === this.TAMANHO_PALAVRA),
            'en' : palavras['en'].filter(palavra => palavra.length === this.TAMANHO_PALAVRA)
        }

        this.idioma_atual = '';
        this.palavra_alvo = '';
        this.pontuacao = 0;
        this.rodada = 1;
        this.linha_atual = 0;
        this.coluna_atual = 0;
        this.fim_de_jogo = false;

        this.tabuleiro = Array.from({ length: this.TENTATIVAS_MAXIMAS }, () => 
            Array(this.TAMANHO_PALAVRA).fill("")
        );
    }

    iniciarPartida(idioma) {
        this.idioma_atual = idioma;
        this.sortearPalavra();
    }

    sortearPalavra() {
        const lista = this.dicionario[this.idioma_atual];
        const indice = Math.floor(Math.random() * lista.length);
        this.palavra_alvo = lista[indice].toUpperCase();

        this.linha_atual = 0;
        this.coluna_atual = 0;
        this.fim_de_jogo = false;
        this.tabuleiro = Array.from({ length: this.TENTATIVAS_MAXIMAS }, () => 
            Array(this.TAMANHO_PALAVRA).fill("")
        );
    }
}

    