angular
    .module('game.ui.states.three-root.play', [
        'ui.router',
        'angular-meteor',
        'game.ui.admin.adminDiv',
        'game.ui.debug.debugDiv',
        'game.ui.chat.chatBoxDirective',
        'game.ui.dialog',
        'game.ui.clickSound',
        'engine.entity-cache',
        'game.ui.statBar',
        'game.ui.inventoryBar',
        'game.ui.inventoryItem',
        'game.ui.spritesheetImage',
        'game.ui.bigMessages.bigMessagesBox',
        'game.ui.dropZone',
        'game.ui.pickupButton',
        'game.clientSettings'
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
                    '$clientSettings',
                    'dialogService',
                    '$meteor',
                    'BigMessagesService',
                    '$rootScope',
                    '$entityCache',
                    function($scope, $rootWorld, $log, $state, $clientSettings, dialogService, $meteor, BigMessagesService, $rootScope, $entityCache) {
                        $scope.gui = {
                            showChatInput: false,
                            showAdminPanel: false
                        };

                        // player commands that aren't tied to an entity
                        var inputSystem = $rootWorld.getSystem('input'),
                            openChatHandler = function(action) {
                                $scope.$applyAsync(function() {
                                    $scope.$broadcast(action);
                                    $scope.gui.showChatInput = true;
                                });
                            },
                            escapeHandler = function() {
                                // $log.debug('escape pressed');
                                $rootScope.isTransitioning = true;
                                setTimeout(function () {
                                    $meteor.call('leaveGame')
                                        .then(function () {
                                            $state.go('^.main-menu.enter-world');
                                        }, function(err) {
                                            delete $rootScope.isTransitioning;
                                            if (err) {
                                                dialogService.alert(err.reason);
                                            }
                                        });
                                }, 1000);
                            },
                            adminHandler = function() {
                                $scope.gui.showAdminPanel = !$scope.gui.showAdminPanel;
                                $clientSettings.put('isAdminPanelOpen', $scope.gui.showAdminPanel);
                            };

                        inputSystem.register('open-chat', openChatHandler);
                        inputSystem.register('open-chat-command', openChatHandler);
                        inputSystem.register('open-chat-tell', openChatHandler);
                        inputSystem.register('escape', escapeHandler);

                        if (Roles.userIsInRole(Meteor.user(), ['game-master'])) {
                            inputSystem.register('admin-panel', adminHandler);
                        }

                        $scope.$on('$destroy', function() {
                            inputSystem.unregister('open-chat', openChatHandler);
                            inputSystem.unregister('open-chat-command', openChatHandler);
                            inputSystem.unregister('open-chat-tell', openChatHandler);
                            inputSystem.unregister('escape', escapeHandler);
                            inputSystem.unregister('admin-panel', adminHandler);
                        });

                        $scope.resetPlayer = function ($event) {
                            $event.target.blur();
                            dialogService.confirm('Teleport home?').then(function () {
                                BigMessagesService.add('Teleporting home...');
                                setTimeout(function () {
                                    $meteor.call('resetPlayer')
                                        .then(function () {

                                        }, function(err) {
                                            if (err) {
                                                dialogService.alert(err.reason);
                                            }
                                        });
                                }, 2000);
                            })
                        };

                        Meteor.autorun(function () {
                            var status = Meteor.status();

                            if (!status.connected &&
                                $state.current.name !== 'three-root.main-menu.enter-world') {
                                $state.go('^.main-menu.enter-world');
                                dialogService.alert('Connection lost.', 'Reload')
                                .then(function () {
                                    location.reload();
                                }, function () {
                                    location.reload();
                                });
                            }
                        });

                    }
                ]
            });
        }
    ]);
