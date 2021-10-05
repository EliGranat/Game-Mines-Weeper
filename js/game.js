'use strict';
var gBoard = [];
var gTimerInterval = null;
const MINE = '💣';
const FLAG = '🏴';
var gLives = '';
var gHintClicked = false;
var gCounterHits = 3;
// var gCountAllPlayers = 0;

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
}

var gLevel = {
    idx: 0,
    size: 4,
    mines: 2,
    lives: 2,
    livesUse: 0

}
window.onload = initGame;

function initGame() {
    resetTimer();
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gCounterHits = 3;
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    buildBoard(gLevel.size, gLevel.mines);
    // gCountAllPlayers++;
    gGame.isOn = true;
    renderBoard(gBoard);
    setMinesNegsCount();
    playerInfo();
}



function lives() {
    var live = '💛';
    var brokenHart = '💔';
    if (gLevel.livesUse === 0) {
        gLives = '';
        for (var i = 0; i < gLevel.lives; i++) {
            gLives += live;
        }
    }
    if (gLevel.livesUse > 0) {
        gLives = '';

        for (var i = 0; i < gLevel.livesUse; i++) {
            gLives += brokenHart;
        }
        for (var i = 0; i < gLevel.lives; i++) {
            gLives += live;

        }
    }
    var elMlives = document.querySelector('.lives');
    elMlives.innerText = gLives;
}

function smyleGameRestart(feeling) {
    if (feeling === 'restartGame') {
        var elGameOver = document.querySelector('.game-over');
        elGameOver.style.display = 'none';
        initGame();
        feeling = '😃';
        levels(gLevel.idx);
    }
    var elSmyleGame = document.querySelector('.smyle-restart');
    elSmyleGame.innerText = feeling;
}

function playerInfo() {
    var elScore = document.querySelector('.score');
    elScore.innerText = 'score: ' + gGame.shownCount;

    var elMarkedCount = document.querySelector('.markedCount');
    elMarkedCount.innerText = '🏴: ' + gGame.markedCount;


    if ((gLevel.size ** 2) === (gGame.shownCount + gGame.markedCount) && (gGame.markedCount + gLevel.livesUse === gLevel.mines)) {
        smyleGameRestart('😎');
        // myLocalStorage();
        checkGameOver('Game Over <br>You Win!');
    }
}

function levels(idxLevel) {
    var gLevels = [
        { idx: 0, size: 4, mines: 2, lives: 2, livesUse: 0 },
        { idx: 1, size: 8, mines: 12, lives: 4, livesUse: 0 },
        { idx: 2, size: 12, mines: 30, lives: 5, livesUse: 0 }
    ]
    gLevel = gLevels[idxLevel];

    console.log(gLevel);
    var elGameOver = document.querySelector('.game-over');
    elGameOver.style.display = 'none';
    lives()
    clearInterval(gTimerInterval);
    gTimerInterval = null;
    initGame();

}

function cellClicked(ev, elCell, i, j) {
    if (ev.button === 0) { //left click
        if (gBoard[i][j].isShown) return; //already show this cell
        if (gGame.shownCount === 0) {
            gTimerInterval = setInterval(myTimer, 1);
        }

        if (gHintClicked) {
            return hitsNeighbors(i, j);
        }

        if (gBoard[i][j].minesAroundCount === 0) {
            gBoard[i][j].isShown = true;
            expandShown(i, j);
        }

        if (gBoard[i][j].isMine) {
            elCell.innerHTML = MINE;
            gBoard[i][j].isShown = true;
            playShoundBoom(MINE);
            smyleGameRestart('🤯');
            gLevel.lives--;
            gLevel.livesUse++
                lives();
            if (gLevel.lives === 0) { //check if loose the game
                checkGameOver('Game Over <br>You Looser!');
                clearInterval(gTimerInterval);
                return;
            }
        }
        gGame.shownCount++;
        playerInfo();
        gBoard[i][j].isShown = true;
        elCell.innerHTML = gBoard[i][j].minesAroundCount;
        // gHintClicked = false;
    }
    if (ev.button === 2) cellMarked(elCell, i, j); //right click
}

function cellMarked(elCell, i, j) {
    if (gBoard[i][j].isShown) return;
    if (gGame.shownCount === 1) {
        gTimerInterval = setInterval(myTimer, 1);
    }
    if (gBoard[i][j].isMarked) {
        elCell.innerHTML = '';
        gGame.markedCount--;
        gBoard[i][j].isMarked = false;
    } else {
        gGame.markedCount++;
        elCell.innerHTML = FLAG;
        gBoard[i][j].isMarked = true;
    }
    playerInfo();
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
    if (gBoard[i][j].isMine) return MINE;
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
    for (var row = i - 1; row <= i + 1; row++) {
        if (row < 0 || row >= gBoard.length) continue;
        for (var col = j - 1; col <= j + 1; col++) {
            if (col < 0 || col >= gBoard[row].length) continue;
            if (i === row && j === col) { continue; }
            var currcell = gBoard[row][col];
            if (!currcell.isMine && !currcell.isShown) {
                var elSelect = document.querySelector(`#cell-${row}-${col}`);
                elSelect.innerHTML = currcell.minesAroundCount;
                gGame.shownCount++;
                gBoard[row][col].isShown = true;
                playerInfo();
            }
        }
    }
}


function hitsButton() {
    var elHitsButton = document.querySelector('.hitsBut');
    if (gCounterHits === 1) {
        gHintClicked = true;
        gCounterHits--;
        elHitsButton.style.display = 'none';
        return;
    }
    if (gCounterHits >= 1) {
        elHitsButton.style.background = getRandomColor();
        gCounterHits--;
        gHintClicked = true;
    }
}


function hitsNeighbors(i, j) {
    for (var row = i - 1; row <= i + 1; row++) {
        if (row < 0 || row >= gBoard.length) continue;
        for (var col = j - 1; col <= j + 1; col++) {
            if (col < 0 || col >= gBoard[row].length) continue;
            var currcell = gBoard[row][col];
            if (currcell.isShown)
                continue;

            var elSelect = document.querySelector(`#cell-${row}-${col}`);
            elSelect.innerHTML = currcell.minesAroundCount;

            hits(elSelect);
            gHintClicked = false;
        }
    }
}

function hits(elSelect) {
    setTimeout(() => {
        elSelect.innerHTML = ' ';
    }, 1000);
}

function approveRules() {
    var elrulesImg = document.querySelector('.warning');
    elrulesImg.style.display = 'none';

}

function playShoundBoom() {
    var boom = new Audio('./audio/boom.mp3');
    boom.play();
}
