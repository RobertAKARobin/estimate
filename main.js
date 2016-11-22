'use strict';

(function(){

	angular
		.module('estimator', [])
		.controller('mainController', MainController);

	MainController.$inject = ['$http'];

	function MainController($http){
		var vm = this;
		var HubspotForm = {};
		vm.isLoaded = false;
		vm.params = {};
		vm.recalculate = recalculate;
		vm.reset = reset;
		vm.showDetails = true;
		vm.exampleLink = window.location.origin + window.location.pathname + '?example';

		$http
			.get('variables.json')
			.then(function loadData(response){
				angular.extend(vm, response.data);
			})
			.then(function loadFromQueryString(){
				var pair, querystring;
				querystring = window.location.search.substring(1).split('&');
				for(var i = 0, l = querystring.length; i < l; i++){
					pair = querystring[i].split('=');
					vm.params[pair[0]] = pair[1];
				}
			})
			.then(function makeGraph(){
				var range = vm.complexity_levels;
				var graph = {
					max: Math.max.apply(null, range),
					min: 0
				}
				graph.diff = (graph.max - graph.min) / 100;
				vm.graph = graph;
			})
			.then(function(){
				recalculate();
				vm.isLoaded = true;
			})
			.then(function makeGraphSticky(){
				var el = document.getElementById('complexity');
				var placeholder = document.createElement('DIV');
				var stickyClass = 'on';
				var offset = el.offsetTop;
				var elHeight;
				calculateParameters();
				el.parentNode.insertBefore(placeholder, el.nextSibling);
				window.addEventListener('scroll', placeElement);
				window.addEventListener('resize', calculateParameters);

				function calculateParameters(){
					elHeight = el.clientHeight;
					placeholder.style.height = elHeight + 'px';
				}
				function placeElement(){
					if(offset < (document.body.scrollTop || document.documentElement.scrollTop)){
						el.classList.add(stickyClass);
					}else{
						el.classList.remove(stickyClass);
					}
				}
			})
			.then(function loadForm(){
				var script = document.createElement('SCRIPT');
				var el = document.getElementById('form');
				var linkFieldId = 'project_description__c';
				var formId = '05a6003b-845a-40a5-b0da-46dc877c1996';
				script.setAttribute('src', '//js.hsforms.net/forms/v2.js');
				el.appendChild(script);
				script.onload = function(){
					HubspotForm = hbspt.forms.create({
						css: '',
						portalId: '211554',
						formId: formId
					});
					HubspotForm.onReady(function(){
						document.getElementById(linkFieldId + '-' + formId).addEventListener('keyup', function(){
							HubspotForm.setFieldValue(linkFieldId, vm.saveLink);
						});
						HubspotForm.setFieldValue(linkFieldId, vm.saveLink);
					});
				}
			})
			.then(function hubspotAnalytics(){
				(function(d,s,i,r) {
					if (d.getElementById(i)){return;}
					var n=d.createElement(s),e=d.getElementsByTagName(s)[0];
					n.id=i;n.src='//js.hs-analytics.net/analytics/'+(Math.ceil(new Date()/r)*r)+'/211554.js';
					e.parentNode.insertBefore(n, e);
				})(document,"script","hs-analytics",300000);
			});

		function reset(){
			window.location.href = window.location.origin + window.location.pathname + '?'; // Cheap shot
		}

		function recalculate(){ // more code === better code
			var epic, feature, param, value, querystring = [];
			var is_not_numeric = /[^\d]/;
			vm.total = 0;
			for(var eps = {i: 0, l: vm.epics.length}; eps.i < eps.l; eps.i++){
				epic = vm.epics[eps.i];
				epic.total = 0;
				for(var fts = {i: 0, l: epic.features.length}; fts.i < fts.l; fts.i++){
					feature = epic.features[fts.i];
					value = 0;
					if(!vm.isLoaded){
						// Get value from qString params
						param = vm.params[feature.id];
						feature.input = (param === 'true' || param);
						// Add value to example link
						if(feature.ex){
							vm.exampleLink += '&' + feature.id + '=' + feature.ex;
						}
					}
					switch(feature.type){
						case 'number':
							if(is_not_numeric.test(feature.input)){
								feature.input = "";
							}
							if(feature.input > vm.graph.max){
								feature.input = vm.graph.max;
							}
							value = (feature.points * (feature.input || 0));
							break;
						default: value = (feature.input ? feature.points : 0); break;
					}
					if(value){
						querystring.push(feature.id + '=' + (feature.type == 'number' ? feature.input : 'true'));
					}
					epic.total += value;
				}
				vm.total += epic.total;
			}
			// Graph progress
			vm.progress = Math.min(vm.total, vm.graph.max) / vm.graph.diff;
			// Get appropriate complexity level
			vm.level = null;
			for(var i = vm.complexity_levels.length - 1; i >= 0; i--){
				if(vm.total > vm.complexity_levels[i]){
					vm.level = vm.complexity_level_descriptions[i];
					break;
				}
			}
			vm.saveLink = window.location.origin + window.location.pathname + '?' + querystring.join('&');
			if(HubspotForm.setFieldValue) HubspotForm.setFieldValue('project_description__c', vm.saveLink);
		}

	}

})();
