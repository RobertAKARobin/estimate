'use strict';

(function(){

	angular
		.module('estimator')
		.factory('Feature', Feature);

	function Feature(){
		var Feature = {};
		Feature.all = [];
		Feature.create = create;
		return Feature;

		function create(feature){
			Feature.all.push(feature);
			feature.type = (feature.type || 'checkbox');
			feature.points = (feature.points || 1);
			feature.calculateValue = calculateValue;
			feature.setValue = setValue;
			feature.clear = clear;
			feature.calculateValue();
			return feature;
		}

		function calculateValue(value){
			var feature = this;
			switch(feature.type){
				case 'checkbox':
					feature.value = (feature.input ? feature.points : 0);
					break;
				case 'number':
					feature.input = (Math.max(feature.input, 0) || "");
					feature.value = feature.input * feature.points;
					break;
			}
		}

		function setValue(value){
			var feature = this;
			switch(feature.type){
				case 'boolean': feature.selected = !!(value); break;
				case 'multiply': feature.quantity = (value || 0); break;
			}
		}

		function clear(){
			var feature = this;
			feature.selected = null;
			feature.quantity = 0;
		}

	}

})();
