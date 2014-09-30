
var d;
var _tt;
(function() {
	'use strict';
	var spreadsheetUrl = '1JGCoMlEqUaspT-S_7UK-lVK8JfzHItdHyUQO_LYdFus';
	var data = {};
	var dictionary;
	var color = d3.scale.linear()
    .domain([12.5, 0, -12.5])
    .range(["green", "white", "red"]);
	var expectationCategories =[ 
	{ v0: 7.5, v1: 12.5, label: 'Väldigt optimistisk', labelDetermined: 'Väldigt optimistiskt', rotate: 20},
	{ v0: 2.5, v1: 7.5, label: 'Optimistisk', labelDetermined: 'Optimistiskt', rotate: 40},
	{ v0: 0.0, v1: 2.5, label: 'Försiktigt optimistisk', labelDetermined: 'Försiktigt optimistiskt', rotate: 60},
	{ v0: -2.5, v1: 0.0, label: 'Försiktigt pessimistisk', labelDetermined: 'Försiktigt pessimistiskt', rotate: 120},
	{ v0: -7.5, v1: -2.5, label: 'Pessimistisk', labelDetermined: 'Pessimistiskt', rotate: 140},
	{ v0: -12.5, v1: -7.5, label: 'Väldigt pessimistisk', labelDetermined: 'Väldigt pessimistiskt', rotate: 160}
	]
	// Add color property
	.map(function(d) {
		d.color = color((d.v1 + d.v0) / 2);
		return d;
	});




	// Misc functions
	// Takes a string and transforms it into html friendly class/id
	// Eg. "Grupp ÅÄÖ" => "grupp-aao"
	function toClassName(str) {
		return str.replace(/[\s:]/g,"-")
			.replace(/[åä]/ig,"a")
			.replace(/[ö]/ig,"o")
			.toLowerCase();
	}

	// Get first match in array
	if (!Array.prototype.first) { 
	   Array.prototype.first = function(predicate) 
	   { 
	     "use strict";    
	     if (this == null) 
	       throw new TypeError();       
	     if (typeof predicate != "function") 
	       throw new TypeError();  
	      
	     for (var i = 0; i < this.length; i++) { 
	       if (predicate(this[i])) { 
	         return this[i]; 
	       } 
	     }       
	     return null; 
	   } 
	}

	var locale = d3.locale({
	  "decimal": ",",
	  "thousands": "\xa0",
	  "grouping": [3],
	  "currency": ["", " kr"],
	  "dateTime": "%A %e %B %Y kl. %X",
	  "date": "%d.%m.%Y",
	  "time": "%H:%M:%S",
	  "periods": ["AM", "PM"],
	  "days": ["måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag", "söndag"],
	  "shortDays": ["må", "ti", "ons", "to", "fre", "lö", "sö"],
	  "months": ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"],
	  "shortMonths": ["jan", "feb", "mars", "apr", "maj", "jun", "jul", "aug", "sept", "okt", "nov", "dec"]
	});

	var parseDate = locale.timeFormat("%Y-%m-%d").parse;

	// Get exppectation cat from value
	var getOutlookCategory = function(value) {
		var cat = expectationCategories.first(function(d) {
			return (d.v0 < value && value <= d.v1);
		});
		return cat;
	}
	// Draw the accordion interface
	// Context is the data file aggregated at either industry or category level
	function drawAccordion(category, data) {
		var selector = "#" + category;
		var source = $('#konjunkturbarometern-template').html();
		var template = Handlebars.compile(source);
		var html = template({ groups: data, category: category});
		$(selector).html(html);

		// Init charts
		d3.select(selector).selectAll(".history-chart").each(function() {
			var el = d3.select(this);
			var group = el.attr("data-group");
			var subgroup = el.attr("data-subgroup");
			// Get the historical values of the category
			if (!subgroup) {
				var values = data.first(function(d) {
						return d.name == group;
					}).values;
			}
			else {
				var values = data.first(function(d) {
						return d.name == group;
					}).subgroups.first(function(d) {
						return d.name == subgroup;
					}).values;

			}
			new HistoryChart(el, values, category, group, subgroup)
			
		})
	}

	var HistoryChart = (function() {
	  function HistoryChart(
	  	elem, // A d3 selected element where we draw the chart
	  	data, // An array of date-value objects
	  	category, // Industry/category 
	  	group, // The name of the group
	  	subgroup // The name of the subgroup
	  	) {
	    var self = this;
	    var w, h, date0, date1;
	    // Get size of element and define size of chart
	    self.el = elem;
	    var containerWidth = self.el[0][0].offsetWidth;
	    containerWidth = 400;
	    self.margin = { 
	      top: 10, 
	      bottom: 30, 
	      right: 20, 
	      left: 30
	    };
	    var m = self.margin;
	    self.width = w = (containerWidth - m.left - m.right);
	    self.height = h =  w * 0.35;
	    
	    // Get date range (x axis)
	    self.date1 = date1 = data[0]['date']; // Latest
	    self.date0 = date0 = data[data.length - 1]['date']; // Oldest

	    // Set value range (y axis)
	    self.min = -9;
	    self.max = 9;


	    // Define x- and y-scale
	    self.x = d3.time.scale()
	      .range([0, w])
	      .domain([date0, date1]);

	    self.y = d3.scale.linear()
	     .range([h, 0])
	     .domain([self.min,self.max]);

	    // Init chart
	    self.svg = self.el.append('svg')
	      .attr('width', w + m.left + m.right)
	      .attr('height', h + m.top + m.bottom);

	    // Main canvas
	    self.chart = self.svg
	      .append('g')
	      .attr("transform", "translate(" + m.left + "," + m.top + ")");


	    // Init voronoi
	    var voronoi = d3.geom.voronoi()
	      .clipExtent([[0,0], [w, h]]);

	    // Transform data to voronoi format
	    var points = data.map(function(d,i) { 
	      var cord = [self.x(d.date), self.y(d.value)];
	      var outlook = getOutlookCategory(d.value);
	      return [ 
	        cord[0],
	        cord[1],
	        { 
	          date: d.date,
	          value: d.value,
	     			outlook: outlook
	        }
	        ] 
	    });

	    // Voronoify points
	    var voronoiPoints = voronoi(points);

	    // 

	    // Add background
	    self.bgAreas = self.chart.selectAll("g.bg-area")
	    	.data(expectationCategories)
	    	.enter()
	    	.append("g")
	    	.attr("class", "bg-area")
	    	.attr("transform", function(d){ 
	    		return "translate(0," + self.y(d.v1) + ")"
	    	});

	    self.bgAreas.append("rect")
	    	.attr("width", w)
	    	.attr("height", function(d) { return Math.abs(self.y(d.v1) - self.y(d.v0)); })
	    	.attr("fill", function(d) { return d.color; })
	    	.attr("stroke", "white");


	    // Add x axis
	    // X-axis
	    self.xAxis = d3.svg.axis()
	      .scale(self.x)
	     .orient("bottom")
	     .ticks(3);

	    self.chart.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + h + ")")
	      .call(self.xAxis);


	    // Add main line
	    self.line = d3.svg.line()
	      .x(function(d) { return self.x(d.point[2]['date']); })
	      .y(function(d) { return self.y(d.point[2]['value']); });

	    self.chart.append("path")
	      .datum(voronoiPoints)
	      .attr("class", "line")
	      .attr("d", self.line);

	    // Draw dots
	    // Add circles
	    self.dots = self.chart.selectAll("g.poll")
	      .data(voronoiPoints)
	      .enter()
	      .append("g")
	      .attr("class", "poll");

	    self.dotSize = 4;
	    self.dots.append("circle")
	      .attr("r", self.dotSize)
	      .attr("cx", self.dotSize / 2)
	      .attr("class", "dot")
	      .attr("transform", function(d) {
	        return "translate("+ [ d.point[0], d.point[1] ] +")"});

	    self.dots.append("path")
        .attr("class", "voronoi")
        .attr("opacity", .000001)
        .attr("d", function(d,i) { return "M" + d.join("L") + "Z"; })
        .on("mouseover", function(d) {
        	var elem = this.parentNode.childNodes[0];
        	// Get the dot element from DOM
        	var dot = d3.select(elem);
        	var d = dot[0][0].__data__;
        	// Largen the poll circle
        	dot.transition().duration(200).attr("r", self.dotSize * 3);
        })
        .on("mouseout", function(d) {
        	var elem = this.parentNode.childNodes[0];
        	// Get the dot element from DOM
        	var dot = d3.select(elem);
        	var d = dot[0][0].__data__;
        	// Largen the poll circle
        	dot.transition().duration(200).attr("r", self.dotSize);
        })


	    // Draw sentence
	    self.getSentence = function(data, category, group, subgroup) {
	    	// Get the last measured value and the previous
	    	var valueNow = data[0].value;
	    	var valueThen = data[1].value;
	    	// Get the current outlook
	    	var outlookNow = getOutlookCategory(valueNow).labelDetermined.toLowerCase();
	    	// Compare the outlook now to 6 months ago
	    	var direction = valueNow > valueThen ? "postiv" : "negativ";
	    	var relation = (valueNow > valueThen && valueNow > 0) || 
	    		(valueNow < valueThen && valueNow < 0) ? 
	    		'även' : 'dock';
	    	var amount;
	    	// Describe the difference in outlook in words
	    	var diff = Math.abs(valueNow - valueThen);
	    	if (diff < 1) { amount = "något"; }
	    	else if (diff < 2) { amount = ""; }
	    	else if (diff < 3) { amount = "betydligt"; }

	    	var sentence;
	    	if (!subgroup) {
	    		var subj = dictionary.get(group).determined.toLowerCase();

	    		if (category == 'industry') {
	    			sentence = 'Inom ' + subj + ' ser man just nu <strong>'+ outlookNow + '</strong> på framtiden. ';
	    		}
	    		else if (category == 'category') {
	    			sentence = 'Unionens medlemmar ser just nu <strong>'+ outlookNow + '</strong> på framtiden för ' + subj + '. ';
	    		}
	    	}
	    	else {
	    		// Define subjects
		    	if (category == 'industry') {
		    		var groupStr = dictionary.get(group).determined.toLowerCase();
		    		var subgroupStr = dictionary.get(subgroup).determined.toLowerCase();	
		    	}
		    	else if (category == 'category') {
		    		var groupStr = dictionary.get(subgroup).determined.toLowerCase();
			    	var subgroupStr = dictionary.get(group).determined.toLowerCase();		    		
		    	};
		    	// Write sentence
		    	sentence = 'Inom ' + groupStr + ' ser man <strong>' + outlookNow + '</strong> på utvecklingen för ' + subgroupStr + ' det kommande halvåret.';
	    	}
	    	sentence += 'Man är '+relation+' <strong>' + amount + ' mera ' + direction + '</strong> än för sex månader sedan.';
	    	return sentence;
	    } 
	    self.el.append("div")
	    	.attr("class", "sentence")
	    	.html(self.getSentence(data, category, group, subgroup))
	  }
	  return HistoryChart;
	})();
	

	// 
	function prepareData(_data) {
		_data = _data.map(function(group) {
			// Css:ify the name
			group.id = toClassName(group.name);
			
			// Get the historical means of the subgroups
			var subGroupValues = group.subgroups.map(function(d) {
				return d.values.map(function(d) { return d });
			});
			group.values = d3.transpose(subGroupValues).map(function(d) {
				return {
					date: d[0].date,
					value: d3.mean(d.map(function(d) { return d.value }))
				};
			})

			// Get the outlook as the mean of the latest subgroup values.
			var subgroupLatestValues = group.subgroups.map(function(d) {
				return d.values[0].value;
			});
			group.outlook = getOutlookCategory(d3.mean(subgroupLatestValues));
			
			// Iterate the subgroups to css:ify their names and get outlook
			group.subgroups.map(function(subgroup) {
				subgroup.id = toClassName(subgroup.name);
				subgroup.outlook = getOutlookCategory(subgroup.values[0].value);
				return subgroup;
			})
			return group;
		});
		return _data;
	}


	function initChart(resp, tt) {
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
		// A small hack to get the proper category names from the Google Spreadsheet
		// By default the category names are stripped of whitespaces etc
		var categoryNames = resp['Nyckeltal'].elements[0];
		delete resp['Nyckeltal'];

		// Get dictionary
		dictionary = d3.map({});
		resp['Ordbok'].elements.forEach(function(d){
			dictionary.set(d.word, d)
		});
		delete resp['Ordbok'];

		// Transform data
		// Aggregate industries (eg. Verkstadsindustri, Basindustri)
		data.industry = d3.entries(resp).map(function(industry) {
			industry.name = industry.key;
			industry.subgroups = industry.value.column_names.map(function(category) {
				var values = industry.value.elements.map(function(d) {
					var value = typeof d[category] !== "undefined" ? +d[category].replace(",", ".") : null;
					return {
						date: parseDate(d.datum),
						value: value
					}
				}).filter(function(d) { return !isNaN(d.value);  });
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
					var value = typeof d[category] !== "undefined" ? +d[category].replace(",", ".") : null;
					return {
						date: parseDate(d.datum),
						value: value
					}
				}).filter(function(d) { return !isNaN(d.value);  });
				return { 
					name: industry.key, 
					values: values
				};
			})
			return {
				name: categoryNames[category],
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
		drawAccordion("industry", data.industry);
		drawAccordion("category", data.category);
	}

	// Get data from AWS
	$(document).ready( function() { 
		/*d3.csv('foo_data.csv', function(err, resp) {
			console.log(resp);
			data = resp.map(function(d) {
				return { date: parseDate(d['Datum']), value: +d['Försäljningspriser'] };
			});
			new HistoryChart(d3.select("#history"),data)
				
		})*/
		
		Tabletop.init({ 
			key: spreadsheetUrl,
			callback: initChart,
			proxy: 'https://s3-eu-west-1.amazonaws.com/tabletop-proxy/unionen-konjunkturbarometern-stage/',
			debug: true
		});
	});	
})();


