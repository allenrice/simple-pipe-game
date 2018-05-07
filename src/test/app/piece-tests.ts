/// <reference path="../../jasmine.d.ts" />

import board = require("components/pipe-game/viewmodels/gameboard");
import piece = require("components/pipe-game/viewmodels/piece");
import enums = require("components/pipe-game/enums");
import pieceLocation = require("components/pipe-game/viewmodels/pieceLocation");

import pieceTypes = enums.pieceTypes;
import pieceRotations = enums.pieceRotations;



var containsAll = function (theseItems, inThisArray) {
    return theseItems.every(function (v, i) {
        return inThisArray.indexOf(v) !== -1;
    });
}

var testRotationAndBothFlowDirections = (_piece: piece, expectedDirections: string[], expectedRotation: pieceRotations) => {

    expect(_piece.rotation()).toBe(expectedRotation);
    expect(containsAll(expectedDirections, _piece.flowsToDirections())).toBe(true);

    // test flow logic at this rotation
    _piece.flowingFrom(expectedDirections[0]);

    expect(_piece.flowingTo()).toBe(expectedDirections[1]);

    _piece.flowingFrom(expectedDirections[1]);

    expect(_piece.flowingTo()).toBe(expectedDirections[0]);
}


describe('containsAll', () => {

    it('should tell you if a sequence contains all elements', () => {

        expect(containsAll(['a'], ['a', 'b', 'c'])).toBe(true);
        expect(containsAll(['a', 'b'], ['a', 'b', 'c'])).toBe(true);
        expect(containsAll(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
        expect(containsAll(['a', 'b', 'c'], ['a', 'b'])).toBe(false);

    });

});


describe('piece', () => {

    describe('ctor', () => {

        it('should be able to create a piece', () => {

            var _type = pieceTypes.pipe180degrees,
                _piece = new piece(_type);

            expect(_piece instanceof piece).toBe(true);

            expect(_piece.type).toBe(_type);

            expect(_piece.rotation()).toBe(pieceRotations._0);

        });

    });

    it('should be able to rotate', () => {

        var _piece = new piece(pieceTypes.pipe180degrees);
        var rotation: pieceRotations;

        _piece.rotation.subscribe((v) => {
            rotation = v;
        });

        var rotationsAndExpectedValues = [
            [true, pieceRotations._270],
            [true, pieceRotations._180],
            [true, pieceRotations._90],
            [true, pieceRotations._0],
            [true, pieceRotations._270],
            [false, pieceRotations._0],
            [false, pieceRotations._90],
            [false, pieceRotations._180],
            [false, pieceRotations._270],
            [false, pieceRotations._0]
        ];

        rotationsAndExpectedValues.forEach((v: any) => {
            var direction = v[0];
            var expectedValue = v[1];

            _piece.rotate(direction);
            expect(rotation).toBe(expectedValue);
        });

    });

    describe('rotation should impact flow logic', () => {

        it('for 180 degree pipes', () => {

            var _piece = new piece(pieceTypes.pipe180degrees);

            testRotationAndBothFlowDirections(_piece, ['E', 'W'], pieceRotations._0)

            _piece.rotate(true);

            testRotationAndBothFlowDirections(_piece, ['N', 'S'], pieceRotations._270)

            _piece.rotate(true);

            testRotationAndBothFlowDirections(_piece, ['E', 'W'], pieceRotations._180)

            _piece.rotate(true);

            testRotationAndBothFlowDirections(_piece, ['N', 'S'], pieceRotations._90)

            _piece.rotate(true);

            testRotationAndBothFlowDirections(_piece, ['E', 'W'], pieceRotations._0)

            _piece.setRotation(pieceRotations._90);

            testRotationAndBothFlowDirections(_piece, ['N', 'S'], pieceRotations._90)

            _piece.setRotation(pieceRotations._180);

            testRotationAndBothFlowDirections(_piece, ['E', 'W'], pieceRotations._180)

            _piece.setRotation(pieceRotations._270);

            testRotationAndBothFlowDirections(_piece, ['N', 'S'], pieceRotations._270)

        });

        it('for 90 degree pipes', () => {

            var _piece = new piece(pieceTypes.pipe90degrees);

            testRotationAndBothFlowDirections(_piece, ['N', 'E'], pieceRotations._0);

            _piece.rotate(true);

            testRotationAndBothFlowDirections(_piece, ['S', 'E'], pieceRotations._270);

            _piece.rotate(true);

            testRotationAndBothFlowDirections(_piece, ['S', 'W'], pieceRotations._180);

            _piece.rotate(true);

            testRotationAndBothFlowDirections(_piece, ['W', 'N'], pieceRotations._90);

            _piece.rotate(true);

            testRotationAndBothFlowDirections(_piece, ['N', 'E'], pieceRotations._0);

            _piece.setRotation(pieceRotations._90);

            testRotationAndBothFlowDirections(_piece, ['N', 'W'], pieceRotations._90);

            _piece.setRotation(pieceRotations._180);

            testRotationAndBothFlowDirections(_piece, ['S', 'W'], pieceRotations._180);

            _piece.setRotation(pieceRotations._270);

            testRotationAndBothFlowDirections(_piece, ['S', 'E'], pieceRotations._270);

            _piece.setRotation(pieceRotations._0);

            testRotationAndBothFlowDirections(_piece, ['N', 'E'], pieceRotations._0);
        });
    });



    it('should be able to be placed', () => {


        var _piece = new piece(pieceTypes.pipe180degrees);
        var game = new board(4, 4);

        var destination = game.board[1][1]();

        _piece.place(destination);

        expect(_piece).toBe(destination.piece());

        expect(_piece.location()).toBe(destination);

    });

    it('should be able to be placed in the same spot it was picked up from', () => {

        var location = new board(4, 4).board[1][1](),
            _piece = new piece(pieceTypes.pipe180degrees)
                .place(location)
                .pickup()
                .place(location);

        expect(_piece).toBe(location.piece());
        expect(_piece.location().gameboard.pickedUpPiece()).toBe(null);

    });

    it('should be able to be picked up and placed and have neighbors', () => {

        var game = new board(4, 4),
            sourceLocation = game.board[1][1](),
            destinationLocation = game.board[0][1](),
            _piece = new piece(pieceTypes.pipe180degrees)
                .place(sourceLocation)
                .pickup();

        // when you pick up the piece, it shouldnt be where you took it from
        expect(sourceLocation.piece()).toBeFalsy();

        expect(game.pickedUpPiece()).toBe(_piece);

        _piece.place(destinationLocation);

        expect(game.pickedUpPiece()).toBe(null);

        expect(_piece.location().neighbors().W).toBe(game.startLocation());

    });

    it('should be able to be picked up and placed around eachother', () => {
        var game = new board(4, 4),
            sourceLocation = game.board[1][1](),
            destinationLocation = game.board[0][1](),
            otherDestinationLocation = game.board[0][2](),
            _piece = new piece(pieceTypes.pipe180degrees)
                .place(sourceLocation)
                .pickup()
                .place(destinationLocation),
            _otherPiece = new piece(pieceTypes.pipe180degrees)
                .place(sourceLocation)
                .pickup()
                .place(otherDestinationLocation);


        expect(_piece.location().neighbors().E).toBe(_otherPiece.location());
        expect(_otherPiece.location().neighbors().W).toBe(_piece.location());
    });

    it('should not be able to be placed 2 to a location', () => {

        var game = new board(4, 4),
            sourceLocation = game.board[1][1](),
            destinationLocation = game.board[0][1](),
            _piece = new piece(pieceTypes.pipe180degrees)
                .place(sourceLocation)
                .pickup()
                .place(destinationLocation),
            _otherPiece = new piece(pieceTypes.pipe180degrees)
                .place(sourceLocation)
                .pickup()
                .place(destinationLocation);

        expect(game.pickedUpPiece()).toBe(_otherPiece);
        expect(destinationLocation.piece()).toBe(_piece);

    });
});
