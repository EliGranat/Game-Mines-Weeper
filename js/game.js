'use strict';
const MINE = '💣';
const FLAG = '🏴';
const MAGNIGLASS = '🔍';
const LIVE = '💛';
const BROKENHART = '💔';
const SMYLEHAPPY = '😃';
const SMYLEGOOD = '😎';
const SMYLESAD = '🤯';

var gBoard = [];
var gTimerInterval;
var gHintClicked = false;
var gCounterHint = 3;
var gCountSafeClick = 3;
var gManuallyCreate = false;
var gRandomManually = [];

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
}
var gLevel = {
    idx: 1,
    size: 8,
    mines: 12,
    lives: 4,
    livesUse: 0
}

window.onload = initGame;

function initGame() {
    resetGame();
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    buildBoard(gLevel.size, gLevel.mines);
    gGame.isOn = true;
    renderBoard(gBoard);
    setMinesNegsCount();
    playerInfo();
}

function resetGame() {
    resetTimer();
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gLevel.livesUse = 0;
    gCountSafeClick = 3;
    gCounterHint = 3;
    hintButton('restart');
}

function manuallyBtnClick() {
    gRandomManually = [];
    initGame();
    gManuallyCreate = true;
}

function changeManuallyMode(elCell, i, j) {
    if (gRandomManually.length < gLevel.mines) {
        gRandomManually.push({ i: i, j: j });
        elCell.innerText = MINE;
        if (gRandomManually.length === gLevel.mines) {
            console.log(gRandomManually);
            setTimeout(() => {
                var elStartGame = document.querySelector('.manuallyBtnClick');
                elStartGame.innerText = 'Play!';
                initGame();
            }, 1000);
        }
    }
}

function SafeClick() {
    var elButSafeClick = document.querySelector('.safe-click');
    if (gCountSafeClick === 0) {
        return;
    }
    gCountSafeClick--;
    elButSafeClick.innerText = MAGNIGLASS + ' (' + gCountSafeClick + ')';
    for (var i = 0; i < 1; i++) {
        if (gLevel.size ** 2 === gLevel.mines + gGame.shownCount) {
            return;
        }
        var idxRan = getRandomIdx();
        if ((gBoard[idxRan.i][idxRan.j].isMine) || gBoard[idxRan.i][idxRan.j].isShown) {
            i--; // not get the mine /shown
            continue;
        }
        var elSafe = document.querySelector(`#cell-${idxRan.i}-${idxRan.j}`);
        elSafe.style.background = 'blue';
        setTimeout(function() {
            elSafe.style.background = 'rgba(0, 0, 0, 0.37)';
        }, 1500);
    }
}

function lives() {
    var lives = '';
    if (gLevel.livesUse === 0) {
        lives = '';
        for (var i = 0; i < gLevel.lives; i++) {
            lives += LIVE;
        }
    }
    if (gLevel.livesUse > 0) {
        lives = '';

        for (var i = 0; i < gLevel.livesUse; i++) {
            lives += BROKENHART;
        }
        for (var i = 0; i < gLevel.lives; i++) {
            lives += LIVE;
        }
    }
    var elMlives = document.querySelector('.lives');
    elMlives.innerText = lives;
}

function smyleGameRestart(feeling) {
    if (feeling === 'restartGame') {
        var elGameOver = document.querySelector('.game-over');
        elGameOver.style.display = 'none';
        initGame();
        feeling = SMYLEHAPPY;
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


    if (((gLevel.size ** 2) === (gGame.shownCount + gGame.markedCount + gLevel.livesUse)) && (gGame.markedCount + gLevel.livesUse === gLevel.mines)) {
        smyleGameRestart(SMYLEGOOD);
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
    var elGameOver = document.querySelector('.game-over');
    elGameOver.style.display = 'none';
    lives()
    clearInterval(gTimerInterval);
    gTimerInterval = null;
    initGame();
}

function cellClicked(ev, elCell, i, j) {
    if (ev.button === 0) { //left click
        if (gManuallyCreate) {
            return changeManuallyMode(elCell, i, j);
        }
        if (gBoard[i][j].isShown) return; //already show this cell
        if (gGame.shownCount + gLevel.livesUse + gGame.markedCount === 0 && gGame.isOn) {
            gTimerInterval = setInterval(myTimer, 1);
            var elStartGame = document.querySelector('.manuallyBtnClick');
            elStartGame.innerText = 'Manually';
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
            smyleGameRestart(SMYLESAD);

            gLevel.lives--;
            gLevel.livesUse++
                lives();

            if (gLevel.lives === 0) { //check if loose the game
                checkGameOver('Game Over <br>You Looser!');
                return;
            }
            return;
        }
        gGame.shownCount++;
        playerInfo();
        gBoard[i][j].isShown = true;
        elCell.innerHTML = gBoard[i][j].minesAroundCount;
    }
    if (ev.button === 2) cellMarked(elCell, i, j); //right click
}

function cellMarked(elCell, i, j) {
    if (gManuallyCreate) {
        return;
    }
    if (gBoard[i][j].isShown) return;
    if (gGame.shownCount + gLevel.livesUse + gGame.markedCount === 0 && gGame.isOn) {
        gTimerInterval = setInterval(myTimer, 1);
        var elStartGame = document.querySelector('.manuallyBtnClick');
        elStartGame.innerText = 'Manually';
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
    console.log('cleer');
    clearInterval(gTimerInterval);
    gTimerInterval = null;
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


function hintButton(start = null) {

    var elHintButton = document.querySelector('.hintBut');
    if (!start && gCounterHint === 1) {
        gHintClicked = true;
        gCounterHint--;
        elHintButton.style.display = 'none';
        return;
    }
    if (!start && gCounterHint >= 1) {
        elHintButton.style.background = getRandomColor();

        gCounterHint--;
        gHintClicked = true;
    }
    if (start === 'restart') {
        var safeClick = document.querySelector('.safe-click');
        safeClick.innerText = MAGNIGLASS + ' (3)';
        elHintButton.style.display = 'inline-block';
        gCounterHint = 3;
        elHintButton.style.backgroundImage = 'url(./img/bac2.jpg)';
        elHintButton.style.backgroundSize = '200px';
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
