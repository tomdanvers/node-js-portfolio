// API Response Cache
var time = new Date(),
	timeInterval = setInterval(step, 1000);

function step(){
	time = new Date();
}

var apiCache = {
	cache : {},
	expiresAfter : 60 * 1000,
	hasExpired : function(url){
		return this.cache[url] === undefined || time.getTime() - this.cache[url].lastRetrieved > this.expiresAfter;
	},
	setItem: function(url, item){
		this.cache[url] = item;
	},
	getItem: function(url){
		return this.cache[url];
	}
};

var environment = {
	apiRoot : 'http://dev.node-js-portfolio-wp',
	assetRoot : 'http://dev.node-js-portfolio-files/assets/'
}

var log = {};


// Express App Setup
var express = require('express'),
	exphbs = require('express3-handlebars'),
	http = require('http'),
	hbs = exphbs.create({
							defaultLayout: 'main',
							helpers: {}
						}),
	app = express();

app.use(express.logger());
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.get('/', route);
app.get('/*', route);

function route(request, response) {

	switch(request.url){
		case '/data/log.json':
			response.send(JSON.stringify(log));
			break;
		default:
			var url = environment.apiRoot + request.url + '?json=1';
			console.log('Request from api:', url, apiCache.hasExpired(url));

			if(apiCache.hasExpired(url)){
				http.get(url, function(resp){
					var data = '';
					resp.setEncoding('utf8');
			  		resp.on('data', function (chunk) {
			  			data+=chunk;
				  	});
				  	resp.on('end', function () {
				  		var json = JSON.parse(data);
				  		if(typeof(json.status) === 'undefined' || json.status === 'error'){
							response.render('error', {type:'error', title:'Data Error', environment:environment, content: 'Error hitting wp api at: '+url});
				  		}else{
				  			log=json;
				  			var type = getType(json);
				  			var title = getTitle(type, json);
				  			var content = parseContent(type, json);
				  			console.log(content)
			  				var item = {type:type, title: title, environment:environment, content:content, lastRetrieved:time.getTime()};
			  				apiCache.setItem(url, item);
							response.render(item.type, item);
			  			}
				  	});
				  	resp.on('error', function(error){
						response.render('error', {type:'error', title:'Data Error', environment:environment, content: 'Error hitting wp api at: '+url});
				  	});
				}).on('error', function(error){
					response.render('error', {type:'error', title:'Data Error', environment:environment, content: 'Error hitting wp api at: '+url});
				});
			}else{
				var item = apiCache.getItem(url);
				response.render(item.type, item);
			}
			break;
	}

}

function getType(json){
	if(typeof(json.page) !== 'undefined'){
		return 'page';
	}else if(typeof(json.posts) !== 'undefined'){
		return 'posts';
	}else if(typeof(json.post) !== 'undefined'){
		return 'post';
	}else{
		return 'unknown';
	}
}

function getTitle(type, json){
	switch(type){
		case 'posts':
			return 'Latest Posts';
			break;
		case 'page':
		case 'post':
			return json.post.title;
			break;
	}
	return 'Page Title';
}

function parseContent(type, json){
	switch(type){
		case 'posts':
			return json;
			break;
		default:
			return json;
			break;
	}
}

var port = process.env.PORT || 8888;
app.listen(port, function() {
  	console.log("Listening on " + port);
});