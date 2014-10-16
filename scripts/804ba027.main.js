!function(){"use strict";function a(a,b,c){for(var d="undefined"!=typeof c?[c]:document.styleSheets,e=0,f=d.length;f>e;e++){var c=d[e];if(c.cssRules)for(var g=0,h=c.cssRules.length;h>g;g++){var i=c.cssRules[g];if(i.selectorText&&-1!==i.selectorText.split(",").indexOf(b))return i.style[a]}}return null}function b(a){return a.replace(/[\s:]/g,"-").replace(/[åä]/gi,"a").replace(/[ö]/gi,"o").toLowerCase()}function c(a){return a=a.replace(/^\s\s*/,""),a.charAt(0).toUpperCase()+a.slice(1)}function d(a){return{title:a.attr("data-title"),msg:a.attr("data-msg"),urlToShare:p+"?show="+a.attr("data-id")}}function e(){$(".twitter").click(function(){var a=$(this),b=d(a),c=b.msg+" @Unionen ",e="http://twitter.com/share?url="+b.urlToShare+"&text="+encodeURIComponent(c),f=575,g=400,h=(jQuery(window).width()-f)/2,i=(jQuery(window).height()-g)/2,j=(b.urlToShare,"status=1,width="+f+",height="+g+",top="+i+",left="+h);return window.open(e,"twitter",j),!1}),$(".facebook").click(function(){var a=d($(this));return FB.ui({method:"feed",name:a.title,link:a.urlToShare,picture:"",caption:"",description:a.msg}),!1}),$(".email").click(function(){var a=$(this),b=d(a);window.location.href="mailto:?subject="+b.title+"&body="+b.msg+" "+b.urlToShare})}function f(){u.render("cards",function(a){u.render("history",function(b){Handlebars.registerPartial("history",b),l.html(a({groups:q})).isotope({itemSelector:".card",layoutMode:"fitRows",filter:".foo"}).find(".item").tooltip({container:"body"}),ri.messageParent(!0),e(),n=$(".content").offset().top,g(j())})})}function g(a){var b=l.find(".card.selected");l.find(".card").removeClass("selected").removeClass("active-category"),a.category=a.category||"industry",$(".card[data-category="+a.category+"]").addClass("active-category"),m.find("li").removeClass("active"),m.find("li[data-category="+a.category+"]").addClass("active");var c=".card.active-category";if(a.group){var d=q.first(function(b){return a.group==b.id});u.render("subgroups",function(b){var e=l.find(".card[data-group="+a.group+"]").addClass("selected");e.find(".subgroups").html(b({category:a.category,group:a.group,groups:d.subgroups})).find(".accordion").on("shown.bs.collapse",function(a){l.height(l.height()+a.target.offsetHeight),ri.messageParent(!0)}).on("hide.bs.collapse",function(a){l.height(l.height()-a.target.offsetHeight),ri.messageParent(!0)}).find(".item").tooltip({container:"body"}),c+=".selected",l.isotope({filter:c}),ri.messageParent(!1,180)})}else b.length>0,l.isotope({filter:c}),ri.messageParent(!0)}function h(a){return a=a.map(function(a){a.id=b(a.name);var c=a.subgroups.map(function(a){return a.values.map(function(a){return a})});a.values=d3.transpose(c).map(function(a){return{date:a[0].date,value:d3.mean(a.map(function(a){return+a.value}))}}).sort(function(a,b){return d3.ascending(a.date,b.date)});var d=a.subgroups.map(function(a){return+a.values[0].value});return a.outlook=z(d3.mean(d)),a.subgroups.map(function(a){return a.id=b(a.name),a.outlook=z(+a.values[0].value),a.values.sort(function(a,b){return d3.ascending(a.date,b.date)}),a}),a})}function i(a){k=d3.map({}),a.dictionary.forEach(function(a){k.set(b(a.word),a)}),q=h(a.data);var c=d3.mean(q.filter(function(a){return"industry"==a.category}).map(function(a){return d3.mean(a.subgroups.map(function(a){return+a.values[0].value}))}));c=z(c);var d=$(".total-outlook").removeClass("hidden");d.find(".outlook").addClass(c.className),d.find(".value").text(c.label+" jämfört med tidigare"),d3.selectAll(".loading").style("display","none");var e="2014-10-15";$("#latest-update").html("<strong>Senaste mätningen:</strong> <date value="+e+">"+e+"</date>"),f()}function j(){var a={category:null,group:null,subgroup:null},b=window.location.hash;return""!==b&&(b=b.replace("#","").split("_"),b.length>=1&&(a.category=b[0]),b.length>=2&&(a.group=b[1]),b.length>=3&&(a.subgroup=b[2])),a}var k,l,m,n,o="1JGCoMlEqUaspT-S_7UK-lVK8JfzHItdHyUQO_LYdFus",p="http://unionenopinion.se/branschbarometern",q={};Handlebars.registerHelper("dictionary",function(a,c,d){return a=k.get(b(a))[c],d&&(a=a.toLowerCase()),a}),Handlebars.registerHelper("toLowerCase",function(a){return a.toLowerCase()}),Handlebars.registerHelper("formatDate",function(a){return"undefined"!=typeof a?c(y(x(a))):""}),Handlebars.registerHelper("getOutlook",function(a,b){return"undefined"!=typeof a?z(a)[b]:""}),Handlebars.registerHelper("latestUpdate",function(){var a=x($("#latest-update date").attr("value"));return w(a)});var r=[{v0:10.45,v1:12.5,label:"Tydligt förbättrad",labelDetermined:"Tydligt förbättrad",className:"p3"},{v0:5.45,v1:10.45,label:"Förbättrad",labelDetermined:"Förbättrad",className:"p2"},{v0:.45,v1:5.45,label:"Något förbättrad",labelDetermined:"Något förbättrad",className:"p1"},{v0:-.45,v1:.45,label:"Oförändrad",labelDetermined:"Oförändrad",className:"neutral"},{v0:-5.45,v1:-.45,label:"Något försämrad",labelDetermined:"Något försämrad",className:"n1"},{v0:-10.45,v1:-5.45,label:"Försämrad",labelDetermined:"Försämrad",className:"n2"},{v0:-12.5,v1:-10.45,label:"Tydligt försämrad",labelDetermined:"Tydligt försämrad",className:"n3"}].map(function(b){return b.color=a("background-color","."+b.className),b});Array.prototype.first||(Array.prototype.first=function(a){if(null==this)throw new TypeError;if("function"!=typeof a)throw new TypeError;for(var b=0;b<this.length;b++)if(a(this[b]))return this[b];return null});var s=function(){for(var a={},b=window.location.search.substring(1),c=b.split("&"),d=0;d<c.length;d++){var e=c[d].split("=");if("undefined"==typeof a[e[0]])a[e[0]]=e[1];else if("string"==typeof a[e[0]]){var f=[a[e[0]],e[1]];a[e[0]]=f}else a[e[0]].push(e[1])}return a}(),t=function(){this.cached={}},u=new t;$.extend(t.prototype,{render:function(a,b){u.isCached(a)?b(u.cached[a]):$.get(u.urlFor(a),function(c){u.store(a,c),u.render(a,b)})},renderSync:function(a,b){u.isCached(a)||u.fetch(a),u.render(a,b)},prefetch:function(a){$.get(u.urlFor(a),function(b){u.store(a,b)})},fetch:function(a){if(!u.isCached(a)){var b=$.ajax({url:u.urlFor(a),async:!1}).responseText;u.store(a,b)}},isCached:function(a){return!!u.cached[a]},store:function(a,b){u.cached[a]=Handlebars.compile(b)},urlFor:function(a){return"templates/"+a+".hbs"}});var v=d3.locale({decimal:",",thousands:" ",grouping:[3],currency:[""," kr"],dateTime:"%A %e %B %Y kl. %X",date:"%d.%m.%Y",time:"%H:%M:%S",periods:["AM","PM"],days:["måndag","tisdag","onsdag","torsdag","fredag","lördag","söndag"],shortDays:["må","ti","ons","to","fre","lö","sö"],months:["januari","februari","mars","april","maj","juni","juli","augusti","september","oktober","november","december"],shortMonths:["jan","feb","mars","apr","maj","jun","jul","aug","sept","okt","nov","dec"]}),w=(v.timeFormat("%B %Y"),v.timeFormat("%e %B %Y")),x=v.timeFormat("%Y-%m-%d").parse,y=(v.timeFormat("%Y-%m-%d"),v.timeFormat("%b %Y")),z=function(a){var b=r.first(function(b){return b.v0<a&&a<=b.v1});return b};$(window).on("hashchange",function(){var a=j();g(a)}),$(document).ready(function(){u.render("main",function(a){$("#branschbarometern").html(a()),l=$("#cards"),m=$(".nav"),$(".btn-back").click(function(){toggleCard($(".card.selected"))});var b="production";("1"==s.preview||"true"==s.preview)&&(b="stage",$(".preview").removeClass("hidden")),$.getJSON("http://s3-eu-west-1.amazonaws.com/tabletop-proxy/unionen-konjunkturbarometern-"+b+"/"+o+".json",function(a){i(a)})})})}();