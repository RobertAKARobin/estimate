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
			choice.showIfExample = showIfExample;
			choice.clear = clear;
			choice.calculateValue();
			return choice;
		}

		function calculateValue(){
			var choice = this,
					output = 0;
			if(choice.quantity < 0) choice.quantity = 0;
			switch(choice.type){
				case 'boolean': output = (choice.selected ? choice.points : 0); break;
				case 'multiply': output = (choice.points * (choice.quantity || 0)); break;
			}
			choice.value = output;
			return output;
		}

		function showIfExample(){
			var choice = this;
			if(choice.ex){
				switch(choice.type){
					case 'boolean': choice.selected = true; break;
					case 'multiply': choice.quantity = choice.ex; break;
				}
				return true;
			}else{
				return false;
			}
		}

		function clear(){
			var choice = this;
			choice.selected = null;
			choice.quantity = 0;
		}

		function randomPoints(){
			return (0 + Math.floor(Math.random() * 3) * 1);
		}
	}

})();
