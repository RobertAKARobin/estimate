'use strict';

(function(){

	angular
		.module('off-the-shelf-app', [])
		.factory('Field', Field)
		.factory('Choice', Choice)
		.controller('mainController', MainController);


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


	MainController.$inject = ['$http', 'Field', 'Choice'];

	function MainController($http, Field, Choice){
		var vm = this;
		vm.total = 0;
		vm.reset = clearAll;
		vm.update = updateToField;
		vm.showExample = showExample;
		vm.fields = Field.all;
		vm.choices = Choice.all;
		vm.sendEmail = sendEmail;
		vm.emailStatus = "unsent";
		vm.contact = {};
		$http.get('fields.json').then(onLoad);

		function onLoad(response){
			for(var i = 0, l = response.data.length; i < l; i++){
				Field.create(response.data[i]);
			}
		}

		function updateToField(field){
			vm.total = 0;
			field.recalculate();
			for(var i = 0, l = Field.all.length; i < l; i++){
				vm.total += Field.all[i].total;
			}
		}

		function clearAll(){
			vm.total = 0;
			Field.clearAll();
		}

		function showExample(){
			var choice;
			for(var i = 0, l = Choice.all.length; i < l; i++){
				choice = Choice.all[i];
				choice.clear();
				if(choice.showIfExample()){
					updateToField(choice.field);
				}
			}
		}

		function sendEmail(){
			var choices = getFieldSummary();
			if(!vm.contact.email){
				vm.emailErrors = "Enter an e-mail address!";
				return;
			}
			vm.emailStatus = "sending";
			vm.emailErrors = null;
			$http({
				method: "POST",
				url: "http://mailgun.robertakarobin.com/send",
				data: {
					contact: vm.contact,
					choices: choices,
				}
			}).then(emailSent, emailNotSent);
		}

		function emailSent(response){
			if(response.data.success){
				vm.emailStatus = "sent";
			}else{
				emailNotSent(response);
			}
		}

		function emailNotSent(response){
			vm.emailErrors = ((response.data || {}).error || "Something went wrong. Try again!");
			vm.emailStatus = "unsent";
		}

		function getFieldSummary(){
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
