var HistoryChart = (function() {
		function HistoryChart(opts) {
  		var self = this;
			var w, h, date0, date1, container, data, mini, category, group, subgroup;

    // Get size of element and define size of chart
    self.opts = opts;
    self.container = container = opts.container;
    self.data = data = opts.data;
    self.category = category = opts.category;
    self.group = group = opts.group;
    self.subgroup = subgroup = opts.subgroup;
    self.el = container.select(".chart");
		// Draw mini chart unless card is in selected state ("full report mode")
		self.mini = mini = !$(container[0][0]).parents('.card').hasClass('selected');


    var containerWidth = mini ? 45 : document.body.clientWidth * .85;
    self.margin = { 
    	top: mini ? 0 : 3, 
    	bottom: mini ? 0 : 30, 
    	right: mini ? 0 : 15, 
    	left: mini ? 3 : 5
    };
    var m = self.margin;
    self.width = w = (containerWidth - m.left - m.right);
    self.height = h =  mini ? w * 0.6 : w * 0.4;

    // Update text in chart intro
    container.select('.chart-intro .group-name').text(dictionary.get(group).determined.toLowerCase());
    
    // Get date range (x axis)
    self.date1 = date1 = data[0]['date']; // Latest
    self.date0 = date0 = data[data.length - 1]['date']; // Oldest

    // Set value range (y axis)
    self.min = mini ? -6 : -12;
    self.max = mini ? 6 : 12;


    // Define x- and y-scale
    self.x = d3.time.scale()
    .range([0, w])
    .domain([date0, date1]);

    self.y = d3.scale.linear()
    .range([h, 0])
    .domain([self.min,self.max]);

    // Init chart
    self.el.select('svg').remove();
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

    // Add color scale
    self.bgAreas = self.chart.selectAll("g.bg-area")
    .data(expectationCategories)
    .enter()
    .append("g")
    .attr("class", function(d) { return "bg-area line-" + d.className})
    .attr("transform", function(d){ 
    	return "translate(0," + self.y(d.v1) + ")"
    });

    self.bgAreas.append("rect")
    .attr("x", -self.margin.left)
    .attr("width", self.margin.left)
    .attr("height", function(d) { return Math.abs(self.y(d.v1) - self.y(d.v0)); })
    .attr("fill", function(d) { return d.color; })

    // Add guideline
    self.bgAreas.append("line")
    .attr("x1", 0)
    .attr("x2", w)
    .attr("y1", function(d) { return d.v1 >0 ? 0 : self.y(d.v0) - self.y(d.v1); })
    .attr("y2", function(d) { return d.v1 >0 ? 0 : self.y(d.v0) - self.y(d.v1); })
    .attr("stroke", function(d) { return d.color; })
    .attr("class", "guideline hide-in-overview");

    // Hack: Add extra neutral line
    self.chart.selectAll('.bg-area.line-neutral').append("line")
    	.attr("x1", 0)
    	.attr("x2", w)
    	.attr("y1", function(d) { return self.y(d.v0) - self.y(d.v1); })
    	.attr("y2", function(d) { return self.y(d.v0) - self.y(d.v1); })
    	.attr("stroke", function(d) { return d.color; })
    	.attr("class", "guideline hide-in-overview");

    // Zero line
    self.chart.append("line")
    .attr("x1", 0)
    .attr("x2", w)
    .attr("y1", self.y(0))
    .attr("y2", self.y(0))
    .attr("class", "guideline zero")
    .attr("transform","translate(1,0)");



    // Add x axis
    // Add white plate behind x-scale
    self.chart.append("rect")
    .attr("width", w + self.margin.left + self.margin.right)
    .attr("height", self.margin.bottom)
    .attr("y", h)
    .attr("x", -self.margin.left)
    .attr("fill", "#fff")

    // X-axis
    self.xAxis = d3.svg.axis()
    .scale(self.x)
    .orient("bottom")
    .ticks(3);

    self.chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + h + ")")
    .call(self.xAxis);

    // Y-labels
    self.chart.append("text")
    .attr("class", "y-label")
    .text("Optimistisk")
    .attr("x", 5)
    .attr("y", 0)
    .attr("dy", ".7em")

    self.chart.append("text")
    .attr("class", "y-label")
    .text("Pessimistisk")
    .attr("x", 5)
    .attr("y", h)
    .attr("dy", 0)

    


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
    	var direction = valueNow > valueThen ? "optimistisk" : "pessimistisk";
    	var relation = (valueNow > valueThen && valueNow > 0) || 
    	(valueNow < valueThen && valueNow < 0) ? 
    	'även' : 'dock';
    	var amount;
    	// Describe the difference in outlook in words
    	var diff = Math.abs(valueNow - valueThen);
    	if (diff < 0.5) { amount = "Lite"; }
    	else if (diff < 1.5) { amount = "Ganska"; }
        else if (diff < 2.5) { amount = "Mer"; }
    	else if (diff >= 2.5) { amount = "Betydligt"; }

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
	    sentences.trend = capitalise(amount + ' mer ') + direction;
	    sentences.trendTitle = capitalise(amount + ' mer ') + direction + ' än senast';
        return sentences;
	  } 
	  var sentences = self.getSentences(data, category, group, subgroup);

	  self.container.select(".trend .value")
	   .html(sentences.trend);

    self.container.select('h4 .trend')
      .html(sentences.trendTitle)


	}

	HistoryChart.prototype.redraw = function() {
		var self = this;
//		self.container.html('');
		return new HistoryChart(self.opts);
	}
return HistoryChart;
})();
	
	var toggleCard = function($el) {
		$('.card').toggleClass('hidden-card');
		if ($el.hasClass('selected')) {
			$el.on('click');
		}
		else {
			$el.off('click');
			var groupData = data['industry'].first(function(d) {
				return $el.attr('data-group') == d.name;
			})
			T.render('history', function(t) {
				$el.find('.history')
					.html(t( groupData ));	
			});
			T.render('subgroups', function(t) {
				$el.find('.subgroups')
					.html(t( { 
						group: $el.attr('data-group'),
						groups: groupData.subgroups
					} ));	
			})
		}
		$el.removeClass('hidden-card').toggleClass('selected');

		$cards.isotope({
			filter: ':not(.hidden-card)'
		});
	}
	function drawHistoryChart(elem) {
		var $el = $(elem);
		var category = $el.attr('data-category');
		var group = $el.attr('data-group');
		var subgroup = $el.attr('data-subgroup');
		var values = data.first(function(d) { return d.id == group; })
		if (subgroup) {
			values = values.subgroups.first(function(d) {
				return d.id == subgroup;
			})
		}

		var chart = new HistoryChart({
			container: d3.select(elem),
			data: values.values,
			category: category,
			group: group,
			subgroup: subgroup
		});
		$el.data('chart', chart);
	}
	
	function redrawHistoryChart($el) {
		var $chartContainer = $el.find('.card-section.trend .history-chart');
		var chart = $chartContainer.data('chart');
		$chartContainer.data('chart', chart.redraw());
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
  		})
    });		
	}

function _initChart(resp, tt) {
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
            dictionary.set(toClassName(d.word), d)
        });
        delete resp['Ordbok'];

        // Transform data
        // Aggregate industries (eg. Verkstadsindustri, Basindustri)
        data.industry = d3.entries(resp).map(function(industry) {
            industry.name = industry.key;
            industry.category = 'industry';
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
                category: 'category',
                subgroups: subgroups
            }
        }).filter(function(d) { return typeof d.name !== 'undefined'; });

        // Format data correctly:
        // - Add id:s
        // - Count subgroup means
        // - Get outlook
        data.category = prepareData(data.category);
        data.industry = prepareData(data.industry);
        data = data.industry.concat(data.category);
        
        // Draw interface
        //drawAccordion("industry", data.industry);
        //drawAccordion("category", data.category);

        d3.selectAll(".loading").style("display", "none");

        // Update latest update date2
        var dateValue = formatDate(data[0].values[0].date);
        $("#latest-update").html("<strong>Senaste mätningen:</strong> <date value="+dateValue+">"+dateValue+"</date>");

        drawCards();
    }