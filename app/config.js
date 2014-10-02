requirejs.config({
    paths: {
        app: 'scripts/main',
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap',
        d3: '../bower_components/d3/d3',
        'font-awesome': '../bower_components/font-awesome/fonts/*',
        handlebars: '../bower_components/handlebars/handlebars',
        html2canvas: '../bower_components/html2canvas/build/html2canvas',
        less: '../bower_components/less/dist/less-1.7.5',
        modernizr: '../bower_components/modernizr/modernizr',
        requirejs: '../bower_components/requirejs/require',
        tabletop: '../bower_components/tabletop/src/tabletop',
        hbs: 'templates/hbs'
    },
    shim: {
        handlebars: {
            exports: 'Handlebars'
        }
      }
});

requirejs([
    'd3',
    'handlebars',
    'modernizr',
    'tabletop',
    'bootstrap',
    'app'
    ])