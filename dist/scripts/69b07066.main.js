var d,tt;!function(){"use strict";function a(a,b){a=d3.entries(a).map(function(a){return a.id=a.key.replace(/ /g,"").replace(/åä/gi,"a").replace(/ö/gi,"o"),a}),console.log(a),d=a,tt=b;var c=$("#konjunkturbarometern-template").html(),e=Handlebars.compile(c),f=e(a);$(".container").html(f)}var b="1JGCoMlEqUaspT-S_7UK-lVK8JfzHItdHyUQO_LYdFus";$(document).ready(function(){Tabletop.init({key:b,callback:a,proxy:"https://s3-eu-west-1.amazonaws.com/tabletop-proxy/unionen-konjunkturbarometern-stage/",debug:!0})})}();