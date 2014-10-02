var chart=function(){"use strict";var a,b=d3.scale.linear().domain([12.5,0,-12.5]).range(["green","white","red"]),c=[{v0:7.5,v1:12.5,label:"Väldigt optimistisk",labelDetermined:"Väldigt optimistiskt",rotate:20},{v0:2.5,v1:7.5,label:"Optimistisk",labelDetermined:"Optimistiskt",rotate:40},{v0:0,v1:2.5,label:"Försiktigt optimistisk",labelDetermined:"Försiktigt optimistiskt",rotate:60},{v0:-2.5,v1:0,label:"Försiktigt pessimistisk",labelDetermined:"Försiktigt pessimistiskt",rotate:120},{v0:-7.5,v1:-2.5,label:"Pessimistisk",labelDetermined:"Pessimistiskt",rotate:140},{v0:-12.5,v1:-7.5,label:"Väldigt pessimistisk",labelDetermined:"Väldigt pessimistiskt",rotate:160}].map(function(a){return a.color=b((a.v1+a.v0)/2),a});Array.prototype.first||(Array.prototype.first=function(a){if(null==this)throw new TypeError;if("function"!=typeof a)throw new TypeError;for(var b=0;b<this.length;b++)if(a(this[b]))return this[b];return null});{var d=(function(){for(var a={},b=window.location.search.substring(1),c=b.split("&"),d=0;d<c.length;d++){var e=c[d].split("=");if("undefined"==typeof a[e[0]])a[e[0]]=e[1];else if("string"==typeof a[e[0]]){var f=[a[e[0]],e[1]];a[e[0]]=f}else a[e[0]].push(e[1])}return a}(),d3.locale({decimal:",",thousands:" ",grouping:[3],currency:[""," kr"],dateTime:"%A %e %B %Y kl. %X",date:"%d.%m.%Y",time:"%H:%M:%S",periods:["AM","PM"],days:["måndag","tisdag","onsdag","torsdag","fredag","lördag","söndag"],shortDays:["må","ti","ons","to","fre","lö","sö"],months:["januari","februari","mars","april","maj","juni","juli","augusti","september","oktober","november","december"],shortMonths:["jan","feb","mars","apr","maj","jun","jul","aug","sept","okt","nov","dec"]})),e=(d.timeFormat("%Y-%m-%d").parse,function(){this.cached={}}),f=(new e,function(a){var b=c.first(function(b){return b.v0<a&&a<=b.v1});return b});!function(){function b(b,d,e,g,h){var i,j,k,l,m=this;m.el=b;var n=m.el[0][0].offsetWidth;n=400,m.margin={top:10,bottom:30,right:20,left:30};var o=m.margin;m.width=i=n-o.left-o.right,m.height=j=.35*i,m.date1=l=d[0].date,m.date0=k=d[d.length-1].date,m.min=-9,m.max=9,m.x=d3.time.scale().range([0,i]).domain([k,l]),m.y=d3.scale.linear().range([j,0]).domain([m.min,m.max]),m.svg=m.el.append("svg").attr("width",i+o.left+o.right).attr("height",j+o.top+o.bottom),m.chart=m.svg.append("g").attr("transform","translate("+o.left+","+o.top+")");var p=d3.geom.voronoi().clipExtent([[0,0],[i,j]]),q=d.map(function(a){var b=[m.x(a.date),m.y(a.value)],c=f(a.value);return[b[0],b[1],{date:a.date,value:a.value,outlook:c}]}),r=p(q);m.bgAreas=m.chart.selectAll("g.bg-area").data(c).enter().append("g").attr("class","bg-area").attr("transform",function(a){return"translate(0,"+m.y(a.v1)+")"}),m.bgAreas.append("rect").attr("width",i).attr("height",function(a){return Math.abs(m.y(a.v1)-m.y(a.v0))}).attr("fill",function(a){return a.color}).attr("stroke","white"),m.xAxis=d3.svg.axis().scale(m.x).orient("bottom").ticks(3),m.chart.append("g").attr("class","x axis").attr("transform","translate(0,"+j+")").call(m.xAxis),m.line=d3.svg.line().x(function(a){return m.x(a.point[2].date)}).y(function(a){return m.y(a.point[2].value)}),m.chart.append("path").datum(r).attr("class","line").attr("d",m.line),m.dots=m.chart.selectAll("g.poll").data(r).enter().append("g").attr("class","poll"),m.dotSize=4,m.dots.append("circle").attr("r",m.dotSize).attr("cx",m.dotSize/2).attr("class","dot").attr("transform",function(a){return"translate("+[a.point[0],a.point[1]]+")"}),m.dots.append("path").attr("class","voronoi").attr("opacity",1e-6).attr("d",function(a){return"M"+a.join("L")+"Z"}).on("mouseover",function(){{var a=this.parentNode.childNodes[0],b=d3.select(a);b[0][0].__data__}b.transition().duration(200).attr("r",3*m.dotSize)}).on("mouseout",function(){{var a=this.parentNode.childNodes[0],b=d3.select(a);b[0][0].__data__}b.transition().duration(200).attr("r",m.dotSize)}),m.getSentence=function(b,c,d,e){var g,h=b[0].value,i=b[1].value,j=f(h).labelDetermined.toLowerCase(),k=h>i?"postiv":"negativ",l=h>i&&h>0||i>h&&0>h?"även":"dock",m=Math.abs(h-i);1>m?g="något":2>m?g="":3>m&&(g="betydligt");var n;if(e){if("industry"==c)var o=a.get(d).determined.toLowerCase(),p=a.get(e).determined.toLowerCase();else if("category"==c)var o=a.get(e).determined.toLowerCase(),p=a.get(d).determined.toLowerCase();n="Inom "+o+" ser man <strong>"+j+"</strong> på utvecklingen för "+p+" det kommande halvåret."}else{var q=a.get(d).determined.toLowerCase();"industry"==c?n="Inom "+q+" ser man just nu <strong>"+j+"</strong> på framtiden. ":"category"==c&&(n="Unionens medlemmar ser just nu <strong>"+j+"</strong> på framtiden för "+q+". ")}return n+="Man är "+l+" <strong>"+g+" mera "+k+"</strong> än för sex månader sedan."},m.el.append("div").attr("class","sentence").html(m.getSentence(d,e,g,h))}return b}()}$(document).ready(function(){})}();