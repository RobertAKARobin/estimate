'use strict';

(function(){

	angular
		.module('estimator')
		.factory('Choice', Choice);

	function Choice(){
		var Choice = {};
		Choice.all = [];
		Choice.create = create;
		return Choice;

		function create(choice){
			Choice.all.push(choice);
			choice.type = (choice.type || 'checkbox');
			choice.points = (choice.points || 1);
			choice.calculateValue = calculateValue;
			choice.setValue = setValue;
			choice.clear = clear;
			choice.calculateValue();
			return choice;
		}

		function calculateValue(value){
			var choice = this;
			switch(choice.type){
				case 'checkbox':
					choice.value = (choice.input ? choice.points : 0);
					break;
				case 'number':
					choice.input = Math.max(choice.input, 0);
					choice.value = choice.input * choice.points;
					break;
			}
		}

		function setValue(value){
			var choice = this;
			switch(choice.type){
				case 'boolean': choice.selected = !!(value); break;
				case 'multiply': choice.quantity = (value || 0); break;
			}
		}

		function clear(){
			var choice = this;
			choice.selected = null;
			choice.quantity = 0;
		}

	}

})();
