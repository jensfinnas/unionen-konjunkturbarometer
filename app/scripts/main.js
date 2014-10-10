(function() {
	'use strict';
	var spreadsheetUrl = '1JGCoMlEqUaspT-S_7UK-lVK8JfzHItdHyUQO_LYdFus';
  var baseUrl = 'http://unionenopinion.se/konjunkturbarometern';
	var data = {};
	var dictionary;
	var $cards;
	var $nav;

  Handlebars.registerHelper('dictionary', function(str, column, toLowerCase) {
    str = dictionary.get(toClassName(str))[column];
  	if (toLowerCase) str = str.toLowerCase();
	  return str;
	});
	Handlebars.registerHelper('toLowerCase', function(str) {
		return str.toLowerCase();
	});
    Handlebars.registerHelper('formatDate', function(date) {
        if (typeof date !== "undefined") {
            return capitalise(formatDateMonthYear(parseDate(date)));
        }
        return "";
    });
    Handlebars.registerHelper('getOutlook', function(value, key) {
      if (typeof value !== "undefined") {
        return getOutlookCategory(value)[key];
      }
      return "";
    });
    Handlebars.registerHelper('latestUpdate', function(str) {
        var date = parseDate($('#latest-update date').attr('value'));
        return formatDateString(date);
    })

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
	{ v0: 10.45, v1: 12.5, label: 'Tydligt förbättrad', labelDetermined: 'Tydligt förbättrad', className: 'p3'},
	{ v0: 5.45, v1: 10.45, label: 'Förbättrad', labelDetermined: 'Förbättrad', className: 'p2'},
	{ v0: 0.45, v1: 5.45, label: 'Något förbättrad', labelDetermined: 'Något förbättrad', className: 'p1'},
	{ v0: -0.45, v1: 0.45, label: 'Oförändrad', labelDetermined: 'Oförändrad', className: 'neutral'},
	{ v0: -5.45, v1: -0.45, label: 'Något försämrad', labelDetermined: 'Något försämrad', className: 'n1'},
	{ v0: -10.45, v1: -5.45, label: 'Försämrad', labelDetermined: 'Försämrad', className: 'n2'},
	{ v0: -12.5, v1: -10.45, label: 'Tydligt försämrad', labelDetermined: 'Tydligt försämrad', className: 'n3'}
	]
	// Add color property
	.map(function(d) {
		d.color = getStyleRuleValue('background-color','.'+d.className);
		return d;
	});




	// =========== Helper functions ===================
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

    // Capitalise first letter in string
    function capitalise(str) {
      str = str.replace(/^\s\s*/, '');
      return str.charAt(0).toUpperCase() + str.slice(1);
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

	// Templates for Handlebars in external files
	// Templates for handlebars
	var Template = function() {
	    this.cached = {};
	};
	var T = new Template();
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
  var formatDateString = locale.timeFormat("%e %B %Y");


	var parseDate = locale.timeFormat("%Y-%m-%d").parse;
  var formatDate = locale.timeFormat("%Y-%m-%d");
  var formatDateMonthYear = locale.timeFormat("%b %Y");


	// KONJUNKTUBAROMETERN FUNCTIONS
  function getShareTexts($el) {
    return {
      msg: $el.attr('data-msg'),
      urlToShare: baseUrl + '?show=' + $el.attr('data-id')
    }
  }
  function initShareButtons() {
      // Init share buttons
      $('.twitter').click(function() {
        var $el = $(this);
        var share = getShareTexts($el);
        var tweet = share.msg + ' @Unionen ';
        var twitterUrl =  'http://twitter.com/share?url='+share.urlToShare+'&text='+encodeURIComponent(tweet);
        var width  = 575,
            height = 400,
            left   = (jQuery(window).width()  - width)  / 2,
            top    = (jQuery(window).height() - height) / 2,
            url    = share.urlToShare,
            opts   = 'status=1' +
                     ',width='  + width  +
                     ',height=' + height +
                     ',top='    + top    +
                     ',left='   + left;

        window.open(twitterUrl, 'twitter', opts);

        return false;
      })

      $('.facebook').click(function() {
        var share = getShareTexts($(this));
        var title = share.msg;
        var description = "En längre beskrivning";

        FB.ui({
          method: 'feed',
          name: title,
          link: share.urlToShare,
          picture: '',
          caption: '',
          description: description 
        });
        return false;
      })

      $('.email').click(function() {
        var $el = $(this);
        var share = getShareTexts($el);
        window.location.href = "mailto:din@kompis.com?subject=" + share.msg + "&body=" + share.urlToShare;
      })
  }
  // Get expectation cat from value
  var getOutlookCategory = function(value) {
    var cat = expectationCategories.first(function(d) {
      return (d.v0 < value && value <= d.v1);
    });
    return cat;
  }

  function drawCards() {
    T.render('cards', function(tmplCards) {
      T.render('history', function(tmplHistory){
        // Register the history template as a sub tempale
        Handlebars.registerPartial("history", tmplHistory);
        // Draw html and init isotope
        $cards
          .html( tmplCards({ groups: data }) )
          .isotope({
            itemSelector: '.card',
            layoutMode: 'fitRows',
            filter: '.foo'
          })
          // Init tooltips
          .find('.item').tooltip()
          /*.find('.history-chart').each(function() {
            drawHistoryChart(this);
          })*/

        // Resize iframe
        ri.messageParent();

        // Init share button events
        initShareButtons();

        update(parseHash());
      })
    })
  }

    // Update function
    function update(show) {
      // Clear current selection
      var $currentCard = $cards.find('.card.selected');
      $cards.find('.card').removeClass('selected').removeClass('active-category');
      // If no category selected show industry as default
      show.category = show.category || 'industry';
      $('.card[data-category=' + show.category+']').addClass('active-category');

      // Active nav buttons
      $nav.find('li').removeClass('active');
      $nav.find('li[data-category=' + show.category+']').addClass('active');
      
      // Basic filter
      var filter = '.card.active-category';
      
      // Case: card is expanded
      if (show.group) {
        var groupData = data.first(function(d) {
          return show.group == d.id;
        })
        T.render('subgroups', function(t) {
          var $el = $cards.find('.card[data-group=' + show.group + ']')
            .addClass('selected');
          
          //redrawHistoryChart($el);

          // Draw subgroups
          $el.find('.subgroups')
            .html(t( { 
              category: show.category,
              group: show.group,
              groups: groupData.subgroups
            }))
            // Init tooltips
            .find('.item').tooltip();
            /*.find('.history-chart').each(function() {
              drawHistoryChart(this);
            });*/


          filter += '.selected';
          $cards.isotope({ filter: filter });
            ri.messageParent();
        })
      }
      else {
        if ($currentCard.length > 0) {
          //redrawHistoryChart($currentCard);
        }
        $cards.isotope({ filter: filter });
          ri.messageParent();
      }
    }
	

	
	

	// 
	function prepareData(_data) {
		_data = _data.map(function(group) {
			// Css:ify the name
			group.id = toClassName(group.name);
			
			// Get the historical means of the subgroups
			var subGroupValues = group.subgroups.map(function(d) {
				return d.values
        .map(function(d) { return d })
			})
			group.values = d3.transpose(subGroupValues).map(function(d) {
        return {
					date: d[0].date,
					value: d3.mean(d.map(function(d) { return +d.value }))
				};
			}).sort(function(a, b){ return d3.ascending(a['date'], b['date']); });

			// Get the outlook as the mean of the latest subgroup values.
			var subgroupLatestValues = group.subgroups.map(function(d) {
				return +d.values[0].value;
			});
			group.outlook = getOutlookCategory(d3.mean(subgroupLatestValues));
			
			// Iterate the subgroups to css:ify their names and get outlook
			group.subgroups.map(function(subgroup) {
				subgroup.id = toClassName(subgroup.name);
				subgroup.outlook = getOutlookCategory(+subgroup.values[0].value);
				subgroup.values.sort(function(a, b){ return d3.ascending(a['date'], b['date']); });

        return subgroup;
			})
			return group;
		});
		return _data;
	}

  function initChart(resp) {
    dictionary = d3.map({});
    resp.dictionary.forEach(function(d){
      dictionary.set(toClassName(d.word), d)
    });
    data = prepareData(resp.data);
    var totalOutlook = d3.mean(data
      .filter(function(d) { return d.category == 'industry'; } )
      .map(function(group) { return d3.mean(
        group.subgroups.map(function(d) {
          return +d.values[0].value;
        })
      )
      }));
    totalOutlook = getOutlookCategory(totalOutlook);
    var $totalOutlook = $('.total-outlook').removeClass('hidden');
    $totalOutlook.find('.outlook').addClass(totalOutlook.className);
    $totalOutlook.find('.value').text(totalOutlook.label + " jämfört med tidigare");

    d3.selectAll(".loading").style("display", "none");

    // Update latest update date2
    var dateValue = "2014-10-15";
    $("#latest-update").html("<strong>Senaste mätningen:</strong> <date value="+dateValue+">"+dateValue+"</date>");

    drawCards();
  } 

	
	function parseHash() {
		var show = { category: null, group: null, subgroup: null };
		var hash = window.location.hash;
		if (hash !== "") {
			hash = hash.replace('#','').split("_");
			if (hash.length >= 1) {
				show.category = hash[0];
			}
			if (hash.length >= 2) {
				show.group = hash[1];
			}
			if (hash.length >= 3) {
				show.subgroup = hash[2];
			}
		}
		return show;
	}

	 $(window).on('hashchange', function(event) {
		  var show = parseHash();
		  update(show);
		});
		// Get data from AWS
		$(document).ready( function() {
			T.render('main', function(t) {
				$('#konjunkturbarometern').html( t() );
				$cards = $('#cards');
				$nav = $('.nav');

				$('.btn-back').click(function() { toggleCard($('.card.selected')); })
        
        // Show the production version as default
        // Set preview=1 to show the version based on preview data
        var version = 'production';
        if (queryString.preview == "1" || queryString.preview == "true") {
          version = 'stage';
          $('.preview').removeClass('hidden');
        }
				$.getJSON('https://s3-eu-west-1.amazonaws.com/tabletop-proxy/unionen-konjunkturbarometern-' + version + '/' + spreadsheetUrl + '.json', function(resp) {
          initChart(resp);
        })
        /*Tabletop.init({ 
					key: spreadsheetUrl,
					callback: initChart,
					proxy: 'https://s3-eu-west-1.amazonaws.com/tabletop-proxy/unionen-konjunkturbarometern-stage/',
					debug: true,

				});*/
			})		
		});
})();