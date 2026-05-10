# Wordle Eng - Multilingual Legacy

## Sobre o Projeto

Jogo estilo Wordle com suporte a múltiplos idiomas (Português e Inglês), desenvolvido como trabalho prático da disciplina de Engenharia de Software. O projeto passou por uma refatoração completa, aplicando o padrão arquitetural MVC e boas práticas de desenvolvimento.

## Como Executar

1. Clone o repositório:

```bash
git clone [URL_DO_REPOSITORIO]
cd wordle-eng
```

2. Execute em um servidor local

**IMPORTANTE:** O projeto utiliza módulos JavaScript (`type="module"`), portanto **NÃO funciona** abrindo o `index.html` diretamente no navegador. É necessário um servidor HTTP.

### Opções de servidor:

**Opção 1: Python (mais simples)**

```bash
# Python 3
python -m http.server 8000

# Ou Python 2
python -m SimpleHTTPServer 8000
```

Depois acesse: http://localhost:8000

**Opção 2: Live Server (VS Code)**

- Instale a extensão "Live Server" no VS Code
- Clique com o botão direito em `index.html`
- Selecione "Open with Live Server"

**Opção 3: Node.js**

```bash
npx http-server
```

## Arquitetura do Projeto

```
wordle-eng/
├── index.html          # Estrutura HTML principal
├── style.css           # Estilização visual
├── model/
│   └── Model.js        # Lógica de negócio e regras do jogo
├── views/
│   └── View.js         # Renderização e manipulação da interface
└── controller/
    └── Controller.js   # Mediador entre Model e View
```

## Padrão MVC Implementado

### Model (model/Model.js)

- Gerencia os dicionários de palavras por idioma
- Sorteia palavras aleatoriamente
- Calcula pontuação (10 pontos por letra correta, 5 por letra presente)
- Valida tentativas e retorna cores
- Controla o estado da partida (linha atual, coluna atual, fim de jogo)
- Elimina números mágicos usando constantes

### View (views/View.js)

- Renderiza o tabuleiro 6x5
- Atualiza tiles individuais (letra e cor)
- Atualiza pontuação e rodada
- Gerencia transição entre telas (início/jogo)
- **NÃO possui lógica de negócio** - apenas renderização

### Controller (controller/Controller.js)

- Inicializa Model e View
- Captura eventos de teclado (BACKSPACE, ENTER, letras)
- Captura cliques nos botões de idioma
- Coordena a comunicação entre Model e View
- Trata vitória, derrota e próxima rodada

## Code Smells Identificados e Resolvidos

### 1. Variáveis com Nomes Enigmáticos (Cryptic Names)

**Problema no código original:**

```javascript
let r_a = 0; let c_a = 0;  // O que significa isso?
let sc = 0; let rd = 1;    // Impossível deduzir
let m = [["", "", "", "", ""], ...];  // Que matriz é essa?
let p_s = '';  // p_s? Palavra secreta? Palavra sorteada?
let i_escolhido = '';  // Meio termo confuso
```

**Impacto:**

- Código ilegível
- Novos desenvolvedores não conseguem entender o propósito das variáveis
- Alto risco de bugs ao modificar

**Solução aplicada:**

```javascript
// No Model.js - Nomes autodescritivos
this.linha_atual = 0;           // Linha onde o jogador está digitando
this.coluna_atual = 0;          // Coluna onde o jogador está digitando
this.pontuacao = 0;             // Pontos acumulados
this.rodada = 1;                // Número da rodada atual
this.tabuleiro = Array.from({ length: 6 }, () => Array(5).fill(""));
this.palavra_alvo = '';         // Palavra que deve ser adivinhada
this.idioma_atual = '';         // 'pt' ou 'en'
```

**Benefícios:**

- Nomes revelam imediatamente a intenção
- Facilita manutenção e colaboração
- Reduz necessidade de comentários explicativos

---

### 2. Função "Faz-Tudo" (God Function)

**Problema no código original:**

```javascript
window.onkeydown = function (e) {
    if (end || i_escolhido === '') return;
    let k = e.key.toUpperCase();
    
    if (k === "BACKSPACE" && c_a > 0) {
        c_a--;
        m[r_a][c_a] = "";
        document.getElementById("t-" + r_a + "-" + c_a).innerText = "";
    }
    else if (k === "ENTER" && c_a === 5) {
        let u_w = m[r_a].join("");
        
        // 40+ LINHAS misturando:
        // - Validação de palavra
        // - Cálculo de pontuação
        // - Manipulação de DOM
        // - Controle de fluxo do jogo
        for (let i = 0; i < 5; i++) {
            let tile = document.getElementById("t-" + r_a + "-" + i);
            if (u_w[i] === p_s[i]) {
                tile.style.background = "#538d4e";
                sc += 10;
            } else if (p_s.includes(u_w[i])) {
                tile.style.background = "#b59f3b";
                sc += 5;
            } else {
                tile.style.background = "#3a3a3c";
            }
            tile.style.borderColor = "transparent";
        }
        // ... mais lógica misturada
    }
};
```

**Impacto:**

- Uma única função gigante responsável por TUDO
- Impossível testar unitariamente
- Modificar qualquer parte quebra outras partes
- Viola o Princípio da Responsabilidade Única (SRP)

**Solução aplicada:** Separação de responsabilidades no MVC

```javascript
// Controller.js - Coordenação (não tem lógica de negócio)
tratarTeclado(evento) {
    const tecla = evento.key.toUpperCase();
    
    if (tecla === 'BACKSPACE') {
        this.tratarBackspace();      // Delega para função específica
    }
    else if (tecla === 'ENTER') {
        this.tratarEnter();          // Delega para função específica
    }
    else if (/^[A-Z]$/.test(tecla)) {
        this.tratarLetra(tecla);     // Delega para função específica
    }
}

tratarEnter() {
    if (!this.model.linhaCompleta()) return;
    
    const linha = this.model.linha_atual;
    const cores = this.model.validarTentativa();  // Model faz a validação
    
    this.aplicarCores(linha, cores);              // View faz a renderização
    this.view.updateScore(this.model.pontuacao);
    
    if (this.model.verificarVitoria()) {
        this.tratarVitoria();
    } else {
        this.model.proximaLinha();
        if (this.model.fim_de_jogo) {
            this.tratarDerrota();
        }
    }
}

// Model.js - Lógica de negócio pura (sem DOM)
validarTentativa() {
    const palavra_digitada = this.obterPalavraAtual();
    const cores = [];
    
    for (let i = 0; i < this.TAMANHO_PALAVRA; i++) {
        if (palavra_digitada[i] === this.palavra_alvo[i]) {
            cores.push('correto');
            this.pontuacao += this.PONTOS_LETRA_CORRETA;
        } else if (this.palavra_alvo.includes(palavra_digitada[i])) {
            cores.push('presente');
            this.pontuacao += this.PONTOS_LETRA_PRESENTE;
        } else {
            cores.push('erro');
        }
    }
    return cores;  // Retorna dados, não manipula DOM
}

// View.js - Renderização pura (sem lógica de negócio)
colorTile(row, column, color) {
    const tile = document.getElementById(`t-${row}-${column}`);
    tile.style.background = color;
    tile.style.borderColor = "transparent";
}
```

**Benefícios:**

- Cada função tem uma única responsabilidade
- Fácil escrever testes unitários
- Modificações isoladas não quebram o resto
- Código reutilizável e manutenível

---

### 3. Números Mágicos (Magic Numbers)

**Problema no código original:**

```javascript
if (r_a === 6) {  // Por que 6? O que esse número significa?
    alert("Fim/End! Word: " + p_s);
    end = true;
}

for (let i = 0; i < 5; i++) {  // Por que 5?
    let tile = document.getElementById("t-" + r_a + "-" + i);
    if (u_w[i] === p_s[i]) {
        tile.style.background = "#538d4e";
        sc += 10;  // Por que 10 pontos?
    } else if (p_s.includes(u_w[i])) {
        tile.style.background = "#b59f3b";
        sc += 5;   // Por que 5 pontos?
    }
}
```

**Impacto:**

- Valores "mágicos" espalhados pelo código
- Difícil modificar regras (ex: mudar de 6 para 7 tentativas)
- Precisa procurar todos os lugares onde o número aparece
- Alto risco de esquecer algum lugar e criar bug

**Solução aplicada:**

```javascript
// Model.js - Constantes centralizadas e bem nomeadas
constructor() {
    // Configurações do jogo (fácil de ajustar)
    this.TENTATIVAS_MAXIMAS = 6;        // Número de linhas no tabuleiro
    this.TAMANHO_PALAVRA = 5;           // Número de letras por palavra
    this.PONTOS_LETRA_CORRETA = 10;     // Pontos por letra na posição certa
    this.PONTOS_LETRA_PRESENTE = 5;     // Pontos por letra presente
    // ...
}

// Uso no código
if (this.linha_atual >= this.TENTATIVAS_MAXIMAS) {
    this.fim_de_jogo = true;  // Agora é autoexplicativo!
}

for (let i = 0; i < this.TAMANHO_PALAVRA; i++) {
    if (palavra_digitada[i] === this.palavra_alvo[i]) {
        cores.push('correto');
        this.pontuacao += this.PONTOS_LETRA_CORRETA;  // Claro!
    }
}
```

**Benefícios:**

- Configurações em um único lugar
- Fácil modificar regras do jogo
- Código autodocumentado (nomes explicam os valores)
- Evita erros de inconsistência

---

## Outras Melhorias Implementadas

### 4. Validação de Dados

```javascript
// Filtra palavras com tamanho incorreto
this.dicionario = {
    'pt': palavras['pt'].filter(palavra => palavra.length === this.TAMANHO_PALAVRA),
    'en': palavras['en'].filter(palavra => palavra.length === this.TAMANHO_PALAVRA)
};
```

Resolve o bug: No código original, "CODE" tem 4 letras mas o grid espera 5!

### 5. Modularização

- Código separado em 4 arquivos (index.html, style.css, Model.js, View.js, Controller.js)
- Usa ES6 Modules (`import`/`export`)
- Cada arquivo tem uma responsabilidade clara

### 6. Uso de CSS Variables

```css
:root {
    --c-correto: #538d4e;
    --c-tem: #b59f3b;
    --c-erro: #3a3a3c;
}
```

Cores centralizadas - fácil criar temas diferentes!

---

## Contribuidores

- **Ryan Mirallia** - Model (Lógica de negócio)
- **Elun Zhang** - View (Interface visual)
- **Guilherme Augusto** - Controller (Coordenação MVC)

---

## Referências

- McConnell, Steve. *Code Complete: A Practical Handbook of Software Construction*
- Gamma et al. *Design Patterns: Elements of Reusable Object-Oriented Software*
- Fowler, Martin. *Refactoring: Improving the Design of Existing Code*
- Beck, Kent. *Implementation Patterns*

---

## Próximos Passos (Melhorias Futuras)

- [ ] Adicionar dicionário maior de palavras
- [ ] Implementar sistema de ranking/leaderboard
- [ ] Adicionar animações nas tiles
- [ ] Teclado virtual na tela
- [ ] Modo "hard" (palavras mais difíceis)
- [ ] Persistência de dados (localStorage)
