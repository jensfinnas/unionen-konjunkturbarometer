
var d;
var tt;
(function() {
	'use strict';
	var spreadsheetUrl = '1JGCoMlEqUaspT-S_7UK-lVK8JfzHItdHyUQO_LYdFus';

	function showInfo(data, tabletop) {
		data = d3.entries(data).map(function(d) {
			d['id'] = d['key'].replace(/ /g,"").replace(/åä/ig, "a").replace(/ö/ig, "o")
			return d;
		});

		console.log(data);
		d = data;
		tt = tabletop;
		// Draw html with handlebars
		var source = $('#konjunkturbarometern-template').html();
		var template = Handlebars.compile(source);
		var html = template(data);
		$(".container").html(html);



	}

	$(document).ready( function() { 
		Tabletop.init({ 
			key: spreadsheetUrl,
			callback: showInfo,
			proxy: 'https://s3-eu-west-1.amazonaws.com/tabletop-proxy/unionen-konjunkturbarometern-stage/',
			debug: true
		});
	});	
})();


