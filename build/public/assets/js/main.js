
$(function() {
    console.log('http://dev.node-js-portfolio:8888/data/log.json');
    // Load and display log
    $.getJSON('http://dev.node-js-portfolio:8888/data/log.json').done(function(log){
    	console.log(log);
    })
});





// if(typeof(console) === 'undefined') console = {log:function(){}, warn:function(){}, error:function(){}};

// require.config({
// 	shim: {
// 		ember: {
// 			deps:['handlebars', 'jquery'],
// 			exports: 'Ember'
// 		},
//     emberdata: {
//       deps:['ember'],
//       exports: 'EmberData'
//     }
// 	},
// 	paths: {
// 		handlebars: 'lib/handlebars/handlebars',
//     emberdata: 'lib/ember/ember-data',
//     ember: 'lib/ember/ember',
//     jquery: 'lib/jquery/jquery-1.11.0.min',
// 		application: 'app/application',
//     routes: 'app/routes',
// 		views: 'app/views',
//     controllers: 'app/controllers',
// 		models: 'app/models',
// 		text: 'lib/require/text',
//     templates: 'app/templates',
//     adapters: 'app/adapters',
//     serializers: 'app/serializers',
//     utils: 'app/utils'
// 	}
// });



// require.config({
// 	shim: {
// 		modernizr: {
// 			exports: 'Modernizr'
// 		},
// 		handlebars: {
// 			exports: 'Handlebars'
// 		},
// 		ember: {
// 			deps:['handlebars', 'jquery'],
// 			exports: 'Ember'
// 		}
// 	},
// 	paths: {
// 		lib: 'lib',
// 		App: 'app/application',
//     models: 'app/models',
//     views: 'app/views',
//     controllers: 'app/controllers',
//     templates: 'app/templates',
//     jquery: 'lib/jquery/jquery.min',
//     handlebars: 'lib/handlebars/handlebars',
//     ember: 'lib/ember/ember',
//     text: 'libs/require/text',
//     hbs: 'libs/require/hbs',
// 		jquery: 'lib/jquery.min',
// 		handlebars: 'lib/handlebars/handlebars'
// 	}
// });




// require(
//   [
//     'ember',
//     'application',
//     'handlebars'
//   ],
//   function(Ember, Application, Handlebars) {
//   	App = Ember.Application.create(Application);
// 	}
// );
