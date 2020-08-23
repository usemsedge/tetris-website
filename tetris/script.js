/*jslint es6 */
"use strict";


const canvas = document.getElementById(`tetris`);
const ctx = canvas.getContext(`2d`);

const ROWS = 20;
const COLUMNS = 10;
const VACANT = `white`; //vacant square color
const OUTLINE = `black`;
const SQ = 20; //square size
const EMPTY_SPACE = 0;

const LEFT_ARROW = 37;
const UP_ARROW = 38;
const RIGHT_ARROW = 39;
const DOWN_ARROW = 40;

const NO_COLLISION = 0;
const LOWER_COLLISION = 1;
const SIDE_COLLISION = 2;
const PIECE_COLLISION = 3;

const Z_COLOR = `red`;
const S_COLOR = `green`;
const J_COLOR = `blue`;
const T_COLOR = `purple`;
const L_COLOR = `orange`;
const I_COLOR = `aqua`;
const O_COLOR = `yellow`;

function make_board() {
    let board = []
    for (let y = 0; y < ROWS; y++) {
        let row = [];
        for (let x = 0; x < COLUMNS; x++) {
            row.push(EMPTY_SPACE);
        }
        board.push(row);
    }
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
            else {
                draw_square(c, r, board[r][c], OUTLINE);
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
        this.y = 0;

        this.size = this.tetromino.length;
    }
}

function draw_piece(piece_frame, x, y, color) {
    for (let row = 0; row < piece_frame.length; row++) {
        for (let col = 0; col < piece_frame[row].length; col++) {
            if (piece_frame[row][col] === 1) {
                g_board[y + row][x + col] = color;
            }
        }
    }
}

function undraw_piece(piece_frame, x, y) {
    for (let row = 0; row < piece_frame.length; row++) {
        for (let col = 0; col < piece_frame[row].length; col++) {
            if (piece_frame[row][col] === 1) {
                g_board[y + row][x + col] = EMPTY_SPACE;
            }   
        }
    }
}

function checkCollisions(piece_frame, outside_x, outside_y) { //piece is one tetromino frame
    for (let y = 0; y < piece_frame.length; y++) {
        for (let x = 0; x < piece_frame[0].length; x++) {
            if (piece_frame[y][x] === 1) {
                let current_x = outside_x + x;
                let current_y = outside_y + y;

                // collisions with the boundary
                if (current_y >= ROWS) {
                    console.log(`lower boundary collision`)
                    return LOWER_COLLISION;
                }
                if (current_x < 0 || current_x >= COLUMNS) {
                    console.log(`side boundary collision`)
                    return SIDE_COLLISION;
                }

                // collisions with other pieces
                if (g_board[current_y][current_x] !== EMPTY_SPACE) {
                    console.log(`piece collision`);
                    return PIECE_COLLISION;
                }
            }
        }
    }
    console.log(`no collision`);
    return NO_COLLISION;
}

Piece.prototype.move_down = function move_down() {
    undraw_piece(this.tetromino[this.tetrominoN], this.x, this.y);
    if (!checkCollisions(this.tetromino[this.tetrominoN], this.x, this.y + 1)) {
        this.y += 1;
    }
    draw_piece(this.tetromino[this.tetrominoN], this.x, this.y, this.color);

    draw_board(g_board);
}

Piece.prototype.move_right = function move_right() {
    undraw_piece(this.tetromino[this.tetrominoN], this.x, this.y);
    if (!checkCollisions(this.tetromino[this.tetrominoN], this.x + 1, this.y)) {
        this.x += 1;
    }
    draw_piece(this.tetromino[this.tetrominoN], this.x, this.y, this.color);

    draw_board(g_board);
}

Piece.prototype.move_left = function move_left() {
    undraw_piece(this.tetromino[this.tetrominoN], this.x, this.y);
    if (!checkCollisions(this.tetromino[this.tetrominoN], this.x - 1, this.y)) {
        this.x -= 1;
    }
    draw_piece(this.tetromino[this.tetrominoN], this.x, this.y, this.color);
    
    draw_board(g_board);
}

Piece.prototype.rotate = function rotate() {
    undraw_piece(this.tetromino[this.tetrominoN], this.x, this.y);
    if (!checkCollisions(this.tetromino[(this.tetrominoN + 1) % 4], this.x, this.y)) {
        this.tetrominoN = (this.tetrominoN + 1) % 4;
        this.active_tetromino = this.tetromino[this.tetrominoN];
    }
    draw_piece(this.tetromino[this.tetrominoN], this.x, this.y, this.color);

    draw_board(g_board);
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

