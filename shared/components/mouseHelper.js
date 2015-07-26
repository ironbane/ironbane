angular
	.module('components.mouseHelper', ['ces'])
	.config([
		'$componentsProvider',
		function($componentsProvider) {
			'use strict';

			$componentsProvider.register({
				'mouseHelper': {
					range: 6
				}
			});
		}
	]);
