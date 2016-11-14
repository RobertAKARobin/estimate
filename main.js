'use strict';

(function(){

	angular
		.module('estimator', [])
		.controller('mainController', MainController);

	MainController.$inject = ['$http'];

	function MainController($http){
		var vm = this;
		vm.recalculate = recalculate;
		$http
			.get('variables.json')
			.then(function loadData(response){
				angular.extend(vm, response.data);
			})
			.then(function makeGraph(){
				var range = vm.complexity_levels;
				var graph = {
					max: Math.max.apply(null, range),
					min: Math.min.apply(null, range)
				}
				graph.diff = (graph.max - graph.min) / 100;
				vm.graph = graph;
			})
			.then(recalculate);

		function recalculate(){
			var epic, feature;
			vm.total = 0;
			for(var eps = {i: 0, l: vm.epics.length}; eps.i < eps.l; eps.i++){
				epic = vm.epics[eps.i];
				epic.total = 0;
				for(var fts = {i: 0, l: epic.features.length}; fts.i < fts.l; fts.i++){
					feature = epic.features[fts.i];
					switch(feature.type){
						case 'number': epic.total += (feature.points * (feature.input || 0)); break;
						default: epic.total += (feature.input ? feature.points : 0); break;
					}
				}
				vm.total += epic.total;
			}
			vm.progress = Math.min(vm.total, vm.graph.max) / vm.graph.diff;
			vm.level = null;
			for(var i = vm.complexity_levels.length - 1; i >= 0; i--){
				if(vm.total > vm.complexity_levels[i]){
					vm.level = vm.complexity_level_descriptions[i];
					break;
				}
			}
		}

	}

})();
