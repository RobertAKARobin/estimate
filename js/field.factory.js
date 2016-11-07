'use strict';

(function(){

	angular
		.module('estimator')
		.factory('Field', Field);

	Field.$inject = ['Choice'];

	function Field(Choice){
		var Field = {};
		Field.all = [];
		Field.create = create;
		Field.createMany = createMany;
		Field.clearAll = clearAll;
		Field.getSummary = getSummary;
		return Field;

		function createMany(input){
			for(var i = 0, l = input.length; i < l; i++){
				Field.create(input[i]);
			}
		}

		function create(field){
			var choice = {};
			Field.all.push(field);
			field.total = 0;
			field.clear = clear;
			for(var i = 0, l = field.choices.length; i < l; i++){
				choice = Choice.create(field.choices[i])
				choice.field = field;
				choice.id = [field.id, choice.id].join('_');
			}
			return field;
		}

		function clearAll(){
			for(var i = 0, l = Field.all.length; i < l; i++){
				Field.all[i].clear();
			}
		}

		function clear(){
			var field = this;
			field.total = 0;
			for(var i = 0, l = field.choices.length; i < l; i++){
				field.choices[i].clear();
			}
		}

		function getSummary(){
			var field,
					choice,
					summary,
					summaries = {
						selected: [],
						unselected: [],
						total: 0
					};
			for(var Fi = 0, Fl = Field.all.length; Fi < Fl; Fi++){
				field = Field.all[Fi];
				for(var Ci = 0, Cl = field.choices.length; Ci < Cl; Ci++){
					choice = field.choices[Ci];
					summary = {
						field: field.name,
						choice: choice.name,
						points: choice.points
					};
					if(choice.type == 'multiply'){
						summary.quantity = choice.quantity;
					}
					if(choice.value > 0){
						summaries.selected.push(summary);
						summaries.total += choice.value;
					}else{
						summaries.unselected.push(summary);
					}
				}
			}
			return summaries;
		}
	}

})();
