const size = 4;
let board = [];
let score = 0;
let lastMove = null;
let gameOver = false;

function initBoard() {
    board = Array.from({ length: size }, () => Array(size).fill(0));
    score = 0;
    gameOver = false;
    hideGameOver();
    addRandomTile();
    addRandomTile();
    updateBoard();
    updateScore();
}

function hideGameOver() {
    const gameOverDiv = document.getElementById('game-over');
    gameOverDiv.classList.remove('show');
    gameOverDiv.textContent = '';
}

function showGameOver() {
    gameOver = true;
    const gameOverDiv = document.getElementById('game-over');
    gameOverDiv.textContent = 'Game Over';
    gameOverDiv.classList.add('show');
    // 오버레이가 항상 보드 위에 있도록 append
    const gameBoard = document.getElementById('game-board');
    if (gameBoard.lastElementChild !== gameOverDiv) {
        gameBoard.appendChild(gameOverDiv);
    }
    // 오버레이가 보이도록 강제로 reflow 트리거
    void gameOverDiv.offsetWidth;
    gameOverDiv.classList.add('show');
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
    lastMove = { newTile: [r, c] };
}

function updateBoard(moveInfo) {
    const gameBoard = document.getElementById('game-board');
    // 오버레이를 제외한 타일만 갱신
    Array.from(gameBoard.children).forEach(child => {
        if (!child.id || child.id !== 'game-over') gameBoard.removeChild(child);
    });
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const tile = document.createElement('div');
            tile.className = `tile tile-${board[r][c]}`;
            tile.textContent = board[r][c] !== 0 ? board[r][c] : '';
            if (moveInfo && moveInfo.movedTiles && moveInfo.movedTiles.some(([mr, mc]) => mr === r && mc === c)) {
                tile.classList.add('move');
            }
            if (!moveInfo && lastMove && lastMove.newTile && lastMove.newTile[0] === r && lastMove.newTile[1] === c) {
                tile.classList.add('new');
            }
            gameBoard.appendChild(tile);
        }
    }
    // 게임오버 오버레이가 항상 보드 위에 있도록 append
    const gameOverDiv = document.getElementById('game-over');
    if (gameBoard.lastElementChild !== gameOverDiv) {
        gameBoard.appendChild(gameOverDiv);
    }
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

function move(dir) {
    if (gameOver) return;
    let moved = false;
    let movedTiles = [];
    function slide(row, rIdx) {
        let arr = row.filter(x => x !== 0);
        let merged = Array(arr.length).fill(false);
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1] && arr[i] !== 0 && !merged[i] && !merged[i + 1]) {
                arr[i] *= 2;
                score += arr[i];
                arr[i + 1] = 0;
                merged[i] = true;
            }
        }
        arr = arr.filter(x => x !== 0);
        while (arr.length < size) arr.push(0);
        return arr;
    }
    if (dir === 'left') {
        for (let r = 0; r < size; r++) {
            let old = board[r].slice();
            let newRow = slide(board[r], r);
            if (old.toString() !== newRow.toString()) {
                moved = true;
                for (let c = 0; c < size; c++) {
                    if (old[c] !== 0 && old[c] !== newRow[c]) {
                        movedTiles.push([r, c]);
                    }
                }
            }
            board[r] = newRow;
        }
    } else if (dir === 'right') {
        for (let r = 0; r < size; r++) {
            let old = board[r].slice();
            let newRow = slide(board[r].slice().reverse(), r).reverse();
            if (old.toString() !== newRow.toString()) {
                moved = true;
                for (let c = 0; c < size; c++) {
                    if (old[c] !== 0 && old[c] !== newRow[c]) {
                        movedTiles.push([r, c]);
                    }
                }
            }
            board[r] = newRow;
        }
    } else if (dir === 'up') {
        for (let c = 0; c < size; c++) {
            let col = [];
            for (let r = 0; r < size; r++) col.push(board[r][c]);
            let old = col.slice();
            let newCol = slide(col, c);
            if (old.toString() !== newCol.toString()) {
                moved = true;
                for (let r = 0; r < size; r++) {
                    if (old[r] !== 0 && old[r] !== newCol[r]) {
                        movedTiles.push([r, c]);
                    }
                }
            }
            for (let r = 0; r < size; r++) board[r][c] = newCol[r];
        }
    } else if (dir === 'down') {
        for (let c = 0; c < size; c++) {
            let col = [];
            for (let r = 0; r < size; r++) col.push(board[r][c]);
            let old = col.slice();
            let newCol = slide(col.reverse(), c).reverse();
            if (old.toString() !== newCol.toString()) {
                moved = true;
                for (let r = 0; r < size; r++) {
                    if (old[r] !== 0 && old[r] !== newCol[r]) {
                        movedTiles.push([r, c]);
                    }
                }
            }
            for (let r = 0; r < size; r++) board[r][c] = newCol[r];
        }
    }
    if (moved) {
        addRandomTile();
        updateBoard({ movedTiles });
        updateScore();
        // 여기서 lastMove를 null로 초기화하여 두 번째 updateBoard에서 .new가 적용되지 않게 함
        setTimeout(() => {
            lastMove = null;
            updateBoard();
        }, 180);
        if (isGameOver()) {
            setTimeout(() => {
                showGameOver();
            }, 200);
        } else if (isGameWon()) {
            setTimeout(() => alert('You Win!'), 200);
        }
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') move('left');
    else if (e.key === 'ArrowRight') move('right');
    else if (e.key === 'ArrowUp') move('up');
    else if (e.key === 'ArrowDown') move('down');
});

document.getElementById('restart').onclick = initBoard;

document.getElementById('test-gameover').onclick = function() {
    showGameOver();
};

window.onload = initBoard;
