angular.module('game.ui.admin.adminDiv', [
        'game.clientSettings'
    ])
    .directive('adminDiv', [

        function() {
            'use strict';

            return {
                restrict: 'EA',
                templateUrl: 'client/game/ui/admin/admin-div.ng.html',
                controllerAs: 'adminDiv',
                controller: function($scope, $clientSettings, CharBuilder) {

                    $scope.getImageID = function (e) {
                        $scope.imageId = (Math.floor(e.offsetX / 32)) + ((0+Math.floor(e.offsetY / 32))*16)
                    };

                    // These have to kept sync with the actual armor images in the images/characters/ folders until I figure
                    // out how these can be autoread and sent to the client
                    $scope.charImages = {
                        'body': [0, 1,10,102,11,12,16,19,2,200,203,204,205,206,23,3,4,5,6,7,8,81,82,83,9,94,95,97,99],
                        'feet': [0, 1,10,100,103,104,11,12,13,15,2,20,24,3,4,5,6,7,84,85,9],
                        'head': [0, 1,10,101,105,11,12,13,14,15,16,17,18,2,201,202,21,22,25,3,4,5,6,7,8,86,87,89,9,93,95,96,98],
                        'hair': [0, 1,1000,1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017,1018,1019,2,6],
                        'eyes': [0, 1000,1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017,1018,1019],
                        'skin': [0, 1,10,1000,1001,1002,1003,1004,1010,1011,1012,1013,1014,1020,1021,1022,1023,1024,1025,1026,1027,1028,1029,1030,1031,1032,1033,1034,1035,11,1100,2,23,24,25,26,27,28,29,3,30,32,33,34,35,36,37,40,41,42,43,44,45,46,47,650,651,652,653,655,656,657,658,659,660,661,662,664,665,666,667,668,669,670,671,672,673,674,675,676,677,678,695,700,701,772,773]
                    };

                    var updateCharacterPreview = function () {
                        var data = {};
                        _.each($scope.charPreview, function(val, key) {
                            if (['skin', 'hair', 'eyes'].indexOf(key) !== -1) {
                                data[key] = $scope.charImages[key][val];
                            }
                        });
                        $scope.charPrevData = JSON.stringify(data);
                        CharBuilder.makeChar(data).then(function (url) {
                            $scope.charPrevImg = url;
                        }, function (err) {
                            console.log(err);
                        });
                    };

                    $scope.randomize = function () {
                        $scope.charPreview = {
                            body: 0,
                            feet: 0,
                            head: 0,
                            hair: _.random(0, $scope.charImages['hair'].length - 1),
                            eyes: _.random(0, $scope.charImages['eyes'].length - 1),
                            skin: _.random(0, $scope.charImages['skin'].length - 1)
                        };
                        updateCharacterPreview();
                    };

                    $scope.charPreview = {
                        body: 0,
                        feet: 0,
                        head: 0,
                        hair: 2,
                        eyes: 1,
                        skin: 3
                    };
                    updateCharacterPreview();

                    _.each($scope.charPreview, function(val, key) {
                        $scope['next' + key] = function() {
                            $scope.charPreview[key]++;
                            if ($scope.charPreview[key] >= $scope.charImages[key].length) {
                                $scope.charPreview[key] = 0;
                            }
                            updateCharacterPreview();
                        };
                        $scope['prev' + key] = function() {
                            $scope.charPreview[key]--;
                            if ($scope.charPreview[key] < 0) {
                                $scope.charPreview[key] = $scope.charImages[key].length - 1;
                            }
                            updateCharacterPreview();
                        };
                    });

                }
            };
        }
    ]);
