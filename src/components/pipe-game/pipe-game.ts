/// <amd-dependency path="text!./pipe-game-html.html" />
/// <reference path="../../require.d.ts" />

import ko = require("knockout");

import gameboard = require("./viewmodels/gameboard");
import piece = require("./viewmodels/piece");
import enums = require("./enums");

import pieceTypes = enums.pieceTypes;
import pieceRotations = enums.pieceRotations;

export var template: string = require("text!./pipe-game-html.html");

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export class viewModel {

    board = ko.observable<gameboard>();
    height = ko.observable(9);
    width = ko.observable(4);
    curvesOnly = ko.observable(false);
    secondHeadStart = ko.observable(10);
    timeTillStart = ko.observable(0);

    private getRandomStartLocationFor(args): string{

        var y = args[1];
        var x = args[0];

        var options = [];

        if (y == 0) {
            options.push('N');
        } else if (y == this.height() - 1) {
            options.push('S');
        }

        if (x == 0) {
            options.push('W')
        } else if (x == this.width() - 1) {
            options.push('E')
        }

        return options[randomBetween(0, options.length)];
    }

    private randomizeStartAndEndLocations() {

        var startAndEndOptions = [];

        for (var y = 0; y < this.height(); y++) {
            startAndEndOptions.push([0, y]);
            startAndEndOptions.push([this.width() - 1, y]);
        }

        for (var x = 0; x < this.width(); x++) {
            startAndEndOptions.push([x, 0]);
            startAndEndOptions.push([x, this.height() - 1]);
        }

        var rand = randomBetween(0, startAndEndOptions.length);
        var newRand = rand;

        while (rand == newRand) {
            newRand = randomBetween(0, startAndEndOptions.length);
        }

        var startPosition = startAndEndOptions[rand];
        var endPosition = startAndEndOptions[newRand];

        console.log("start", startPosition);
        console.log("end", endPosition);

        this.board()
            .setStartLocation(startPosition[1], startPosition[0], this.getRandomStartLocationFor(startPosition))
            .setEndLocation(endPosition[1], endPosition[0], this.getRandomStartLocationFor(endPosition));
    };

    private intervalHandle = null;

    onGameSizeChange() {

        

        console.log("getting a new board");
        this.board(new gameboard(this.width(), this.height(), false));
        this.randomizeStartAndEndLocations();
        //this.board(new gameboard(this.width(), this.height(), false)
        //    .setStartLocation(startPosition[1], startPosition[0], this.getRandomStartLocationFor(startPosition))
        //    .setEndLocation(endPosition[1], endPosition[0], this.getRandomStartLocationFor(endPosition)));


        this.newEmptyGame();
    }

    resetAndRandomizeGame() {

        console.log("resetAndRandomizeGame");
        for (var y = 0; y < this.height(); y++) {
            for (var x = 0; x < this.width(); x++) {

                this.board().board[y][x]().piece(null);

                var randomPipeType = ((this.curvesOnly()) ?
                    pieceTypes.pipe90degrees :
                    ((randomBetween(0, 101) <= 30) ?
                        pieceTypes.pipe180degrees :
                        pieceTypes.pipe90degrees)),
                    randomPipeDirection = randomBetween(0, 4);

                new piece(randomPipeType)
                    .setRotation(randomPipeDirection)
                    .place(this.board().board[y][x]());
            }
        }

        this.randomizeStartAndEndLocations();
    }

    newEmptyGame() {

        for (var y = 0; y < this.height(); y++) {
            for (var x = 0; x < this.width(); x++) {
                this.board().board[y][x]().piece(null);
            }
        }

        this.randomizeStartAndEndLocations();
    }

    startGame() {

        this.timeTillStart(this.secondHeadStart());

        if (this.secondHeadStart() == 0) {
            this.board().startViaUI();
            return;
        }

        this.intervalHandle = window.setInterval(() => {
            var tts = this.timeTillStart();

            if (tts <= 0) {
                this.timeTillStart(0)
                window.clearInterval(this.intervalHandle);
                this.board().startViaUI();
            }
            else {
                this.timeTillStart(tts - 1);
            }
        }, 1000);
    }

    constructor() {

        this.height.subscribe(() => {
            this.onGameSizeChange();
        });

        this.width.subscribe(() => {
            this.onGameSizeChange();
        });

        this.board(new gameboard(this.width(), this.height(), false));
        this.resetAndRandomizeGame();
    }
}







