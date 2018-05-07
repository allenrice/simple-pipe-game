/// <amd-dependency path="text!./gameboard-component-html.html" />
/// <reference path="../../../require.d.ts" />
export var template = require("text!./gameboard-component-html.html");
export var viewModel = require("../viewmodels/gameboard");


import ko = require("knockout");
import $ = require("jquery");

import gameboard = require("../viewmodels/gameboard");
import piece = require("../viewmodels/piece");
import pieceLocation = require("../viewmodels/pieceLocation");
import enums = require("../enums");

import pieceRotations = enums.pieceRotations;
import pieceTypes = enums.pieceTypes;

ko.bindingHandlers["locationBinding"] = {
    init: function (element: HTMLElement, valueAccessor: () => pieceLocation, allBindings: any, viewModel: pieceLocation, bindingContext: KnockoutBindingContext) {

        console.log("location binding");
        
        var _location = valueAccessor();

        var classNames = ko.pureComputed<string>(() => {
            var names = [],
                pieceIfAny = (_location) ? _location.piece() : null;

            names.push((pieceIfAny) ? "piece-location" : "empty-piece-location");

            if (_location.piece() && _location.piece().spillDirectionIfAny()) {
                names.push("spilled");
            }

            if (_location === _location.gameboard.endLocation()) {
                names.push("end-location");
                names.push(_location.gameboard.endToDirection());

            }

            if (_location === _location.gameboard.startLocation()) {
                names.push("start-location");
                names.push(_location.gameboard.startFromDirection());

            }
            
            return names.join(" ");
        });

        ko.applyBindingsToNode(element, {
            css: classNames,
            click: () => {
                var piece = viewModel.gameboard.pickedUpPiece();

                if (!piece) {
                    return;
                }

                if (viewModel.piece()) {
                    return;
                }

                viewModel.gameboard.pickedUpPiece().place(viewModel);
            }
        });

    }
}

ko.bindingHandlers["pieceBinding"] = {
    init: function (element: HTMLElement, valueAccessor: () => piece, allBindings: any, viewModel: gameboard, bindingContext: KnockoutBindingContext) {

        console.log("pieceBinding");

        $(element).addClass("pipe");

        var _piece = valueAccessor();

        var classNames = ko.pureComputed<string>(() => {
            var classes = ["pipe"],
                stringValues = {};

            if (_piece && _piece.isFlowing()) {
                classes.push("flowing");
            } else if (_piece && _piece.flowPercent() == 100) {
                classes.push("flowed");
            }

            stringValues[pieceRotations._0] = "rotation0deg";
            stringValues[pieceRotations._90] = "rotation90deg";
            stringValues[pieceRotations._180] = "rotation180deg";
            stringValues[pieceRotations._270] = "rotation270deg";


            classes.push((_piece.type === pieceTypes.pipe180degrees) ? "pipe180deg" : "pipe90deg");
            classes.push(stringValues[_piece.rotation()]);


            return classes.join(" ");

        });



        ko.applyBindingsToNode(element, {
            css: classNames,
            style: {
                opacity: ko.pureComputed(() => {
                    console.log("viewModel", viewModel);
                    return .25 + (.75 * (_piece.flowPercent() / 100));
                })
            },
            click: () => { _piece.rotate(true); }
        });

    }
};

ko.bindingHandlers["pickup"] = {
    init: function (element: HTMLElement, valueAccessor: () => pieceTypes, allBindings: any, viewModel: gameboard, bindingContext: KnockoutBindingContext) {
        
        var value = valueAccessor();
        
        ko.applyBindingsToNode(element, {
            click: () => {

                if (viewModel.pickedUpPiece()) {
                    return;
                }
                
                viewModel.pickedUpPiece(new piece(value));
            }
        });
        
    }
}

ko.bindingHandlers["gameBinding"] = {
    init: function (element: HTMLElement, valueAccessor: () => gameboard, allBindings: any, viewModel: gameboard, bindingContext: KnockoutBindingContext) {
        var value = valueAccessor();

        
        ko.applyBindingsToNode(element, {
            
            css: {
                'won': viewModel.hasWon,
                'lost': viewModel.hasSpill,
                'item-in-hand': viewModel.pickedUpPiece,
                'item-in-hand-is-90-deg-bend': ko.pureComputed(() => {
                    var _piece = viewModel.pickedUpPiece();

                    if (!_piece) { return false; }

                    return _piece.type === pieceTypes.pipe90degrees;

                }),
                'item-in-hand-is-180-deg-pipe': ko.pureComputed(() => {
                    var _piece = viewModel.pickedUpPiece();

                    if (!_piece) { return false; }

                    return _piece.type === pieceTypes.pipe180degrees;

                })
                
            }
        });

    }
}
