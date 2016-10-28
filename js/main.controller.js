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
			var contact = vm.contact;
			if(!contact.email){
				vm.emailErrors = "Enter an e-mail address!";
				return;
			}
			vm.emailStatus = "sending";
			vm.emailErrors = null;
			contact.name = (contact.firstname + " " + contact.lastname);

			$http({
				method: "POST",
				url: "http://mailgun.robertakarobin.com/apps_a_la_carte",
				data: {
					email: vm.contact.email,
					firstname: vm.contact.firstname,
					lastname: vm.contact.lastname,
					hubspotutk: getCookies().hubspotutk,
					description: vm.contact.text
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

		function getCookies(){
			var pairs = document.cookie.split(/ *; */),
					pair,
					cookies = {};
			for(var i = 0, l = pairs.length; i < l; i++){
				pair = pairs[i].split("=");
				cookies[pair[0]] = pair[1];
			}
			return cookies;
		}

	}

})();
