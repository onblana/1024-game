const size = 4;
let board = [];
let score = 0;

function initBoard() {
    board = Array.from({ length: size }, () => Array(size).fill(0));
    score = 0;
    addRandomTile();
    addRandomTile();
    updateBoard();
    updateScore();
}

function addRandomTile() {
    let empty = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] === 0) empty.push([r, c]);
        }
    }
    if (empty.length === 0) return;
    let [r, c] = empty[Math.floor(Math.random() * empty.length)];
    board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function updateBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const tile = document.createElement('div');
            tile.className = `tile tile-${board[r][c]}`;
            tile.textContent = board[r][c] !== 0 ? board[r][c] : '';
            gameBoard.appendChild(tile);
        }
    }
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

function move(dir) {
    let moved = false;
    let merged = Array.from({ length: size }, () => Array(size).fill(false));
    function slide(row) {
        let arr = row.filter(x => x !== 0);
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1] && arr[i] !== 0) {
                arr[i] *= 2;
                score += arr[i];
                arr[i + 1] = 0;
            }
        }
        arr = arr.filter(x => x !== 0);
        while (arr.length < size) arr.push(0);
        return arr;
    }
    if (dir === 'left') {
        for (let r = 0; r < size; r++) {
            let old = board[r].slice();
            let newRow = slide(board[r]);
            if (old.toString() !== newRow.toString()) moved = true;
            board[r] = newRow;
        }
    } else if (dir === 'right') {
        for (let r = 0; r < size; r++) {
            let old = board[r].slice();
            let newRow = slide(board[r].slice().reverse()).reverse();
            if (old.toString() !== newRow.toString()) moved = true;
            board[r] = newRow;
        }
    } else if (dir === 'up') {
        for (let c = 0; c < size; c++) {
            let col = [];
            for (let r = 0; r < size; r++) col.push(board[r][c]);
            let old = col.slice();
            let newCol = slide(col);
            if (old.toString() !== newCol.toString()) moved = true;
            for (let r = 0; r < size; r++) board[r][c] = newCol[r];
        }
    } else if (dir === 'down') {
        for (let c = 0; c < size; c++) {
            let col = [];
            for (let r = 0; r < size; r++) col.push(board[r][c]);
            let old = col.slice();
            let newCol = slide(col.reverse()).reverse();
            if (old.toString() !== newCol.toString()) moved = true;
            for (let r = 0; r < size; r++) board[r][c] = newCol[r];
        }
    }
    if (moved) {
        addRandomTile();
        updateBoard();
        updateScore();
        if (isGameOver()) {
            setTimeout(() => alert('Game Over!'), 100);
        } else if (isGameWon()) {
            setTimeout(() => alert('You Win!'), 100);
        }
    }
}

function isGameOver() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] === 0) return false;
            if (c < size - 1 && board[r][c] === board[r][c + 1]) return false;
            if (r < size - 1 && board[r][c] === board[r + 1][c]) return false;
        }
    }
    return true;
}

function isGameWon() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] === 1024) return true;
        }
    }
    return false;
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') move('left');
    else if (e.key === 'ArrowRight') move('right');
    else if (e.key === 'ArrowUp') move('up');
    else if (e.key === 'ArrowDown') move('down');
});

document.getElementById('restart').onclick = initBoard;

window.onload = initBoard;
