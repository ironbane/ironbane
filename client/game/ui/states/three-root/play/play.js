angular
    .module('game.ui.states.three-root.play', [
        'ui.router',
        'angular-meteor',
        'game.ui.debug.debugDiv',
        'game.ui.chat.chatBoxDirective',
        'game.ui.chat.chatService',
        'engine.entity-cache'
    ])
    .config([
        '$stateProvider',
        function($stateProvider) {
            'use strict';

            $stateProvider.state('three-root.play', {
                templateUrl: 'client/game/ui/states/three-root/play/play.ng.html',
                controller: [
                    '$scope',
                    '$rootWorld',
                    '$log',
                    '$state',
                    function($scope, $rootWorld, $log, $state) {
                        $scope.gui = {
                            showChatInput: false
                        };

                        // player commands that aren't tied to an entity
                        var inputSystem = $rootWorld.getSystem('input'),
                            openChatHandler = function() {
                                $scope.$applyAsync(function() {
                                    $scope.gui.showChatInput = true;
                                });
                            },
                            escapeHandler = function() {
                                $log.debug('escape pressed');
                                $state.go('^.main-menu.enter-world');
                            };

                        inputSystem.register('open-chat', openChatHandler);
                        inputSystem.register('escape', escapeHandler);

                        $scope.$on('$destroy', function() {
                            inputSystem.unregister('open-chat', openChatHandler);
                            inputSystem.unregister('escape', escapeHandler);
                        });
                    }
                ],
                onExit: [
                    '$entityCache',
                    '$log',
                    'ChatService',
                    function($entityCache, $log, ChatService) {
                        var mainPlayer = $entityCache.get('mainPlayer'),
                            activeChar = mainPlayer.doc;
                        $log.debug('mainPlayer', mainPlayer);

                        // the cursor in network should be watching this to remove it from the world
                        Entities.update({
                            _id: activeChar._id
                        }, {
                            $set: {
                                active: false
                            }
                        });

                        ChatService.announce(activeChar.name + ' has left the world.');
                    }
                ]
            });
        }
    ]);
