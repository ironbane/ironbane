angular.module('game.ui.bigMessages.bigMessagesBox', [
    'game.ui.bigMessages.bigMessagesService'
])
.directive('bigMessagesBox', ["BigMessagesService", function(BigMessagesService) {
        'use strict';

        return {
            restrict: 'EA',
            templateUrl: 'client/game/ui/bigMessages/bigMessagesBox.ng.html',
            controllerAs: 'bigMessagesBox',
            controller: function() {
                    this.messages = BigMessagesService.messages;
                },
            /*link: function(scope) {
                // speed this one up to get a more "realtime" feel
                var boost = setInterval(function() {
                    scope.$digest();
                }, 100);

                scope.$on('$destroy', function() {
                    clearInterval(boost);
                });
            }*/
        };
    }]
);
