/// <reference path="../../jasmine.d.ts" />

import board = require("components/pipe-game/viewmodels/gameboard");
import piece = require("components/pipe-game/viewmodels/piece");
import enums = require("components/pipe-game/enums");
import pieceLocation = require("components/pipe-game/viewmodels/pieceLocation");

import pieceTypes = enums.pieceTypes;
import pieceRotations = enums.pieceRotations;

describe('pieceLocation', () => {

    describe('ctor', () => {

        it('should be able to create a pieceLocation', () => {
            var game = new board(4, 4);
            game.board[2][2](new pieceLocation(2, 2, game));

            var location = game.board[2][2]();

            expect(location instanceof pieceLocation).toBe(true);

        });

    });

    it('should have a reference to the gameboard', () => {
        var game = new board(4, 4);
        var location = game.board[2][2]();

        expect(game).toBe(location.gameboard);
    });

    describe('neighbors', () => {

        it('should be present', () => {

            var game = new board(4, 4),
                placeToUse = game.board[1][0](),
                neighbors = placeToUse.neighbors();

            expect(neighbors.N).toBe(game.startLocation());
            expect(neighbors.S.piece()).toBeFalsy();
            expect(neighbors.E.piece()).toBeFalsy();
            expect(neighbors.W).toBe(null);
        });

        it('shouldnt be present in certain directions when from the edge', () => {

            var height = 6, width = 5,
                game = new board(width, height);

            for (var i = 0; i < width; i++) {

                var placeToUse = game.board[0][i](),
                    neighbors = placeToUse.neighbors();

                // bottom row should have neighbors to the south, not north
                expect(neighbors.N).toBe(null);
                expect(neighbors.S instanceof pieceLocation).toBe(true);

                placeToUse = game.board[game.board.length - 1][i](),
                neighbors = placeToUse.neighbors();
                
                // top row should have neighbors to the north, not south
                expect(neighbors.S).toBe(null);
                expect(neighbors.N instanceof pieceLocation).toBe(true);
            }

            for (var i = 0; i < height; i++) {

                var placeToUse = game.board[i][0](),
                    neighbors = placeToUse.neighbors();

                // leftmost column should have neighbors to the east, not west
                expect(neighbors.W).toBe(null);
                expect(neighbors.E instanceof pieceLocation).toBe(true);

                placeToUse = game.board[i][game.board[0].length - 1](),
                neighbors = placeToUse.neighbors();
                
                // rightmost column shoul have neighbors to the west, not east
                expect(neighbors.E).toBe(null);
                expect(neighbors.W instanceof pieceLocation).toBe(true);
            }

        });

        it('should be on all sides from the middle of a 3x3', () => {

            var game = new board(3, 3),
                placeToUse = game.board[1][1](),
                neighbors = placeToUse.neighbors(),
                directions = ['N', 'E', 'S', 'W'];

            directions.forEach((v) => {
                expect(neighbors[v] instanceof pieceLocation).toBe(true);
                expect(neighbors[v].piece()).toBeFalsy();
            });

        });

        it('shouldn\'t be impacted by piece placement or rotation ', () => {

            var game = new board(4, 4),
                placeToUse = game.board[1][0](),
                newPiece = new piece(pieceTypes.pipe180degrees)
                    .place(placeToUse)
                    .rotate(true)
                    .rotate(true),                
                neighbors = placeToUse.neighbors();

            expect(neighbors.N).toBe(game.startLocation());
            expect(neighbors.S.piece()).toBeFalsy();
            expect(neighbors.E.piece()).toBeFalsy();
            expect(neighbors.W).toBe(null);
        });

    });

});