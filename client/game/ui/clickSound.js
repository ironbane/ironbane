angular.module('game.ui.clickSound', [
        'game.services.globalsound',
    ])
    .directive('clickSound', ['GlobalSound', function(GlobalSound) {
        return function(scope, element, attrs) {
            var clickingCallback = function() {
                GlobalSound.play('click');
            };
            element.bind('click', clickingCallback);
        };
}]);