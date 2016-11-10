'use strict';

(function(){

	angular
		.module('estimator')
		.factory('Epic', Epic);

	Epic.$inject = ['Feature'];

	function Epic(Feature){
		var Epic = {};
		Epic.all = [];
		Epic.create = create;
		Epic.createMany = createMany;
		Epic.clearAll = clearAll;
		Epic.getSummary = getSummary;
		return Epic;

		function createMany(input){
			for(var i = 0, l = input.length; i < l; i++){
				Epic.create(input[i]);
			}
		}

		function create(epic){
			var feature = {};
			Epic.all.push(epic);
			epic.total = 0;
			epic.clear = clear;
			for(var i = 0, l = epic.features.length; i < l; i++){
				feature = Feature.create(epic.features[i])
				feature.epic = epic;
				feature.id = [epic.id, feature.id].join('_');
			}
			return epic;
		}

		function clearAll(){
			for(var i = 0, l = Epic.all.length; i < l; i++){
				Epic.all[i].clear();
			}
		}

		function clear(){
			var epic = this;
			epic.total = 0;
			for(var i = 0, l = epic.features.length; i < l; i++){
				epic.features[i].clear();
			}
		}

		function getSummary(){
			var epic,
					feature,
					summary,
					summaries = {
						selected: [],
						unselected: [],
						total: 0
					};
			for(var Ei = 0, El = Epic.all.length; Ei < El; Ei++){
				epic = Epic.all[Fi];
				for(var Fi = 0, Fl = epic.features.length; Fi < Fl; Fi++){
					feature = epic.features[Fi];
					summary = {
						epic: epic.name,
						feature: feature.name,
						points: feature.points
					};
					if(feature.type == 'multiply'){
						summary.quantity = feature.quantity;
					}
					if(feature.value > 0){
						summaries.selected.push(summary);
						summaries.total += feature.value;
					}else{
						summaries.unselected.push(summary);
					}
				}
			}
			return summaries;
		}
	}

})();
