export class Model {
    
    constructor() {
        this.TENTATIVAS_MAXIMAS = 6;
        this.TAMANHO_PALAVRA = 5;
        this.PONTOS_ACERTO_EXATO = 10;
        this.PONTOS_LETRA_PRESENTE = 5;

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

    adicionarLetra(letra) {
        if (this.coluna_atual < this.TAMANHO_PALAVRA) {
            this.tabuleiro[this.linha_atual][this.coluna_atual] = letra;
            this.coluna_atual++;
            return true;
        }
        return false;
    }

    removerLetra() {
        if (this.coluna_atual > 0) {
            this.coluna_atual--;
            this.tabuleiro[this.linha_atual][this.coluna_atual] = "";
            return true;
        }
        return false;
    }

    linhaCompleta() {
        return this.coluna_atual === this.TAMANHO_PALAVRA;
    }

    validarTentativa() {
        const tentativa = this.tabuleiro[this.linha_atual];
        const resultadoCores = [];
        const palavraAlvoArray = this.palavra_alvo.split('');

        tentativa.forEach((letra, i) => {
            if (letra === palavraAlvoArray[i]) {
                resultadoCores.push('correto');
                this.pontuacao += this.PONTOS_ACERTO_EXATO;
            } else if (palavraAlvoArray.includes(letra)) {
                resultadoCores.push('presente');
                this.pontuacao += this.PONTOS_LETRA_PRESENTE;
            } else {
                resultadoCores.push('erro');
            }
        });

        return resultadoCores;
    }

    verificarVitoria() {
        const tentativa = this.tabuleiro[this.linha_atual].join("");
        return tentativa === this.palavra_alvo;
    }

    proximaLinha() {
        this.linha_atual++;
        this.coluna_atual = 0;
        if (this.linha_atual >= this.TENTATIVAS_MAXIMAS) {
            this.fim_de_jogo = true;
        }
    }

    proximaRodada() {
        this.rodada++;
        this.sortearPalavra();
    }
}

    