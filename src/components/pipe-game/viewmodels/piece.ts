
import ko = require("knockout");

import enums = require("components/pipe-game/enums");
import neighbors = require("./neighbors");
import pieceLocation = require("./pieceLocation");

import pieceTypes = enums.pieceTypes;
import pieceRotations = enums.pieceRotations;

class piece {

    public static flowStep = .75;
    public static flowStepMsInterval = 2;
    private timeoutInterval: number;

    public type: pieceTypes;

    public location = ko.observable<pieceLocation>();
    public rotation = ko.observable(pieceRotations._0);
    public flowPercent = ko.observable(0);
    public flowingFrom = ko.observable<string>();
    public spillDirectionIfAny = ko.observable<string>(); // in the future this will probably be an obs array

    public isFlowing = ko.pureComputed<boolean>(() => {
        var amountFlowed = this.flowPercent();
        return amountFlowed !== 0 && amountFlowed !== 100;
    });

    public isPickedUp = ko.pureComputed<boolean>(() => {
        return (!this.location() || !this.location().piece());
    });

    public flowsToDirections = ko.pureComputed<string[]>(() => {

        var rotatersByType = this.getRotators(),
            flowsToDirections = rotatersByType[this.type][this.rotation()];

        return flowsToDirections;
    });

    public flowsTo = ko.pureComputed<pieceLocation[]>(() => {

        var neighbors = this.location().neighbors(),
            flowsToDirections = this.flowsToDirections(),
            flowsToPieceLocations = flowsToDirections.map((v) => {
                return neighbors[v];
            });

        return flowsToPieceLocations;

    });

    public flowingTo = ko.pureComputed(() => {

        var directions = this.flowsToDirections();

        var flowingToDirection = (directions[0] === this.flowingFrom()) ? directions[1] : directions[0];

        return flowingToDirection;

    });

    public incrementFlowPercent() {
        var newAmount = Math.min(this.flowPercent() + piece.flowStep, 100);
        this.flowPercent(newAmount);
        return newAmount;
    }

    
    public flowStepCallback(cb) {

        if (this.incrementFlowPercent() !== 100) {
            return;
        }

        window.clearInterval(this.timeoutInterval);

        var flowedAnywhere = false,
            neighbors = this.location().neighbors(),
            flowingToDirection = this.flowingTo(),
            locationCurrentlyFlowingTo = <pieceLocation>neighbors[flowingToDirection],
            endLocation = this.location().gameboard.endLocation(),
            userBeatLevel = (endLocation && endLocation.piece() === this && endLocation.gameboard.endToDirection() === flowingToDirection);

        console.log("this flows from ", this.flowsToDirections(), "and is currently flowing", flowingToDirection);

        if (userBeatLevel) {
            cb();
            return;
        }

        if (!locationCurrentlyFlowingTo) {
            console.debug("didnt find anything to the ", flowingToDirection);
            this.spillDirectionIfAny(flowingToDirection);
            cb();
            return;
        }

        if (locationCurrentlyFlowingTo.piece()) {

            var flowingFromForNewFlow = this.flipDirection(flowingToDirection),
                newPiece = locationCurrentlyFlowingTo.piece(),
                adjacentPieceHasNoInlet = (newPiece.flowsToDirections().indexOf(flowingFromForNewFlow) === -1);

            if (adjacentPieceHasNoInlet) {
                console.debug("cant flow to the ", flowingToDirection, ", there's a bad fitting");
                this.spillDirectionIfAny(flowingToDirection);
                cb();
                return;
            }

            newPiece.startFlow(flowingFromForNewFlow, cb);
            return;
        }
        else {
            console.debug("hit an empty cell going ", flowingToDirection, ", stopping flow, setting spill direction to ", flowingToDirection);
            this.spillDirectionIfAny(flowingToDirection);
            cb();
            return;
        }

        console.debug("ending the flow");
        this.spillDirectionIfAny(flowingToDirection);
        cb();
        
    }

    public startFlow(fromTheDirection: string, cb: () => void): piece {

        

        if (this.isPickedUp()) {
            console.log("is picked up, not starting the flow");
            cb();
            return this;
        }

        if (this.flowsToDirections().indexOf(fromTheDirection) == -1) {
            throw "can't flow from the " + fromTheDirection + ", this pipe only flows from " + this.flowsToDirections()[0] + " to " + this.flowsToDirections()[1];
        }

        console.log("starting flow from the direction of", fromTheDirection);

        this.flowingFrom(fromTheDirection);

        this.timeoutInterval = setInterval(() => { this.flowStepCallback(cb); }, piece.flowStepMsInterval);

        return this;
    }

    public pickup(): piece {
        this.location().piece(null);
        this.location().gameboard.pickedUpPiece(this);
        return this;
    }

    public setRotation(deg: pieceRotations): piece {
        if (this.flowPercent() > 0) {
            return this;
        }
        this.rotation(deg);
        console.log("this flows", this.flowsToDirections());
        return this;
    }

    public rotate(clockwise: boolean): piece {

        var newRotation = this.rotation() + (clockwise ? -1 : 1);

        if (newRotation > enums.pieceRotations._270) {
            newRotation = enums.pieceRotations._0;
        }
        else if (newRotation < enums.pieceRotations._0) {
            newRotation = enums.pieceRotations._270;
        }

        return this.setRotation(newRotation);
    }

    public place(location: pieceLocation): piece {
        if (location.piece()) {
            return this;
        }
        location.piece(this);
        location.gameboard.pickedUpPiece(null);
        this.location(location);
        return this;
    }

    public flipDirection(direction: string) {
        var reverseDirection = {
            'N': 'S',
            'S': 'N',
            'E': 'W',
            'W': 'E'
        };

        return reverseDirection[direction];
    }

    public getRotators(): { [pieceType: string]: { [pieceRotation: string]: string[] } } {

        var rotatersByType: { [pieceType: string]: { [pieceRotation: string]: string[] } } = {};

        rotatersByType[pieceTypes.pipe180degrees] = {};
        rotatersByType[pieceTypes.pipe180degrees][pieceRotations._180] = rotatersByType[pieceTypes.pipe180degrees][pieceRotations._0] = ['E', 'W'];
        rotatersByType[pieceTypes.pipe180degrees][pieceRotations._90] = rotatersByType[pieceTypes.pipe180degrees][pieceRotations._270] = ['N', 'S'];

        rotatersByType[pieceTypes.pipe90degrees] = {};
        rotatersByType[pieceTypes.pipe90degrees][pieceRotations._0] = ['E', 'N'];
        rotatersByType[pieceTypes.pipe90degrees][pieceRotations._90] = ['N', 'W'];
        rotatersByType[pieceTypes.pipe90degrees][pieceRotations._180] = ['W', 'S'];
        rotatersByType[pieceTypes.pipe90degrees][pieceRotations._270] = ['S', 'E'];

        return rotatersByType;
    }

    constructor(pieceType: pieceTypes) {
        this.type = pieceType;

        this.flowPercent.subscribe((v) => {
            console.debug("flowing from the ", this.flowingFrom(), ": ", v, "%");
        });

        this.setRotation(pieceRotations._0);

        this.spillDirectionIfAny.subscribe((v) => {
            console.log("cleanup on isle y,x", v);
        });
    }

}

export = piece;