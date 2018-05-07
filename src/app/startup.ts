/// <amd-dependency path="knockout.punches" />
/// <amd-dependency path="bootstrap" />
/// <amd-dependency path="knockout-validation" />

import debugComponent = require("components/debug/debug");
import ko = require("knockout");

// [Scaffolded component registrations will be inserted here. To retain this feature, don't remove this comment.]
ko.components.register('piece-component', { require: 'components/pipe-game/piece-component/piece-component' });
ko.components.register('pieceLocation-component', { require: 'components/pipe-game/pieceLocation-component/pieceLocation-component' });
ko.components.register('gameboard-component', { require: 'components/pipe-game/gameboard-component/gameboard-component' });
//ko.components.register('gameboard-component', {
//    viewModel: { require: 'components/pipe-game/viewmodels/gameboard' },
//    template: { require: 'text!components/pipe-game/gameboard-component/gameboard-component-html.html' }
//});

ko.components.register('pipe-game', { require: 'components/pipe-game/pipe-game' });
ko.components.register('sprite-dump', { require: 'components/sprite-dump/sprite-dump' });
ko.components.register('references-page', { require: 'components/references-page/references-page' });
ko.components.register('demo-page', { require: 'components/demo-page/demo-page' });
ko.components.register('home-page', { require: 'components/home-page/home-page' });
ko.components.register('demo-application', { require: 'components/demo-application/demo-application' });
ko.components.register('glyph-dump', { require: 'components/glyph-dump/glyph-dump' });
ko.components.register('debug', { viewModel: debugComponent.viewModel, template: debugComponent.template });


// register the component loader that goes with this custom binding handler
ko.components.loaders.unshift({

    loadViewModel: function (name, viewModelConfig, callback) {

        var newViewModelConfig = function (params: any) {

            if (params && params.isDTComponent === true) {

                if (!(params.vm instanceof viewModelConfig)) {
                    throw "'vm' property of dt-component '" + name + "', must be an instance of the component's viewmodel class";
                }

                return params.vm;
            }

            return new viewModelConfig(params);
        };

        ko.components.defaultLoader.loadViewModel(name, newViewModelConfig, callback);
    }
});

/** maps from 'dt-components' format of parameters to 'components' format of parameters */
var modifyExistingValueAccessor = function (existingValueAccessor: () => any): () => any {

    var oldReturnValue = existingValueAccessor(),
        newReturnValue = {
            name: oldReturnValue.name,
            params: {
                isDTComponent: true,
                vm: oldReturnValue.vm
            }
        },
        replacementValueAccessor = () => {
            return newReturnValue;
        };

    return replacementValueAccessor;
};

ko.bindingHandlers["dt-component"] = {

    init: function (element: HTMLElement, valueAccessor: () => any, allBindings: any, viewModel: any, bindingContext: KnockoutBindingContext) {

        var newValueAccessor = modifyExistingValueAccessor(valueAccessor);

        ko.bindingHandlers.component.init(element, newValueAccessor, allBindings, viewModel, bindingContext);
    }

}; 

ko.bindingHandlers["debugger"] = {
    init: function (element: HTMLElement, valueAccessor: () => any, allBindings: any, viewModel: any, bindingContext: KnockoutBindingContext) {
        debugger;
    }
}


// enable {{ text }} style binding with knockout punches, see this url for more info: http://mbest.github.io/knockout.punches/
ko.punches.enableAll();

ko.subscribable.fn["watch"] = function (name: string) {
    this.subscribe(function (v) {
        console.log("new value for", name, v);
    });
};

// Start the application, we can skip the viewmodel since we're just going to let the demo-app component start everything up
ko.applyBindings({});
