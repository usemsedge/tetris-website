/*jslint es6 */
"use strict";


const canvas = document.getElementById(`tetris`);
const ctx = canvas.getContext(`2d`);

const ROWS = 20;
const COLUMNS = 10;
const VACANT = `white`; //vacant square color
const OUTLINE = `black`;
const SQ = 20; //square size

const LEFT_ARROW = 37;
const UP_ARROW = 38;
const RIGHT_ARROW = 39;
const DOWN_ARROW = 40;

const Z_COLOR = `red`;
const S_COLOR = `green`;
const J_COLOR = `blue`;
const T_COLOR = `purple`;
const L_COLOR = `orange`;
const I_COLOR = `aqua`;
const O_COLOR = `yellow`;

const Z_PIECE = [
    [[1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]],
    [[0, 0, 1],
    [0, 1, 1],
    [0, 1, 0]],
    [[0, 0, 0],
    [1, 1, 0],
    [0, 1, 1]],
    [[0, 1, 0],
    [1, 1, 0],
    [1, 0, 0]],
];

const S_PIECE = [
    [[0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]],
    [[0, 1, 0],
    [0, 1, 1],
    [0, 0, 1]],
    [[0, 0, 0],
    [0, 1, 1],
    [1, 1, 0]],
    [[1, 0, 0],
    [1, 1, 0],
    [0, 1, 0]]
];

const J_PIECE = [
    [[0, 1, 0],
    [0, 1, 0],
    [1, 1, 0]],
    [[1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]],
    [[0, 1, 1],
    [0, 1, 0],
    [0, 1, 0]],
    [[0, 0, 0],
    [1, 1, 1],
    [0, 0, 1]]
];

const T_PIECE = [
    [[0, 0, 0],
    [1, 1, 1],
    [0, 1, 0]],
    [[0, 1, 0],
    [1, 1, 0],
    [0, 1, 0]],
    [[0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]],
    [[0, 1, 0],
    [0, 1, 1],
    [0, 1, 0]],
];

const L_PIECE = [
    [[0, 1, 0],
    [0, 1, 0],
    [0, 1, 1]],
    [[0, 0, 0],
    [1, 1, 1],
    [1, 0, 0]],
    [[1, 1, 0],
    [0, 1, 0],
    [0, 1, 0]],
    [[0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]]
];

const I_PIECE = [
    [[0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0]],
    [[0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]],
    [[0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0]],
    [[0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0]]
];

const O_PIECE = [
    [[0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]],
    [[0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]],
    [[0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]],
    [[0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]]
];

const pieces = [Z_PIECE, S_PIECE, J_PIECE, T_PIECE, L_PIECE, I_PIECE, O_PIECE];

function make_board() {
    let one_row = Array(COLUMNS).fill(0);
    let board = Array(ROWS).fill(one_row);
    return board;
}

let g_board = make_board();
draw_board(g_board);
/**
 * Draw a board on the canvas based on square color
 * @param {Array} board A 2d array with the color of each square in a slot
 */
function draw_board(board) {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLUMNS; c++) {
            if (board[r][c] === 0) {
                draw_square(c, r, VACANT, OUTLINE);
            }
        }
    }
}

/**
 * Draw a square at a location
 * @param {int} x The x position in the square grid, not the canvas grid.
 * @param {int} y The y position in the square grid, not the canvas grid.
 * @param {string} color Square color
 * @param {string} outline_color Outline color
 */
function draw_square(x, y, color, outline_color) {
    ctx.fillStyle = color;
    ctx.fillRect(SQ * x, SQ * y, SQ, SQ);

    ctx.strokeStyle = outline_color;
    ctx.strokeRect(SQ * x, SQ * y, SQ, SQ);
}

class ShapeNotRecognized extends Error {
    constructor(message) {
        super(message);
        this.name = `ShapeNotRecognized`;
    }
}

class Piece {
    constructor(tetromino) {
        this.tetromino = tetromino;
        this.tetrominoN = 0;
        this.active_tetromino = this.tetromino[this.tetrominoN];
        switch (tetromino) {
            case Z_PIECE: this.color = Z_COLOR; break;
            case S_PIECE: this.color = S_COLOR; break;
            case J_PIECE: this.color = J_COLOR; break;
            case T_PIECE: this.color = T_COLOR; break;
            case L_PIECE: this.color = L_COLOR; break;
            case I_PIECE: this.color = I_COLOR; break;
            case O_PIECE: this.color = O_COLOR; break;
            default: throw new ShapeNotRecognized(`Shape ${this.tetromino} is not a valid shape`);
        }

        this.x = 4;
        this.y = -2;

        this.size = this.tetromino.length;
    }
}

Piece.prototype.draw_piece = function draw_piece() {
    let piece_frame = this.active_tetromino;
    for (let row = 0; row < piece_frame.length; row++) {
        for (let col = 0; col < piece_frame[row].length; col++) {
            if (piece_frame[row][col] === 1) {
                draw_square(this.x + col, this.y + row, this.color, OUTLINE);
            }
        }
    }
}

Piece.prototype.undraw_piece = function undraw_piece() {
    let piece_frame = this.active_tetromino;
    for (let row = 0; row < piece_frame.length; row++) {
        for (let col = 0; col < piece_frame[row].length; col++) {
            if (piece_frame[row][col] === 1) {
                draw_square(this.x + col, this.y + row, VACANT, OUTLINE);
            }   
        }
    }
}


function checkCollisions(piece, outside_x, outside_y) { //piece is one tetromino frame
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[0].length; x++) {
            if (piece[y][x] === 1) {
                let current_y = outside_y + y;
                if (current_y >= ROWS) {
                    return true;
                }
                let current_x = outside_x + x;
                if (current_x < 0 || current_x >= COLUMNS) {
                    return true;
                }
            }
        }
    }

    /*
    for (let x = 0; x < WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
            if (board[y][x] === 1 && this.tetromino[y - this.y][x - this.x] === 1) {
                return true;
            }
        }
    }*/
    console.log(`no collision`);
    return false;
}



Piece.prototype.move_down = function move_down() {
    if (!checkCollisions(this.tetromino[this.tetrominoN], this.x, this.y + 1)) {
        this.undraw_piece();
        this.y += 1;
        this.draw_piece();
    }
    else {
        //reached the bottom, make a new piece
    }
}

Piece.prototype.move_right = function move_right() {
    if (!checkCollisions(this.tetromino[this.tetrominoN], this.x + 1, this.y)) {
        this.undraw_piece();
        this.x += 1;
        this.draw_piece();
    }
}

Piece.prototype.move_left = function move_left() {
    if (!checkCollisions(this.tetromino[this.tetrominoN], this.x - 1, this.y)) {
        this.undraw_piece();
        this.x -= 1;
        this.draw_piece();
    }
}

Piece.prototype.rotate = function rotate() {
    if (!checkCollisions(this.tetromino[(this.tetrominoN + 1) % 4], this.x, this.y)) {
        this.undraw_piece();
        this.tetrominoN = (this.tetrominoN + 1) % 4;
        this.active_tetromino = this.tetromino[this.tetrominoN];
        this.draw_piece();
    }
}


function move_piece(event) {
    switch (event.keyCode) {
        case LEFT_ARROW: piece.move_left(); break;
        case UP_ARROW: piece.rotate(); break;
        case RIGHT_ARROW: piece.move_right(); break;
        case DOWN_ARROW: piece.move_down(); break;
    }
}

function random_piece() {
    return pieces[Math.floor(Math.random()*7)]
}

document.addEventListener(`keydown`, move_piece);
//let piece = new Piece(Z_PIECE, `blue`);

