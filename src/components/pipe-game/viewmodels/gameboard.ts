import ko = require("knockout");

import piece = require("./piece");
import pieceLocation = require("./pieceLocation");
import enums = require("components/pipe-game/enums");
import shape = require("./shape");

import pieceTypes = enums.pieceTypes;

class gameboard {

    public board: KnockoutObservable<pieceLocation>[][];

    public startLocation = ko.observable<pieceLocation>();

    public startFromDirection = ko.observable<string>();

    public endLocation = ko.observable<pieceLocation>();

    public endToDirection = ko.observable<string>();

    public hasSpill: KnockoutComputed<boolean>;

    public hasWon: KnockoutComputed<boolean>;

    public spillPieces: KnockoutComputed<piece[]>;

    public pickedUpPiece = ko.observable<piece>();

    public start(callback: () => void): gameboard   {
        return this
            .startLocation()
            .piece()
            .startFlow(this.startFromDirection(), callback)
            .location()
            .gameboard;
    };

    public startViaUI() {
        this.start(() => {
            console.log('done');
        });
    }

    constructor(x: number, y: number, useStandardLayout: boolean = true) {

        this.createBoard(x, y)
            .setupLocationComputeds();

        if (useStandardLayout === true) {
            this.placePieces(x, y);
        }

    }

    public setStartLocation(y: number, x: number, directionToStartFrom: string): gameboard {
        this.startLocation(this.board[y][x]());
        this.startFromDirection(directionToStartFrom);
        return this;
    }

    public setEndLocation(y: number, x: number, directionToExit: string): gameboard {
        this.endLocation(this.board[y][x]());
        this.endToDirection(directionToExit);
        return this;
    }

    public createBoard(x: number, y: number): gameboard {

        this.board = new Array(y);

        for (var i = 0; i < y; i++) {
            this.board[i] = new Array(x);

            for (var j = 0; j < x; j++) {
                this.board[i][j] = ko.observable(new pieceLocation(j, i, this));
            }
            
        }

        return this;

    }
   
    public placePieces(x: number, y: number): gameboard {

        var board = this.board;
        var spot = board[0][0];
        var observed = spot();

        this.startLocation(this.board[0][0]());
        this.endLocation(this.board[y - 1][x - 1]());

        var startPiece = new piece(pieceTypes.pipe180degrees).place(this.startLocation()),
            endPiece = new piece(pieceTypes.pipe180degrees).place(this.endLocation());

        this.start = (callback) => {
            this.startLocation().piece().startFlow('W', callback);
            return this;
        };

        return this;
    }

    //public setStartCallback(startCallback: (callback: () => void) => gameboard): gameboard {

    //    this.start = startCallback;

    //    return this;
    //}

    public setupLocationComputeds(): gameboard {

        this.spillPieces = ko.pureComputed(() => {
            var spills : piece[] = [];
            for (var y = 0; y < this.board.length; y++) {
                for (var x = 0; x < this.board[0].length; x++) {
                    var piece = this.board[y][x]().piece(),
                        spillDirection = (piece) ? piece.spillDirectionIfAny() : null;

                    if (spillDirection) {
                        spills.push(piece);
                    }
                }
            }
            return spills;
        });

        this.hasSpill = ko.pureComputed(() => {
            var sp = this.spillPieces();
            return sp && sp.length > 0;
        });

        this.hasWon = ko.pureComputed(() => {

            var endLocation = this.endLocation();

            if (!endLocation || !endLocation.piece) {
                return false;
            }

            var endPiece = endLocation.piece();

            if (!endPiece) {
                return false;
            }

            return endPiece.flowPercent() === 100 && this.endToDirection() === endPiece.flowingTo();
        });

        return this;
    }
}

export = gameboard;