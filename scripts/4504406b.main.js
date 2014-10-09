!function(){"use strict";function a(a,b,c){for(var d="undefined"!=typeof c?[c]:document.styleSheets,e=0,f=d.length;f>e;e++){var c=d[e];if(c.cssRules)for(var g=0,h=c.cssRules.length;h>g;g++){var i=c.cssRules[g];if(i.selectorText&&-1!==i.selectorText.split(",").indexOf(b))return i.style[a]}}return null}function b(a){return a.replace(/[\s:]/g,"-").replace(/[åä]/gi,"a").replace(/[ö]/gi,"o").toLowerCase()}function c(a){return a=a.replace(/^\s\s*/,""),a.charAt(0).toUpperCase()+a.slice(1)}function d(a){return{msg:a.attr("data-msg"),urlToShare:q+"?show="+a.attr("data-id")}}function e(){$(".twitter").click(function(){var a=$(this),b=d(a),c=b.msg+" @Unionen ",e="http://twitter.com/share?url="+b.urlToShare+"&text="+encodeURIComponent(c),f=575,g=400,h=(jQuery(window).width()-f)/2,i=(jQuery(window).height()-g)/2,j=(b.urlToShare,"status=1,width="+f+",height="+g+",top="+i+",left="+h);return window.open(e,"twitter",j),!1}),$(".facebook").click(function(){var a=d($(this)),b=a.msg,c="En längre beskrivning";return FB.ui({method:"feed",name:b,link:a.urlToShare,picture:"",caption:"",description:c}),!1}),$(".email").click(function(){var a=$(this),b=d(a);window.location.href="mailto:din@kompis.com?subject="+b.msg+"&body="+b.urlToShare})}function f(a){var b=$(a),c=b.attr("data-category"),d=b.attr("data-group"),e=b.attr("data-subgroup"),f=r.first(function(a){return a.id==d});e&&(f=f.subgroups.first(function(a){return a.id==e}));var g=new B({container:d3.select(a),data:f.values,category:c,group:d,subgroup:e});b.data("chart",g)}function g(){u.render("cards",function(a){u.render("history",function(b){Handlebars.registerPartial("history",b),n.html(a({groups:r})).isotope({itemSelector:".card",layoutMode:"fitRows",filter:".foo"}).find(".history-chart").each(function(){f(this)}),ri.messageParent(),e(),i(l())})})}function h(a){var b=a.find(".card-section.trend .history-chart"),c=b.data("chart");b.data("chart",c.redraw())}function i(a){var b=n.find(".card.selected");n.find(".card").removeClass("selected").removeClass("active-category"),a.category=a.category||"industry",$(".card[data-category="+a.category+"]").addClass("active-category"),o.find("li").removeClass("active"),o.find("li[data-category="+a.category+"]").addClass("active");var c=".card.active-category";if(a.group){var d=r.first(function(b){return a.group==b.id});u.render("subgroups",function(b){var e=n.find(".card[data-group="+a.group+"]").addClass("selected");h(e),e.find(".subgroups").html(b({category:a.category,group:a.group,groups:d.subgroups})).find(".history-chart").each(function(){f(this)}),c+=".selected",n.isotope({filter:c}),ri.messageParent()})}else b.length>0&&h(b),n.isotope({filter:c}),ri.messageParent()}function j(a){return a=a.map(function(a){a.id=b(a.name);var c=a.subgroups.map(function(a){return a.values.map(function(a){return a})});a.values=d3.transpose(c).map(function(a){return{date:a[0].date,value:d3.mean(a.map(function(a){return a.value}))}});var d=a.subgroups.map(function(a){return a.values[0].value});return a.outlook=C(d3.mean(d)),a.subgroups.map(function(a){return a.id=b(a.name),a.outlook=C(a.values[0].value),a}),a})}function k(a,c){var d=a.Nyckeltal.elements[0];delete a.Nyckeltal,m=d3.map({}),a.Ordbok.elements.forEach(function(a){m.set(b(a.word),a)}),delete a.Ordbok,r.industry=d3.entries(a).map(function(a){return a.name=a.key,a.category="industry",a.subgroups=a.value.column_names.map(function(b){var c=a.value.elements.map(function(a){var c="undefined"!=typeof a[b]?+a[b].replace(",","."):null;return{date:y(a.datum),value:c}}).filter(function(a){return!isNaN(a.value)});return{name:d[b],values:c}}).filter(function(a){return"undefined"!=typeof a.name}),delete a.key,delete a.value,a}),r.category=c.sheets(c.model_names[0]).column_names.map(function(b){var c=d3.entries(a).map(function(c){var d=a[c.key].elements.map(function(a){var c="undefined"!=typeof a[b]?+a[b].replace(",","."):null;return{date:y(a.datum),value:c}}).filter(function(a){return!isNaN(a.value)});return{name:c.key,values:d}});return{name:d[b],category:"category",subgroups:c}}).filter(function(a){return"undefined"!=typeof a.name}),r.category=j(r.category),r.industry=j(r.industry),r=r.industry.concat(r.category),d3.selectAll(".loading").style("display","none");var e=z(r[0].values[0].date);$("#latest-update").html("<strong>Senaste mätningen:</strong> <date value="+e+">"+e+"</date>"),g()}function l(){var a={category:null,group:null,subgroup:null},b=window.location.hash;return""!==b&&(b=b.replace("#","").split("_"),b.length>=1&&(a.category=b[0]),b.length>=2&&(a.group=b[1]),b.length>=3&&(a.subgroup=b[2])),a}var m,n,o,p="1JGCoMlEqUaspT-S_7UK-lVK8JfzHItdHyUQO_LYdFus",q="http://unionenopinion.se/konjunkturbarometern-test",r={};Handlebars.registerHelper("dictionary",function(a,c,d){return a=m.get(b(a))[c],d&&(a=a.toLowerCase()),a}),Handlebars.registerHelper("toLowerCase",function(a){return a.toLowerCase()}),Handlebars.registerHelper("formatDate",function(a){return"undefined"!=typeof a?c(A(a)):""}),Handlebars.registerHelper("getOutlook",function(a,b){return"undefined"!=typeof a?C(a)[b]:""}),Handlebars.registerHelper("latestUpdate",function(){var a=y($("#latest-update date").attr("value"));return x(a)});var s=[{v0:10.45,v1:12.5,label:"Tydligt förbättrad",labelDetermined:"Tydligt förbättrad",className:"p3"},{v0:5.45,v1:10.45,label:"Förbättrad",labelDetermined:"Förbättrad",className:"p2"},{v0:.45,v1:5.45,label:"Något förbättrad",labelDetermined:"Något förbättrad",className:"p1"},{v0:-.45,v1:.45,label:"Oförändrad",labelDetermined:"Oförändrad",className:"neutral"},{v0:-5.45,v1:-.45,label:"Något försämrad",labelDetermined:"Något försämrad",className:"n1"},{v0:-10.45,v1:-5.45,label:"Försämrad",labelDetermined:"Försämrad",className:"n2"},{v0:-12.5,v1:-10.45,label:"Tydligt försämrad",labelDetermined:"Tydligt försämrad",className:"n3"}].map(function(b){return b.color=a("background-color","."+b.className),b});Array.prototype.first||(Array.prototype.first=function(a){if(null==this)throw new TypeError;if("function"!=typeof a)throw new TypeError;for(var b=0;b<this.length;b++)if(a(this[b]))return this[b];return null});var t=(function(){for(var a={},b=window.location.search.substring(1),c=b.split("&"),d=0;d<c.length;d++){var e=c[d].split("=");if("undefined"==typeof a[e[0]])a[e[0]]=e[1];else if("string"==typeof a[e[0]]){var f=[a[e[0]],e[1]];a[e[0]]=f}else a[e[0]].push(e[1])}return a}(),function(){this.cached={}}),u=new t;$.extend(t.prototype,{render:function(a,b){u.isCached(a)?b(u.cached[a]):$.get(u.urlFor(a),function(c){u.store(a,c),u.render(a,b)})},renderSync:function(a,b){u.isCached(a)||u.fetch(a),u.render(a,b)},prefetch:function(a){$.get(u.urlFor(a),function(b){u.store(a,b)})},fetch:function(a){if(!u.isCached(a)){var b=$.ajax({url:u.urlFor(a),async:!1}).responseText;u.store(a,b)}},isCached:function(a){return!!u.cached[a]},store:function(a,b){u.cached[a]=Handlebars.compile(b)},urlFor:function(a){return"templates/"+a+".hbs"}});var v=d3.locale({decimal:",",thousands:" ",grouping:[3],currency:[""," kr"],dateTime:"%A %e %B %Y kl. %X",date:"%d.%m.%Y",time:"%H:%M:%S",periods:["AM","PM"],days:["måndag","tisdag","onsdag","torsdag","fredag","lördag","söndag"],shortDays:["må","ti","ons","to","fre","lö","sö"],months:["januari","februari","mars","april","maj","juni","juli","augusti","september","oktober","november","december"],shortMonths:["jan","feb","mars","apr","maj","jun","jul","aug","sept","okt","nov","dec"]}),w=v.timeFormat("%B %Y"),x=v.timeFormat("%e %B %Y"),y=v.timeFormat("%Y-%m-%d").parse,z=v.timeFormat("%Y-%m-%d"),A=v.timeFormat("%b %Y"),B=function(){function a(a){var b,d,e,f,g,h,i,j,k,l,n=this;n.opts=a,n.container=g=a.container,n.data=h=a.data,n.category=j=a.category,n.group=k=a.group,n.subgroup=l=a.subgroup,n.el=g.select(".chart"),n.mini=i=!$(g[0][0]).parents(".card").hasClass("selected");var o=i?45:.85*document.body.clientWidth;n.margin={top:i?0:3,bottom:i?0:30,right:i?0:15,left:i?3:5};var p=n.margin;n.width=b=o-p.left-p.right,n.height=d=i?.6*b:.4*b,g.select(".chart-intro .group-name").text(m.get(k).determined.toLowerCase()),n.date1=f=h[0].date,n.date0=e=h[h.length-1].date,n.min=i?-6:-12,n.max=i?6:12,n.x=d3.time.scale().range([0,b]).domain([e,f]),n.y=d3.scale.linear().range([d,0]).domain([n.min,n.max]),n.el.select("svg").remove(),n.svg=n.el.append("svg").attr("width",b+p.left+p.right).attr("height",d+p.top+p.bottom),n.chart=n.svg.append("g").attr("transform","translate("+p.left+","+p.top+")").on("mouseout",function(){n.tooltip.style("visibility","hidden")});var q=d3.geom.voronoi().clipExtent([[0,0],[b,d]]),r=h.map(function(a){var b=[n.x(a.date),n.y(a.value)],c=C(a.value);return[b[0],b[1],{date:a.date,value:a.value,outlook:c}]}),t=q(r);n.tooltip=d3.select("body").append("div").attr("class","d3-tooltip").style("position","absolute").style("z-index","10").style("visibility","hidden").on("mouseover",function(){return n.tooltip.style("visibility","hidden")}),n.bgAreas=n.chart.selectAll("g.bg-area").data(s).enter().append("g").attr("class",function(a){return"bg-area line-"+a.className}).attr("transform",function(a){return"translate(0,"+n.y(a.v1)+")"}),n.bgAreas.append("rect").attr("x",-n.margin.left).attr("width",n.margin.left).attr("height",function(a){return Math.abs(n.y(a.v1)-n.y(a.v0))}).attr("fill",function(a){return a.color}),n.bgAreas.append("line").attr("x1",0).attr("x2",b).attr("y1",function(a){return a.v1>0?0:n.y(a.v0)-n.y(a.v1)}).attr("y2",function(a){return a.v1>0?0:n.y(a.v0)-n.y(a.v1)}).attr("stroke",function(a){return a.color}).attr("class","guideline hide-in-overview"),n.chart.selectAll(".bg-area.line-neutral").append("line").attr("x1",0).attr("x2",b).attr("y1",function(a){return n.y(a.v0)-n.y(a.v1)}).attr("y2",function(a){return n.y(a.v0)-n.y(a.v1)}).attr("stroke",function(a){return a.color}).attr("class","guideline hide-in-overview"),n.chart.append("line").attr("x1",0).attr("x2",b).attr("y1",n.y(0)).attr("y2",n.y(0)).attr("class","guideline zero").attr("transform","translate(1,0)"),n.chart.append("rect").attr("width",b+n.margin.left+n.margin.right).attr("height",n.margin.bottom).attr("y",d).attr("x",-n.margin.left).attr("fill","#fff"),n.xAxis=d3.svg.axis().scale(n.x).orient("bottom").ticks(3),n.chart.append("g").attr("class","x axis").attr("transform","translate(0,"+d+")").call(n.xAxis),n.chart.append("text").attr("class","y-label").text("Optimistisk").attr("x",5).attr("y",0).attr("dy",".7em"),n.chart.append("text").attr("class","y-label").text("Pessimistisk").attr("x",5).attr("y",d).attr("dy",0),n.line=d3.svg.line().x(function(a){return n.x(a.point[2].date)}).y(function(a){return n.y(a.point[2].value)}),n.chart.append("path").datum(t).attr("class","line").attr("d",n.line),n.dots=n.chart.selectAll("g.poll").data(t).enter().append("g").attr("class","poll"),n.dotSize=4,n.dots.append("circle").attr("r",n.dotSize).attr("cx",n.dotSize/2).attr("class","dot").attr("transform",function(a){return"translate("+[a.point[0],a.point[1]]+")"}),n.dots.append("path").attr("class","voronoi").attr("opacity",1e-6).attr("d",function(a){return"M"+a.join("L")+"Z"}).on("mouseover",function(){var a=this.parentNode.childNodes[0],b=document.body.getBoundingClientRect(),c=a.getBoundingClientRect(),d={top:c.top-b.top,left:c.left-b.left},e=d3.select(a),f=e[0][0].__data__,g=f.point[2].outlook;return e.transition().duration(200).attr("r",2*n.dotSize),n.tooltip.html('<table><tr><td><span class="icon-arrow outlook '+g.className+'"></span></td><td><date>'+w(f.point[2].date)+"</date> "+g.label+"</td></tr></table>").style("visibility","visible").style("top",d.top-65+"px").style("left",function(){var a=this.getBoundingClientRect().width;return d.left-a/2+"px"})}).on("mouseout",function(){var a=d3.select(this.parentNode.childNodes[0]);a.transition().duration(200).attr("r",n.dotSize)}),n.getSentences=function(a,b,d,e){function f(a){return"<strong>"+a.label.toLowerCase()+"</strong>"}var g,h=a[0].value,i=a[1].value,j=C(h),k=j.labelDetermined.toLowerCase(),l=h>i?"optimistisk":"pessimistisk",n=h>i&&h>0||i>h&&0>h?"även":"dock",o=Math.abs(h-i);.5>o?g="Lite":1.5>o?g="Ganska":2.5>o?g="Mer":o>=2.5&&(g="Betydligt");var p={};if(e){if("industry"==b)var q=m.get(d).determined.toLowerCase(),r=m.get(e).determined.toLowerCase();else if("category"==b)var q=m.get(e).determined.toLowerCase(),r=m.get(d).determined.toLowerCase();p.long="Inom "+q+" ser man <strong>"+k+"</strong> på utvecklingen för "+r+" det kommande halvåret."}else{var s=m.get(d).determined.toLowerCase();"industry"==b?p.long="Inom "+s+" ser man just nu "+f(j)+"  på framtiden. ":"category"==b&&(p.long="Unionens medlemmar ser just nu "+f(j)+" på framtiden för "+s+". ")}return p.long+="Man är "+n+" <strong>"+g+" mer "+l+"</strong> än för sex månader sedan.",p.title="Trenden: "+g+" mer "+l+" än senast",p.trend=c(g+" mer ")+l,p.trendTitle=c(g+" mer ")+l+" än senast",p};var u=n.getSentences(h,j,k,l);n.container.select(".trend .value").html(u.trend),n.container.select("h4 .trend").html(u.trendTitle)}return a.prototype.redraw=function(){var b=this;return new a(b.opts)},a}(),C=function(a){var b=s.first(function(b){return b.v0<a&&a<=b.v1});return b},D=function(a){if($(".card").toggleClass("hidden-card"),a.hasClass("selected"))a.on("click");else{a.off("click");var b=r.industry.first(function(b){return a.attr("data-group")==b.name});u.render("history",function(c){a.find(".history").html(c(b))}),u.render("subgroups",function(c){a.find(".subgroups").html(c({group:a.attr("data-group"),groups:b.subgroups}))})}a.removeClass("hidden-card").toggleClass("selected"),n.isotope({filter:":not(.hidden-card)"})};$(window).on("hashchange",function(){var a=l();i(a)}),$(document).ready(function(){u.render("main",function(a){$("#konjunkturbarometern").html(a()),n=$("#cards"),o=$(".nav"),$(".btn-back").click(function(){D($(".card.selected"))}),Tabletop.init({key:p,callback:k,proxy:"https://s3-eu-west-1.amazonaws.com/tabletop-proxy/unionen-konjunkturbarometern-stage/",debug:!0})})})}();