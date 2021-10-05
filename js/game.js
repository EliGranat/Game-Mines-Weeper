'use strict';
var gBoard = [];
var gTimerInterval;
const MINE = '💣';
const FLAG = '🏴';

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    // lives: 3
}


var gLevel = {
    size: 4,
    mines: 2
}
window.onload = initGame;

function initGame() {
    resetTimer();
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    buildBoard(gLevel.size, gLevel.mines);

    gGame.isOn = true;
    renderBoard(gBoard);
    gGame.shownCount = 0;
    gGame.markedCount = 0;
}

function approveRules() {
    var elrulesImg = document.querySelector('.warning');
    elrulesImg.style.display = 'none';
}

function playerInfo() {

    var elScore = document.querySelector('.score');
    elScore.innerText = 'score: ' + gGame.shownCount;

    var elMarkedCount = document.querySelector('.markedCount');
    elMarkedCount.innerText = '🏴: ' + gGame.markedCount;

    if (((gLevel.size ** 2 - gLevel.mines) === gGame.shownCount) && gGame.markedCount === gLevel.mines) {
        checkGameOver('Game Over <br>You Win!');
    }

}

function levels(idxLevel) {
    var gLevels = [
        { size: 4, mines: 2 },
        { size: 8, mines: 12 },
        { size: 12, mines: 30 }
    ]
    gLevel = gLevels[idxLevel];
    var elGameOver = document.querySelector('.game-over');
    elGameOver.style.display = 'none';
    initGame();
}

function cellClicked(ev, elCell, i, j) {
    if (ev.button === 0) {
        if (gBoard[i][j].isShown) return; //already show this cell
        if (gGame.shownCount === 0) {
            setMinesNegsCount();
            if (gBoard[i][j].isMine) {
                cellClicked(ev, elCell, i, j)
            }
        }
        if (gGame.shownCount >= 1) {

            if (gBoard[i][j].isMine) {
                elCell.innerHTML = MINE;
                gBoard[i][j].isShown = true;
                checkGameOver('Game Over <br>You Looser!');
                return;
            }
        }
        gGame.shownCount++;
        playerInfo();
        if (gGame.shownCount === 1) {
            gTimerInterval = setInterval(myTimer, 1);
        }
        if (gBoard[i][j].minesAroundCount === 0) {
            gBoard[i][j].isShown = true;
            expandShown(i, j);
        }
        gBoard[i][j].isShown = true;
        elCell.innerHTML = gBoard[i][j].minesAroundCount;
    }
    if (ev.button === 2) cellMarked(elCell, i, j);
}

function cellMarked(elCell, i, j) {
    if (gBoard[i][j].isShown) return;
    if (gBoard[i][j].isMarked) {
        elCell.innerHTML = '';
        gGame.markedCount--;
        gBoard[i][j].isMarked = false;
    } else {
        gGame.markedCount++;
        playerInfo();
        if (gGame.shownCount === 1) {
            gTimerInterval = setInterval(myTimer, 1);
        }
        elCell.innerHTML = FLAG;
        gBoard[i][j].isMarked = true;

    }
}

function checkGameOver(loosWin) {
    clearInterval(gTimerInterval);
    gGame.isOn = false;
    renderBoard(gBoard);
    var endGame = document.querySelector('.game-over');
    endGame.style.display = 'inline-block';
    endGame.innerHTML = loosWin;
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var counter = countMineForCell(i, j);
            gBoard[i][j].minesAroundCount = counter;
        }
    }

}

function countMineForCell(i, j) {
    var counter = 0;
    if (gBoard[i][j].isMine) return counter;
    for (var row = i - 1; row <= i + 1; row++) {
        if (row < 0 || row >= gBoard.length) continue;
        for (var col = j - 1; col <= j + 1; col++) {
            if (col < 0 || col >= gBoard[row].length) continue;
            if (i === row && j === col) {
                continue;
            }
            if (gBoard[row][col].isMine) {
                counter++;
            }
        }
    }
    return counter;

}


function expandShown(i, j) {
    // if (gBoard[i][j].isMine) return counter;
    for (var row = i - 1; row <= i + 1; row++) {
        if (row < 0 || row >= gBoard.length) continue;

        for (var col = j - 1; col <= j + 1; col++) {
            if (col < 0 || col >= gBoard[row].length) continue;
            if (i === row && j === col) { continue; }

            var currcell = gBoard[row][col];
            if (!currcell.isMine && !currcell.isShown) {
                var elSelect = document.querySelector(`#cell-${row}-${col}`)
                elSelect.innerHTML = gBoard[row][col].minesAroundCount;
                gBoard[row][col].isShown = true;
                gGame.shownCount++;
            }
        }
    }
    console.log(gBoard);

}






























































//:todo Render the board as a <table> to the page
// 



// :todo This is called when page loads
// initGame() 

// :todo Builds the board
// Set mines at random locations
// Call setMinesNegsCount()

// Return the created board
// buildBoard() 

// :todo Count mines around each cell
// and set the cell's
// minesAroundCount.
// setMinesNegsCount(board)


//:todo Called when a cell (td) is clicked
// cellClicked(elCell, i, j) 


// Called on right click to mark a
// cell (suspected to be a mine)
// Search the web (and
// implement) how to hide the
// context menu on right click
// cellMarked(elCell)


//:todo Game ends when all mines are
// marked, and all the other cells
// are shown
// checkGameOver() 

//:todo When user clicks a cell with no
// mines around, we need to open
// not only that cell, but also its
// neighbors.
// NOTE: start with a basic
// implementation that only opens
// the non-mine 1st degree
// neighbors
// BONUS: if you have the time
// later, try to work more like the
// real algorithm (see description
// at the Bonuses section below)
// expandShown(board, elCell, i, j)