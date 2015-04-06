angular.module('game.ui.directives')
    .directive('ibFocus', [
        '$timeout',
        function($timeout) {
            'use strict';

            return {
                link: function(scope, element, attrs) {
                    scope.$watch(attrs.ibFocus, function(val) {
                        if (angular.isDefined(val) && val) {
                            $timeout(function() {
                                element[0].focus();
                            });
                        }
                    }, true);

                    element.bind('blur', function() {
                        if (angular.isDefined(attrs.ibFocusLost)) {
                            scope.$apply(attrs.ibFocusLost);
                        }
                    });
                }
            };
        }
    ]);
