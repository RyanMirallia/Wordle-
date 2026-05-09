export default class View {

    constructor() {

        this.board =
            document.getElementById("board");

        this.startScreen =
            document.getElementById("tela-inicio");

        this.gameScreen =
            document.getElementById("tela-jogo");

        this.scoreElement =
            document.getElementById("score-val");

        this.roundElement =
            document.getElementById("round-val");

        this.messageElement =
            document.getElementById("msg-instr");
    }

    renderBoard() {

        this.board.innerHTML = "";

        for (let row = 0; row < 6; row++) {

            const rowElement =
                document.createElement("div");

            rowElement.classList.add("linha");

            for (let column = 0; column < 5; column++) {

                const tile =
                    document.createElement("div");

                tile.classList.add("tile");

                tile.id = `t-${row}-${column}`;

                rowElement.appendChild(tile);
            }

            this.board.appendChild(rowElement);
        }
    }

    updateTile(row, column, letter) {

        const tile =
            document.getElementById(`t-${row}-${column}`);

        tile.innerText = letter;
    }

    colorTile(row, column, color) {

        const tile =
            document.getElementById(`t-${row}-${column}`);

        tile.style.background = color;

        tile.style.borderColor = "transparent";
    }

    updateScore(score) {

        this.scoreElement.innerText = score;
    }

    updateRound(round) {

        this.roundElement.innerText = round;
    }

    showMessage(message) {

        this.messageElement.innerText = message;
    }

    showGameScreen() {

        this.startScreen.style.display = "none";

        this.gameScreen.style.display = "flex";
    }

    clearBoard() {

        this.renderBoard();
    }
}