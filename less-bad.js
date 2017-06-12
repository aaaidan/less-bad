window.drawing = true;
window.stop = () => window.drawing = false

const TWO_PI = Math.PI * 2;
const cursor = document.querySelector(".cursor");
const cursorDebug = document.querySelector(".cursor-debug");
const textDebug = document.querySelector(".text-debug");
const keyboard = document.querySelector(".keyboard");
const lines = document.querySelectorAll(".line");

// keystate
var keyState = [];
window.onkeyup = function(e) { keyState[e.keyCode]=false;}
window.onkeydown = function(e) {
    if (!keyState[e.keyCode]) {
        keyState[e.keyCode] = true;
        customKeyPress(e.keyCode);
    }
    //console.log(e.keyCode);
}
const KeyCodes = {
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40
};


// app state
var currentLine = 0;
var currentKey = 0;

var keyWidth = 44;

const BASE_CURSOR_SPEED = 50;
const CURSOR_SPEED_BONUS_RATE = 800;
const MAX_CURSOR_SPEED_BONUS = 400;
const CURSOR_SETTLE_WEIGHT = 0.2;

var cursorX = keyWidth / 2 + getCurrentLineElement().offsetLeft;
var cursorXView = cursorX;
var cursorSpeedBonus = 0;

function getCurrentLineElement() {
    return lines[currentLine];
}

var currentKeyElement = null;

function setCurrentKeyElement(newKeyElement) {
    if (currentKeyElement != null) {
        // currentKeyElement.classList.remove('hovered');
    }

    currentKeyElement = newKeyElement;

    // currentKeyElement.classList.add("hovered");
}

function calcHoveredKeyIndex() {
    const line = getCurrentLineElement();
    var keyIndex = Math.min( line.children.length - 1, Math.floor( (cursorX - line.offsetLeft) / keyWidth ));

    var key = line.querySelectorAll(".key")[keyIndex];
    setCurrentKeyElement(key);

    return keyIndex;
}

var centerOfKey = (keyNumber) => keyNumber * keyWidth + keyWidth / 2 + getCurrentLineElement().offsetLeft;

function constrainCursorX(x) {
    const currentLine = getCurrentLineElement();
    const currentLineOffset = getCurrentLineElement().offsetLeft;

    const numKeysInLine = currentLine.children.length;
    x = Math.min( x, numKeysInLine * keyWidth + currentLineOffset - 1 );
    return Math.max( x, currentLineOffset );
}

customKeyPress = function(keyCode) { 
    if (keyCode == KeyCodes.DOWN) {
        currentLine = (currentLine + 1) % lines.length;
    } else if (keyCode == KeyCodes.UP) {
        currentLine = (currentLine - 1 + lines.length) % lines.length;
    } else if (keyCode == KeyCodes.LEFT) {
        cursorX = constrainCursorX( cursorX - keyWidth );
    } else if (keyCode == KeyCodes.RIGHT) {
        cursorX = constrainCursorX( cursorX + keyWidth )
    }
};

function draw(delta) {

    var cursorMoving = false;

    const currentLineElement = getCurrentLineElement();
    const currentLineOffset = currentLineElement.offsetLeft;

    if (keyState[KeyCodes.LEFT]) {
        cursorX -= delta * (BASE_CURSOR_SPEED + cursorSpeedBonus);
        cursorX = constrainCursorX(cursorX);
        cursorMoving = true;
    }
    if (keyState[KeyCodes.RIGHT]) {
        cursorX += delta * (BASE_CURSOR_SPEED + cursorSpeedBonus);
        cursorX = constrainCursorX(cursorX);
        cursorMoving = true;
    }

    var hoveredKey = calcHoveredKeyIndex();

    if (cursorMoving) {
        cursorSpeedBonus += delta * CURSOR_SPEED_BONUS_RATE;
        cursorSpeedBonus = Math.min(MAX_CURSOR_SPEED_BONUS, cursorSpeedBonus);
    } else {
        cursorSpeedBonus = 0;
        cursorX = centerOfKey(hoveredKey);
    }
    textDebug.textContent = cursorSpeedBonus;

    cursorDebug.style.left = cursorX + "px";

    // update actual cursor
    // cursor.style.left = cursorX + "px";
    cursorXView = ( (1 - CURSOR_SETTLE_WEIGHT) * cursorXView + CURSOR_SETTLE_WEIGHT * cursorX);
    cursor.style.left = cursorXView + "px";
    const KEYBOARD_PADDING_TOP = 20;
    cursor.style.top = (currentLine * keyWidth + keyWidth/2 + KEYBOARD_PADDING_TOP) + "px";
}



// render helper
var lastTime = 0;
function render(time) {
    if (!lastTime) {
        lastTime = time; // default to zero delta
    }

    if (window.drawing) {
        draw((time - lastTime) / 1000);
        lastTime = time;
    }
    requestAnimationFrame(render);
}
render();