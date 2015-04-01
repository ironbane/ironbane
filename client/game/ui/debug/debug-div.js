angular.module('game.ui.debug.debugDiv', [
        'engine.debugger',
        'game.ui.debug.debugItemFilter'
    ])
    .directive('debugDiv', [
        'Debugger',
        function(Debugger) {
            'use strict';

            return {
                restrict: 'EA',
                templateUrl: 'client/game/ui/debug/debug-div.ng.html',
                controllerAs: 'debugDiv',
                controller: [
                    function() {
                        this.items = Debugger.watched;
                    }
                ]
            };
        }
    ]);
