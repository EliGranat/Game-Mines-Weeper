'use strict';

function buildBoard(size, level) {
    gBoard = [];
    for (var i = 0; i < size; i++) {
        gBoard[i] = [];
        for (var j = 0; j < size; j++) {
            gBoard[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
        }
    }

    for (var i = 0; i < level; i++) {
        var idxRan = getRandomIdx();
        if (gBoard[idxRan.i][idxRan.j].isMine) {
            i--; // not get the mine twice in the same index
        }
        gBoard[idxRan.i][idxRan.j].isMine = true;
    }
}

function renderBoard(board) {
    var tableHTML = '<table>'
    var gameOver = '';
    for (var i = 0; i < board.length; i++) {
        tableHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            if (!gGame.isOn) {
                gameOver = gBoard[i][j].isMine ? MINE : gBoard[i][j].minesAroundCount;
            }
            tableHTML += `<td  onmousedown="cellClicked(event,this,${i},${j})" id="cell-${i}-${j}">${gameOver}</td>`
        }
        tableHTML += '<tr>'
    }
    tableHTML += '<table>'
    var elHTML = document.querySelector('.board-container');
    elHTML.innerHTML = tableHTML;
}


function getRandomIdx() {
    var idxR = { i: 0, j: 0 };
    idxR.i = getRandomIntInclusive(0, gBoard.length - 1);
    idxR.j = getRandomIntInclusive(0, gBoard[0].length - 1);
    return idxR;

}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function resetTimer() {
    if (gTimerInterval)
        clearInterval(gTimerInterval);
    gTimerInterval = null;
    gTimer.msec = 0;
    gTimer.sec = 0;
    gTimer.min = 0;
    gTimer.hur = 0;
    // reaset after 
    var theTime = gTimer.hur + ':' + gTimer.min + ':' + gTimer.sec + ':' + gTimer.msec;
    var getTimer = document.querySelector('.timer')
    getTimer.innerHTML = theTime;

}

var gTimer = {
    msec: 0,
    sec: 0,
    min: 0,
    hur: 0
};

function myTimer() {

    gTimer.msec = gTimer.msec + 1;

    if (gTimer.msec === 1000) {
        gTimer.msec = 0;
        gTimer.sec += 1;
    }
    if (gTimer.sec === 60) {
        gTimer.sec = 0;
        gTimer.min += 1;
    }
    if (gTimer.min === 60) {
        gTimer.min = 0;
        gTimer.hur += 1;
    }
    if (gTimer.hur === 24) {
        gTimer.hur = 0;
        clearInterval(gTimerInterval);
        liveTimer = null;

    }
    var theTime = gTimer.hur + ':' + gTimer.min + ':' + gTimer.sec + ':' + gTimer.msec;

    var getTimer = document.querySelector('.timer')
    getTimer.innerHTML = theTime;
    gGame.secsPassed = theTime;

}

function getRandomColor() {
    var color = "";
    for (var i = 0; i < 3; i++) {
        var sub = Math.floor(Math.random() * 256).toString(16);
        color += (sub.length == 1 ? "0" + sub : sub);
    }
    return "#" + color;
}