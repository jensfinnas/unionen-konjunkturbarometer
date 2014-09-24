
var d;
var _tt;
(function() {
	'use strict';
	var spreadsheetUrl = '1JGCoMlEqUaspT-S_7UK-lVK8JfzHItdHyUQO_LYdFus';
	var data = {};

	// Misc functions
	// Takes a string and transforms it into html friendly class/id
	// Eg. "Grupp ÅÄÖ" => "grupp-aao"
	function toClassName(str) {
		return str.replace(/\s/g,"-")
			.replace(/[åä]/ig,"a")
			.replace(/[ö]/ig,"o")
			.toLowerCase();
	}

	// Draw the accordion interface
	// Context is the data file aggregated at either industry or category level
	function drawAccordion(context) {
		var source = $('#konjunkturbarometern-template').html();
		var template = Handlebars.compile(source);
		var html = template(context);
		$(".container").html(html);
	}
	

	// 
	function prepareData(_data) {
		_data = _data.map(function(group) {
			group.id = toClassName(group.name);
			group.subgroups.map(function(subgroup) {
				subgroup.id = toClassName(subgroup.name);
				return subgroup;
			})
			return group;
		});
		return _data;
	}

	function initChart(resp, tt) {
		console.log(resp)
		_tt = tt;
		/* Data format:
		data = [
			{  
				name: "Group name",
				id: "group-name",
				outlook: "Positiv" 
				values: [
					{ 
						date: 2014-09-22,
						value: 10.2
					}
				]
				subgroups: [
					name: "Subgroup name",
					id: "subgroup-name",
					outlook: "Positiv" 
					values: [
						{ 
							date: 2014-09-22,
							value: 10.2
						}
					]

				]
			}
		]

		*/
		// A small hack to get the proper category names
		var categoryNames = resp['Nyckeltal'].elements[0];
		delete resp['Nyckeltal'];

		// Transform data
		// Aggregate industries (eg. Verkstadsindustri, Basindustri)
		data.industry = d3.entries(resp).map(function(industry) {
			industry.name = industry.key;
			industry.subgroups = industry.value.column_names.map(function(category) {
				var values = industry.value.elements.map(function(d) {
					return {
						date: d.datum,
						value: d[category]
					}
				})
				return { 
					name: categoryNames[category],
					values: values 
				};
			}).filter(function(d) { return typeof d.name !== 'undefined'; });
			delete industry.key;
			delete industry.value;
			return industry;
		})

		// Aggregate categories (eg. Orderingång, Försäljning etc)
		data.category = tt.sheets(tt.model_names[0]).column_names.map(function(category) {
			var subgroups = d3.entries(resp).map(function(industry) {
				var values = resp[industry.key].elements.map(function(d) {
					return {
						date: d.datum,
						value: d[category]
					}
				})
				return { 
					name: industry.key, 
					values: values
				};
			})
			var name = categoryNames[category];
			return {
				name: categoryName(category),
				subgroups: subgroups
			}
		}).filter(function(d) { return typeof d.name !== 'undefined'; });

		// Format data correctly:
		// - Add id:s
		// - Count subgroup means
		// - Get outlook
		data.category = prepareData(data.category);
		data.industry = prepareData(data.industry);
		
		// Draw interface
		drawAccordion(data.industry);
	}

	// Get data from AWS
	$(document).ready( function() { 
		Tabletop.init({ 
			key: spreadsheetUrl,
			callback: initChart,
			proxy: 'https://s3-eu-west-1.amazonaws.com/tabletop-proxy/unionen-konjunkturbarometern-stage/',
			debug: true
		});
	});	
})();


