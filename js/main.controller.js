'use strict';

// TODO: Split this into directives

(function(){

	angular
		.module('estimator')
		.controller('mainController', MainController);

	MainController.$inject = ['$http', 'Epic', 'Feature'];

	function MainController($http, Epic, Feature){
		var vm = this;
		vm.total = 0;
		vm.clearAll = clearAll;
		vm.recalculate = recalculate;
		vm.showExample = showExample;
		vm.epics = Epic.all;
		vm.features = Feature.all;
		vm.sendEmail = sendEmail;
		vm.emailStatus = 'unsent';
		vm.contact = {};
		vm.levels = [];
		vm.devs = [];
		vm.url = '';
		$http
			.get('variables.json')
			.then(function(response){
				var epics = response.data.epics;
				vm.levels = response.data.levels;
				vm.devs = response.data.devs;
				for(var i = 0, l = vm.devs.length; i < l; i++){
					vm.devs[i].id = vm.devs[i].name.toLowerCase().replace(/ /g,"_");
				}
				Epic.createMany(epics);
			})
			.then(updateFromQuerystring)
			.then(vm.recalculate);

		function recalculate(){
			var epic,
					feature,
					querystring = [];
			vm.total = 0;
			vm.url = '';
			for(var f = {i: 0, l: Epic.all.length}; f.i < f.l; f.i++){
				epic = Epic.all[f.i];
				epic.total = 0;
				for(var c = {i: 0, l: epic.features.length}; c.i < c.l; c.i++){
					feature = epic.features[c.i];
					feature.calculateValue();
					if(feature.value){
						vm.total += feature.value;
						epic.total += feature.value;
						querystring.push(feature.id + '=' + (feature.type == 'multiply' ? feature.quantity : 'true'));
					}
				}
			}
			vm.url = window.location.origin + '?' + querystring.join('&');
		}

		function updateFromQuerystring(){
			var params = {},
					querystring = window.location.search.substring(1).split('&'),
					pair,
					feature;
			for(var i = 0, l = querystring.length; i < l; i++){
				pair = querystring[i].split('=');
				params[pair[0]] = pair[1];
			}
			for(var i = 0, l = Feature.all.length; i < l; i++){
				feature = Feature.all[i];
				feature.setValue(params[feature.id]);
			}
		}

		function clearAll(){
			Epic.clearAll();
			vm.recalculate();
		}

		function showExample(){
			var feature;
			for(var i = 0, l = Feature.all.length; i < l; i++){
				feature = Feature.all[i];
				feature.setValue(feature.ex);
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
