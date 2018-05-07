/// <reference path="../../jasmine.d.ts" />

import gameboard = require("components/pipe-game/viewmodels/gameboard");
import piece = require("components/pipe-game/viewmodels/piece");
import enums = require("components/pipe-game/enums");
import pieceLocation = require("components/pipe-game/viewmodels/pieceLocation");

import pieceTypes = enums.pieceTypes;
import pieceRotations = enums.pieceRotations;

describe('piece flow logic', () => {

    beforeEach(() => {
        piece.flowStep = 25;
        piece.flowStepMsInterval = 10;
    });

    it('should spill if not piped properly', (done) => {
        
        var game = new gameboard(4, 4);
        
        game.start(() => {

            var spilledPieces = game.spillPieces();

            expect(game.hasSpill()).toBe(true);
            expect(spilledPieces.length).toBe(1);
            expect(spilledPieces[0]).toBe(game.startLocation().piece());
            expect(spilledPieces[0].spillDirectionIfAny()).toBe("E");

            done();
        });
    });

    it('should not flow when picked up', (done) => {
        var game = new gameboard(4, 4);
        game.startLocation().piece().pickup().startFlow('E', () => {
            game.pickedUpPiece().place(game.startLocation());
            var _piece = game.startLocation().piece();
            expect(_piece.flowPercent()).toBe(0);
            expect(_piece.isFlowing()).toBe(false);
            done();
        });
    });

    it('should be able start flowing and stop flowing at 100', (done) => {
        var game = new gameboard(4, 4);
        game.start(() => {
            var _piece = game.startLocation().piece();
            expect(_piece.flowPercent()).toBe(100);
            expect(_piece.isFlowing()).toBe(false);
            done();
        });
    });

    it('should flow from one pipe to another and hit a dead end', (done) => {
        var game = new gameboard(4, 4),
            destination = game.startLocation().neighbors().E,
            _piece = new piece(pieceTypes.pipe180degrees)
                .place(destination),
            _piece2 = new piece(pieceTypes.pipe90degrees)
                .rotate(true)
                .place(game.board[0][2]())
                .rotate(true);

        game.start(() => {
            expect(game.startLocation().piece().flowPercent()).toBe(100);
            expect(_piece.flowPercent()).toBe(100);
            expect(_piece2.flowPercent()).toBe(100);
            done();
        });

    });

    it('should flow through incorrect fittings', (done) => {
        var game = new gameboard(4, 4),
            destination = game.startLocation().neighbors().E,
            _piece = new piece(pieceTypes.pipe180degrees)
                .place(destination),
            _piece2 = new piece(pieceTypes.pipe90degrees)
                .rotate(true)
                .place(game.board[0][2]())
                .rotate(true),
            _piece3 = new piece(pieceTypes.pipe180degrees)
                .place(game.board[1][2]());

        game.start(() => {
            expect(game.startLocation().piece().flowPercent()).toBe(100);
            expect(_piece.flowPercent()).toBe(100);
            expect(_piece2.flowPercent()).toBe(100);
            expect(_piece3.flowPercent()).toBe(0);
            done();
        });

    });

    it('should end the game with a win under the right conditions', (done) => {

        var game: gameboard = new gameboard(3, 3, false)
                .setStartLocation(0, 0, 'W')
                .setEndLocation(0, 2, 'E'),
            _piece = new piece(pieceTypes.pipe180degrees).place(game.board[0][0]()),
            _piece2 = new piece(pieceTypes.pipe180degrees).place(game.board[0][1]()),
            _piece3 = new piece(pieceTypes.pipe180degrees).place(game.board[0][2]());

        game.start(() => {
            expect(_piece.flowPercent()).toBe(100);
            expect(_piece.flowingFrom()).toBe('W');
            expect(_piece.flowingTo()).toBe('E');

            expect(_piece2.flowPercent()).toBe(100);
            expect(_piece2.flowingFrom()).toBe('W');
            expect(_piece2.flowingTo()).toBe('E');

            expect(_piece3.flowPercent()).toBe(100);
            expect(_piece3.flowingFrom()).toBe('W');
            expect(_piece3.flowingTo()).toBe('E');

            expect(game.hasSpill()).toBe(false);
            expect(game.hasWon()).toBe(true);
            done();
        });

    });

    it('should end the game with a loss if it doesnt flow out the correct direction', (done) => {

        var game: gameboard = new gameboard(3, 3, false)
            .setStartLocation(0, 0, 'W')
            .setEndLocation(0, 2, 'E'),
            _piece = new piece(pieceTypes.pipe180degrees).place(game.board[0][0]()),
            _piece2 = new piece(pieceTypes.pipe180degrees).place(game.board[0][1]()),
            _piece3 = new piece(pieceTypes.pipe90degrees).place(game.board[0][2]()).setRotation(pieceRotations._90);

        game.start(() => {
            expect(_piece.flowPercent()).toBe(100);
            expect(_piece.flowingFrom()).toBe('W');
            expect(_piece.flowingTo()).toBe('E');

            expect(_piece2.flowPercent()).toBe(100);
            expect(_piece2.flowingFrom()).toBe('W');
            expect(_piece2.flowingTo()).toBe('E');

            expect(_piece3.flowPercent()).toBe(100);
            expect(_piece3.flowingFrom()).toBe('W');
            expect(_piece3.flowingTo()).toBe('N');

            expect(game.hasSpill()).toBe(true);
            expect(game.spillPieces()[0].spillDirectionIfAny()).toBe('N');
            expect(game.hasWon()).toBe(false);
            done();
        });

    });

    it('should end the game with a loss under the right conditions', (done) => {

        var game: gameboard = new gameboard(3, 3, false)
                .setStartLocation(0, 0, 'W')
                .setEndLocation(0, 2, 'E'),
            _piece = new piece(pieceTypes.pipe180degrees).place(game.board[0][0]()),
            _piece3 = new piece(pieceTypes.pipe180degrees).place(game.board[0][2]());

        game.start(() => {
            expect(_piece.flowPercent()).toBe(100);
            expect(game.hasSpill()).toBe(true);
            expect(_piece3.flowPercent()).toBe(0);
            expect(game.hasWon()).toBe(false);
            done();
        });

    });

    var runTest = (condition: testFlowConditions, done: () => void) => {

        var pipeType = condition.pipeType,
            flowsFrom = condition.flowsFrom,
            flowsTo = condition.flowsTo,
            rotation = condition.rotation,
            game = new gameboard(3, 3, false),
            _piece = new piece(pipeType)
                .place(game.board[1][1]())
                .setRotation(condition.rotation);

        console.log("_piece.flowsToDirections(): ", _piece.flowsToDirections());

            _piece
                .startFlow(flowsFrom, () => {
                    expect(_piece.flowPercent()).toBe(100);

                    var flowsToDirections = _piece.flowsToDirections();
                    

                    expect(flowsToDirections).toContain(flowsFrom);
                    expect(flowsToDirections).toContain(flowsTo);
                    expect(_piece.spillDirectionIfAny().length).toBe(1);
                    expect(_piece.spillDirectionIfAny()[0]).toBe(flowsTo);

                    done();
                });

    };

    describe('180 degree pipe', () => {

        it('should flow between E <-> W @ 0deg', (done) => {
            runTest({
                pipeType: pieceTypes.pipe180degrees,
                flowsFrom: 'E',
                flowsTo: 'W',
                rotation: pieceRotations._0
            }, done);
        });

        it('should flow between N <-> S @ 90deg', (done) => {
            runTest({
                pipeType: pieceTypes.pipe180degrees,
                flowsFrom: 'S',
                flowsTo: 'N',
                rotation: pieceRotations._90
            }, done);
        });

    });

    describe('90 degree pipe', () => {

        it('should flow between E <-> N @ 0deg', (done) => {
            runTest({
                pipeType: pieceTypes.pipe90degrees,
                flowsFrom: 'E',
                flowsTo: 'N',
                rotation: pieceRotations._0
            }, done);
        });

        it('should flow between N <-> W @ 90deg', (done) => {
            runTest({
                pipeType: pieceTypes.pipe90degrees,
                flowsFrom: 'N',
                flowsTo: 'W',
                rotation: pieceRotations._90
            }, done);
        });

        it('should flow between W <-> S @ 180deg', (done) => {
            runTest({
                pipeType: pieceTypes.pipe90degrees,
                flowsFrom: 'W',
                flowsTo: 'S',
                rotation: pieceRotations._180
            }, done);
        });

        it('should flow between S <-> E @ 270deg', (done) => {
            runTest({
                pipeType: pieceTypes.pipe90degrees,
                flowsFrom: 'S',
                flowsTo: 'E',
                rotation: pieceRotations._270
            }, done);
        });

    });
});

interface testFlowConditions {
    pipeType: pieceTypes;
    flowsFrom: string;
    flowsTo: string;
    rotation: pieceRotations;
}