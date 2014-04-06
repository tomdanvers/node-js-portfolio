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
	fs = require('fs'),
	http = require('http'),
	hbs = exphbs.create({
							defaultLayout: 'main',
							helpers: {
								postitems: function(data){
									console.log(hbs.compiled)
									return renderPostItems(data);
								}
							}
						}),
	app = express();

app.use(express.logger());
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

hbs.loadTemplate('views/postitems.handlebars', {}, function(){
	console.log('Loaded Post Items Template');
});

hbs.loadTemplate('views/postitem.handlebars', {}, function(){
	console.log('Loaded Post Item Template');
	log = hbs.compiled;
});

app.get('/', route);
app.get('/*', route);



function renderPostItems(data){
	var ret = '';
	ret += '<ul class="l-group depth-'+data.depth+'">';
	for (var i = 0; i < data.items.length; i++) {
		ret += '<li class="l-group-item">';
		if(data.type ==='groups'){
			ret += renderPostItems(data.items[i]);
		}else{
			ret += hbs.compiled[getCompiled('postitem')](data.items[i]);
		}
		ret += '</li>';
	};
	ret += '</ul>';
	return ret;
}

function getCompiled(id){
	return 'C:\\xampp\\htdocs\\node-js-portfolio\\views\\'+id+'.handlebars';
}

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
			log = hbs.compiled;
			return subDividePosts(json.posts, 3, 0);
			break;
		default:
			return json;
			break;
	}
}

function subDividePosts(posts, subDivisions, depth){
	var pool = [];
	var postCount = posts.length;
	var cut = Math.floor(postCount/subDivisions);
	if(cut >= subDivisions){
		var cutIndex = 0;
		for (var i = 0; i < postCount; i++) {
			if(i === cut*cutIndex){
				pool[cutIndex] = [];
			}

			pool[cutIndex].push(posts[i]);

			if(i === cut*(cutIndex+1) - 1){
				cutIndex ++;
			}
		};

		var groupCount = pool.length;
		var groups = [];
		var group;
		for (i = 0; i < groupCount; i++) {
			groups[i] = subDividePosts(pool[i], subDivisions, depth+1);
		};
		return {type:'groups', hasSubDivisions:true, depth:depth, items:groups};
	}else{
		return {type:'posts', hasSubDivisions:false, depth:depth, items:posts};
	}
}

var port = process.env.PORT || 8888;
app.listen(port, function() {
  	console.log("Listening on " + port);
});