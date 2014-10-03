
var chart = (function() {
	'use strict';
	var spreadsheetUrl = '1JGCoMlEqUaspT-S_7UK-lVK8JfzHItdHyUQO_LYdFus';
	var data = {};
	var dictionary;

  Handlebars.registerHelper('dictionary', function(str, column, toLowerCase) {
  	str = dictionary.get(str)[column];
  	if (toLowerCase) str = str.toLowerCase();
	  return str;
	});

// Get CSS attributes from stylesheet
function getStyleRuleValue(style, selector, sheet) {
	    var sheets = typeof sheet !== 'undefined' ? [sheet] : document.styleSheets;
	    for (var i = 0, l = sheets.length; i < l; i++) {
	        var sheet = sheets[i];
	        if( !sheet.cssRules ) { continue; }
	        for (var j = 0, k = sheet.cssRules.length; j < k; j++) {
	            var rule = sheet.cssRules[j];
	            if (rule.selectorText && rule.selectorText.split(',').indexOf(selector) !== -1) {
	                return rule.style[style];
	            }
	        }
	    }
	    return null;
	}

	var expectationCategories =[ 
	{ v0: 10.45, v1: 12.5, label: 'Väldigt optimistisk', labelDetermined: 'Väldigt optimistiskt', className: 'p3'},
	{ v0: 5.45, v1: 10.45, label: 'Optimistisk', labelDetermined: 'Optimistiskt', className: 'p2'},
	{ v0: 0.45, v1: 5.45, label: 'Försiktigt optimistisk', labelDetermined: 'Försiktigt optimistiskt', className: 'p1'},
	{ v0: -0.45, v1: 0.45, label: 'Neutral', labelDetermined: 'Neutralt', className: 'neutral'},
	{ v0: -5.45, v1: -0.45, label: 'Försiktigt pessimistisk', labelDetermined: 'Försiktigt pessimistiskt', className: 'n1'},
	{ v0: -10.45, v1: -5.45, label: 'Pessimistisk', labelDetermined: 'Pessimistiskt', className: 'n2'},
	{ v0: -12.5, v1: -10.45, label: 'Väldigt pessimistisk', labelDetermined: 'Väldigt pessimistiskt', className: 'n3'}
	]
	// Add color property
	.map(function(d) {
		d.color = getStyleRuleValue('color','.'+d.className);
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

	// Get query string
	var queryString = function () {
	  var query_string = {};
	  var query = window.location.search.substring(1);
	  var vars = query.split("&");
	  for (var i=0;i<vars.length;i++) {
	    var pair = vars[i].split("=");
	      // If first entry with this name
	    if (typeof query_string[pair[0]] === "undefined") {
	      query_string[pair[0]] = pair[1];
	      // If second entry with this name
	    } else if (typeof query_string[pair[0]] === "string") {
	      var arr = [ query_string[pair[0]], pair[1] ];
	      query_string[pair[0]] = arr;
	      // If third or later entry with this name
	    } else {
	      query_string[pair[0]].push(pair[1]);
	    }
	  } 
	    return query_string;
	}();

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
	var dateMonthYearFormat = locale.timeFormat("%B %Y");


	var parseDate = locale.timeFormat("%Y-%m-%d").parse;

	var Template = function() {
	    this.cached = {};
	};
	var T = new Template();
	

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
		// Get groups and subgroups that should be shown at start from query string
		var qs = queryString;
		var show = qs.show;
		if (show) {
			// Separate groups to be shown by comma
			show.split(",").forEach(function(str) {
				// Define a a subgroup as eg. "handel_export"
				str = str.split("_");
				// If no 
				var subgroup;
				var group = data.first(function(d) {
					return str[0] == d.id;
				});
				if (str.length == 2) {
					if (group) {
						subgroup = group.subgroups.first(function(d) {
							return str[1] == d.id;
						})
					}
				}
				// Adds the "in" class that bootstrap uses to expand panels
				if (group) {
					group.show = "in";
				}
				if (subgroup) {
					subgroup.show = "in";
				}
			})
		}

		var selector = "#" + category;
		T.render('widget', function(t) {
	  		$(selector).html( t({ groups: data, category: category}) );

	  		if (qs.cat) {
	  			d3.selectAll(".nav.nav-tabs li").classed("active", function() {
	  				return d3.select(this).attr("data-category") == qs.cat;
	  			})
	  			d3.selectAll(".tab-pane").classed("active", function() {
	  				return d3.select(this).attr("id") == qs.cat;
	  			})
	  		}


	  		// Init charts
	  		d3.select(selector).selectAll(".history-chart").each(function() {
	  			var container = d3.select(this);
	  			var group = container.attr("data-group");
	  			var subgroup = container.attr("data-subgroup");
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
	  			new HistoryChart(container, values, category, group, subgroup);
	  			d3.selectAll(".loading").style("display", "none");
	  			
	  		})
    });		
	}

	var HistoryChart = (function() {
	  function HistoryChart(
	  	container, // A d3 selected element with a .history and .summary div where we draw the chart
	  	data, // An array of date-value objects
	  	category, // Industry/category 
	  	group, // The name of the group
	  	subgroup // The name of the subgroup
	  	) {
	    var self = this;
	    var w, h, date0, date1;
	    // Get size of element and define size of chart
	    self.container = container;
	    self.el = container.select(".chart");
	    self.summary = container.select(".summary");
	    var containerWidth = d3.select("#accordion")[0][0].offsetWidth * 0.9;
	    self.margin = { 
	      top: 10, 
	      bottom: 30, 
	      right: 20, 
	      left: 10
	    };
	    var m = self.margin;
	    self.width = w = (containerWidth - m.left - m.right);
	    self.height = h =  w * 0.35;

	    // Update text in chart intro
	    container.select('.chart-intro .group-name').text(dictionary.get(group).determined.toLowerCase());
	    
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
	      .attr("transform", "translate(" + m.left + "," + m.top + ")")
	      .on("mouseout", function() {
	        self.tooltip.style("visibility", "hidden")
	      })


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

	    // Init tooltips
	    self.tooltip = d3.select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .on("mouseover", function() {
        return self.tooltip.style("visibility", "hidden")
      });

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
	    	.attr("x", -self.margin.left)
	    	.attr("width", self.margin.left)
	    	.attr("height", function(d) { return Math.abs(self.y(d.v1) - self.y(d.v0)); })
	    	.attr("fill", function(d) { return d.color; })

	    self.bgAreas.append("line")
	    	.attr("x1", 0)
	    	.attr("x2", w)
	    	.attr("y1", function(d) { return d.v1 >0 ? 0 : self.y(d.v0) - self.y(d.v1); })
	    	.attr("y2", function(d) { return d.v1 >0 ? 0 : self.y(d.v0) - self.y(d.v1); })
	    	.attr("stroke", function(d) { return d.color; })
	    	.attr("class", "guideline");

	    // Zero line
	    self.chart.append("line")
	    	.attr("x1", 0)
	    	.attr("x2", w)
	    	.attr("y1", self.y(0))
	    	.attr("y2", self.y(0))
	    	.attr("class", "guideline zero")
	    	.attr("transform","translate(1,0)");



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
        /*.on("mouseover", function(d) {
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
        })*/
        .on("mouseover", function(){
          // Positioning of tooltip
          var elem = this.parentNode.childNodes[0];
          var bodyRect = document.body.getBoundingClientRect();
          var elemRect = elem.getBoundingClientRect();
          var offset = { 
                top: elemRect.top - bodyRect.top,
                left: elemRect.left - bodyRect.left
              };

          // Get the dot element from DOM
          var dot = d3.select(elem);
          var d = dot[0][0].__data__;
          var outlook = d.point[2].outlook;
          // Largen the poll circle
          dot.transition().duration(200).attr("r", self.dotSize * 2);
          return self.tooltip
            // Set tooltip content
            .html('<table><tr><td><span class="icon-arrow outlook ' + outlook.className + '"></span></td><td><date>' + dateMonthYearFormat(d.point[2].date) + '</date> ' + outlook.label+'</td></tr></table>')
            .style("visibility", "visible")
            .style("top", (offset.top - 65)+"px")
            .style("left", function() { 
              var tooltipWidth = this.getBoundingClientRect().width;
              return (offset.left - tooltipWidth / 2)+"px"})
        
        })
        // Hide tooltip on mouse out
        .on("mouseout", function(d,el,a) {
          var dot = d3.select(this.parentNode.childNodes[0]);
          dot.transition().duration(200).attr("r", self.dotSize)
        });


	    // Draw sentence
	    self.getSentences = function(data, category, group, subgroup) {
	    	// Get the last measured value and the previous
	    	var valueNow = data[0].value;
	    	var valueThen = data[1].value;
	    	// Get the current outlook
	    	var outlook = getOutlookCategory(valueNow);
	    	var outlookNow = outlook.labelDetermined.toLowerCase();
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

	    	var sentences = {};
	    	function getOutlookWithIcon(outlook) {
	    		return '<strong>' + outlook.label.toLowerCase() + '</strong>'; //' <span class="icon-arrow outlook '+ outlook.className + '"></span>';
	    	}
	    	// Sentences for groups
	    	if (!subgroup) {
	    		var subj = dictionary.get(group).determined.toLowerCase();

	    		if (category == 'industry') {
	    			sentences.long = 'Inom ' + subj + ' ser man just nu '+ getOutlookWithIcon(outlook) +'  på framtiden. ';
	    		}
	    		else if (category == 'category') {
	    			sentences.long = 'Unionens medlemmar ser just nu '+ getOutlookWithIcon(outlook) +' på framtiden för ' + subj + '. ';
	    		}
	    	}
	    	// Sentences for sub groups
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
		    	// Write sentences.long
		    	sentences.long = 'Inom ' + groupStr + ' ser man <strong>' + outlookNow + '</strong> på utvecklingen för ' + subgroupStr + ' det kommande halvåret.';
	    	}
	    	sentences.long += 'Man är '+relation+' <strong>' + amount + ' mer ' + direction + '</strong> än för sex månader sedan.';
	    	sentences.title = 'Trenden: ' + amount + ' mer ' + direction + ' än senast';
	    	return sentences;
	    } 
	    var sentences = self.getSentences(data, category, group, subgroup);
	    self.summary.select(".sentence")
	    	.html(sentences.long);

	    self.container.select(".history h5")
	    	.html(sentences.title);
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

			$.extend(Template.prototype, {
			    render: function(name, callback) {
			        if (T.isCached(name)) {
			            callback(T.cached[name]);
			        } else {
			            $.get(T.urlFor(name), function(raw) {
			                T.store(name, raw);
			                T.render(name, callback);
			            });
			        }
			    },
			    renderSync: function(name, callback) {
			        if (!T.isCached(name)) {
			            T.fetch(name);
			        }
			        T.render(name, callback);
			    },
			    prefetch: function(name) {
			        $.get(T.urlFor(name), function(raw) { 
			            T.store(name, raw);
			        });
			    },
			    fetch: function(name) {
			        // synchronous, for those times when you need it.
			        if (! T.isCached(name)) {
			            var raw = $.ajax({'url': T.urlFor(name), 'async': false}).responseText;
			            T.store(name, raw);         
			        }
			    },
			    isCached: function(name) {
			        return !!T.cached[name];
			    },
			    store: function(name, raw) {
			        T.cached[name] = Handlebars.compile(raw);
			    },
			    urlFor: function(name) {
			        return "templates/"+ name + ".hbs";
			    }
			});

			T.render('main', function(t) {
				$('#konjunkturbarometern').html( t() );

				Tabletop.init({ 
					key: spreadsheetUrl,
					callback: initChart,
					proxy: 'https://s3-eu-west-1.amazonaws.com/tabletop-proxy/unionen-konjunkturbarometern-stage/',
					debug: true
				});
			})		
		});
})();