import ko = require("knockout");

import piece = require("./piece");
import gameboard = require("./gameboard");
import neighbors = require("./neighbors");

class pieceLocation {

    public piece = ko.observable<piece>();
    public gameboard: gameboard;

    public neighbors: KnockoutComputed<neighbors>;

    constructor(x: number, y: number, game: gameboard) {

        this.gameboard = game;
        this.neighbors = ko.pureComputed(() => {
            return {
                N: (y === 0) ? null : game.board[y - 1][x](), // decrease y to go north
                S: (y === game.board.length - 1) ? null : game.board[y + 1][x](), // increase y to go south
                W: (x === 0) ? null : game.board[y][x - 1](), // decrease x to go west
                E: (x === game.board[0].length - 1) ? null : game.board[y][x+1]() // increase x  to go east
            };
        });
    }
}

export = pieceLocation;