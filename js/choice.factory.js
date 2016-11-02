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
			choice.type = (choice.type || 'boolean');
			choice.points = (choice.points || 1);
			choice.calculateValue = calculateValue;
			choice.setValue = setValue;
			choice.clear = clear;
			choice.calculateValue();
			return choice;
		}

		function calculateValue(value){
			var choice = this;
			choice.quantity = Math.max(choice.quantity, 0);
			switch(choice.type){
				case 'boolean': choice.value = (choice.selected ? choice.points : 0); break;
				case 'multiply': choice.value = (choice.points * (choice.quantity || 0)); break;
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
