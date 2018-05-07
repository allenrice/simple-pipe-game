/// <reference path="../../jasmine.d.ts" />

import board = require("components/pipe-game/viewmodels/gameboard");
import piece = require("components/pipe-game/viewmodels/piece");
import enums = require("components/pipe-game/enums");
import pieceLocation = require("components/pipe-game/viewmodels/pieceLocation");

import pieceTypes = enums.pieceTypes;
import pieceRotations = enums.pieceRotations;

describe('gameboard ', () => {

    describe('ctor', () => {

        it('should create a game board of various sizes', () => {

            var testGameBoardCreation = function (x: number, y: number) {

                var game = new board(x, y);

                expect(game.board.length).toBe(y);
                expect(game.board[0].length).toBe(x);

                for (var i = 0; i < y; i++) {
                    for (var j = 0; j < x; j++) {
                        expect(game.board[i][j]() instanceof pieceLocation).toBe(true);
                    }
                }
            }

            testGameBoardCreation(4, 4);

            testGameBoardCreation(5, 4);

            testGameBoardCreation(4, 6);

        });

        it('should create a blank game board if you want', () => {
            var game = new board(5, 5, false);

            for (var y = 0; y < game.board.length; y++) {
                for (var x = 0; x < game.board[y].length; x++) {
                    expect(game.board[y][x]().piece()).toBeFalsy();
                }
            }

            expect(game.startLocation()).toBeFalsy();
            expect(game.endLocation()).toBeFalsy();
        });

        it('shouldn\'t start with a spill', () => {

            var game = new board(3, 3);
            expect(game.hasSpill()).toBe(false);
            expect(game.spillPieces().length).toBe(0);

        });

        it('should place the start and end pieceLocations with pieces', () => {

            var game = new board(4, 4);

            expect(game.startLocation() instanceof pieceLocation).toBe(true);
            expect(game.startLocation().piece() instanceof piece).toBe(true);
            expect(game.endLocation() instanceof pieceLocation).toBe(true);
            expect(game.endLocation().piece() instanceof piece).toBe(true);
        });

    });
});