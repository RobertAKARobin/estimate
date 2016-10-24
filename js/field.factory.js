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
		Field.clearAll = clearAll;
		return Field;

		function create(field){
			Field.all.push(field);
			field.total = 0;
			field.clear = clear;
			field.recalculate = recalculate;
			for(var i = 0, l = field.choices.length; i < l; i++){
				Choice.create(field.choices[i]).field = field;
			}
			return field;
		}

		function clearAll(){
			for(var i = 0, l = Field.all.length; i < l; i++){
				Field.all[i].clear();
			}
		}

		function recalculate(){
			var field = this,
					choice;
			field.total = 0;
			for(var i = 0, l = field.choices.length; i < l; i++){
				choice = field.choices[i];
				choice.calculateValue();
				field.total += choice.value;
			}
			return field.total;
		}

		function clear(){
			var field = this;
			field.total = 0;
			for(var i = 0, l = field.choices.length; i < l; i++){
				field.choices[i].clear();
			}
		}
	}

})();
