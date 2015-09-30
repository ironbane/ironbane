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
                    function($scope, $rootWorld, $log, $state, $clientSettings, dialogService, $meteor, BigMessagesService, $rootScope) {
                        $scope.gui = {
                            showChatInput: false,
                            showAdminPanel: false
                        };

                        // player commands that aren't tied to an entity
                        var inputSystem = $rootWorld.getSystem('input'),
                            openChatHandler = function() {
                                $scope.$applyAsync(function() {
                                    $scope.gui.showChatInput = true;
                                });
                            },
                            escapeHandler = function() {
                                // $log.debug('escape pressed');
                                $meteor.call('leaveGame')
                                    .then(function () {
                                        $rootScope.isTransitioning = true;
                                        setTimeout(function () {
                                            delete $rootScope.isTransitioning;
                                            $state.go('^.main-menu.enter-world');
                                        }, 1000);
                                    }, function(err) {
                                        if (err) {
                                            dialogService.alert(err.reason);
                                        }
                                    });
                            },
                            adminHandler = function() {
                                $scope.gui.showAdminPanel = !$scope.gui.showAdminPanel;
                                $clientSettings.put('isAdminPanelOpen', $scope.gui.showAdminPanel);
                            };

                        inputSystem.register('open-chat', openChatHandler);
                        inputSystem.register('escape', escapeHandler);

                        if (Roles.userIsInRole(Meteor.user(), ['game-master'])) {
                            inputSystem.register('admin-panel', adminHandler);
                        }

                        $scope.$on('$destroy', function() {
                            inputSystem.unregister('open-chat', openChatHandler);
                            inputSystem.unregister('escape', escapeHandler);
                            inputSystem.unregister('admin-panel', adminHandler);
                        });

                        $scope.resetPlayer = function () {
                            dialogService.confirm('Teleport home?').then(function () {
                                $meteor.call('resetPlayer')
                                    .then(function () {
                                        BigMessagesService.add('Teleporting home...');
                                    }, function(err) {
                                        if (err) {
                                            dialogService.alert(err.reason);
                                        }
                                    });
                            });
                        };

                        Meteor.autorun(function () {
                            var status = Meteor.status();

                            if (!status.connected &&
                                $state.current.name !== 'three-root.main-menu.enter-world') {
                                $state.go('^.main-menu.enter-world');
                                dialogService.alert('Connection lost.', 'Reload')
                                .then(function () {
                                    location.reload();
                                });
                            }
                        });

                    }
                ]
            });
        }
    ]);
