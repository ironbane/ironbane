'use strict';

angular.module('game.ui.dialog', [
	'ui.bootstrap'
])
.factory('dialogService', ['$modal', function ($modal) {

	// Exampe usage:
	//
	// dialogService.alert('Holy cow!')
	// .then(function () {
	// 	console.log(arguments);
	// 	return dialogService.confirm('Is Ironbane awesome or what?');
	// })
	// .then(function () {
	// 	console.log(arguments);
	// 	return dialogService.prompt('Favorite color?');
	// })
	// .then(function () {
	// 	console.log(arguments);
	// })

	var self = {};

	self.alert = function (content, okText) {
		return $modal.open({
			templateUrl: 'client/game/ui/dialog/alertDialog.ng.html',
			controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
				$scope.content = content;
				$scope.okText = okText || 'Okay';

				$scope.ok = function () {
					$modalInstance.close(true);
				};
			}]
		}).result;
	};

	self.confirm = function (content, okText, cancelText) {
		return $modal.open({
			templateUrl: 'client/game/ui/dialog/confirmDialog.ng.html',
			controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
				$scope.content = content;
				$scope.okText = okText || 'Okay';
				$scope.cancelText = cancelText || 'Cancel';
				$scope.ok = function () {
					$modalInstance.close(true);
				};
				$scope.cancel = function () {
					$modalInstance.dismiss('cancel');
				};
			}]
		}).result;
	};

	self.prompt = function (content, okText, cancelText) {
		return $modal.open({
			templateUrl: 'client/game/ui/dialog/promptDialog.ng.html',
			controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
				$scope.placeholderText = content;
				$scope.okText = okText || 'Okay';
				$scope.cancelText = cancelText || 'Cancel';
				$scope.result = {};
				$scope.ok = function () {
					$modalInstance.close($scope.result.prompt);
				};
				$scope.cancel = function () {
					$modalInstance.dismiss('cancel');
				};
			}]
		}).result;
	};

	return self;
}]);
