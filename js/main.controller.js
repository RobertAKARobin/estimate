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
		vm.clearAll = clearAll;
		vm.recalculate = recalculate;
		vm.showExample = showExample;
		vm.fields = Field.all;
		vm.choices = Choice.all;
		vm.sendEmail = sendEmail;
		vm.emailStatus = 'unsent';
		vm.contact = {};
		vm.url = '';
		$http
			.get('fields.json')
			.then(Field.createMany)
			.then(updateFromQuerystring)
			.then(vm.recalculate);

		function recalculate(){
			var field,
					choice,
					querystring = [];
			vm.total = 0;
			vm.url = '';
			for(var f = {i: 0, l: Field.all.length}; f.i < f.l; f.i++){
				field = Field.all[f.i];
				field.total = 0;
				for(var c = {i: 0, l: field.choices.length}; c.i < c.l; c.i++){
					choice = field.choices[c.i];
					choice.calculateValue();
					if(choice.value){
						vm.total += choice.value;
						field.total += choice.value;
						querystring.push(choice.id + '=' + (choice.type == 'multiply' ? choice.quantity : 'true'));
					}
				}
			}
			vm.url = window.location.origin + '?' + querystring.join('&');
		}

		function updateFromQuerystring(){
			var params = {},
					querystring = window.location.search.substring(1).split('&'),
					pair,
					choice;
			for(var i = 0, l = querystring.length; i < l; i++){
				pair = querystring[i].split('=');
				params[pair[0]] = pair[1];
			}
			for(var i = 0, l = Choice.all.length; i < l; i++){
				choice = Choice.all[i];
				choice.setValue(params[choice.id]);
			}
		}

		function clearAll(){
			Field.clearAll();
			vm.recalculate();
		}

		function showExample(){
			var choice;
			for(var i = 0, l = Choice.all.length; i < l; i++){
				choice = Choice.all[i];
				choice.setValue(choice.ex);
			}
			vm.recalculate();
		}

		function sendEmail(){
			var contact = vm.contact;
			if(!contact.email){
				vm.emailErrors = 'Enter an e-mail address!';
				return;
			}
			vm.emailStatus = 'sending';
			vm.emailErrors = null;
			contact.name = (contact.firstname + ' ' + contact.lastname);

			$http({
				method: 'POST',
				url: 'http://mailgun.robertakarobin.com/apps_a_la_carte',
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
				vm.emailStatus = 'sent';
			}else{
				emailNotSent(response);
			}
		}

		function emailNotSent(response){
			vm.emailErrors = ((response.data || {}).error || 'Something went wrong. Try again!');
			vm.emailStatus = 'unsent';
		}

		function getCookies(){
			var pairs = document.cookie.split(/ *; */),
					pair,
					cookies = {};
			for(var i = 0, l = pairs.length; i < l; i++){
				pair = pairs[i].split('=');
				cookies[pair[0]] = pair[1];
			}
			return cookies;
		}

	}

})();
