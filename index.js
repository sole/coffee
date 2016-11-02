var Metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var permalinks = require('metalsmith-permalinks');
var collections = require('metalsmith-collections');
var metalPath = require('metalsmith-path');
var feed = require('@sole/metalsmith-feed-decaf');
var archive = require('metalsmith-archive');
var path = require('path');
var geocode = require('./geocode');

var metadata = require('./settings');

function nosy(files, metalsmith, done) {
	console.log(Object.keys(files));
	done();
}

function cleanPaths(files, metalsmith, done) {
	var keys = Object.keys(files);
	keys.forEach((k) => {
		var parts = path.parse(k);
		if(parts.base === 'index.html') {
			files[k].path = parts.dir;
		}
	});
	done();
}

Metalsmith(__dirname)
	.metadata(metadata)
	.ignore('.DS_Store')
	.source('./src')
	.destination('./build')
	.use(markdown())
	.use(collections({
		places: {
			pattern: 'places/*/index.*',
			sortBy: 'date',
			reverse: true
		},
		pages: {
			pattern: 'pages/*'
		}
	}))
	.use(permalinks({
		relative: false
	}))
	//.use(nosy)
	.use(metalPath())
	.use(cleanPaths)
	.use(geocode())
	.use(archive({
		collections: 'places'
	}))
	.use(feed({
		collection: 'places',
		destination: 'feed/places.xml',
		generator: metadata.site.title
	}))
	.use(layouts({
		engine: 'handlebars',
		default: 'default.html',
		partials: './layouts/partials',
		pattern: '**/*.html'
	}))
	.build(function(err, files) {
		if(err) { throw err; }
	});

