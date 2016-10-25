'use strict';

// TODO: Split this into directives

(function(){

	angular
		.module('estimator')
		.controller('mainController', MainController);

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
			vm.reset();
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
