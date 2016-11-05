var NodeGeocoder = require('node-geocoder');
//var tmp = require('temporary');
var FileCache = require('file-cache-simple');

//var tmpDir = new tmp.Dir();
//var tmpPath = tmpDir.path;
var cache = new FileCache({
	//cacheDir: tmpPath
	cacheExpire: 3600 * 24 * 365 // a year! ha!
});

module.exports = function(options) {

/*var options = {
  provider: 'google',
 
  // Optional depending on the providers 
  httpAdapter: 'https', // Default 
  apiKey: 'YOUR_API_KEY', // for Mapquest, OpenCage, Google Premier 
  formatter: null         // 'gpx', 'string', ... 
};*/
 
	var geocoder = NodeGeocoder(options);

	return function(files, metalsmith, done) {
		var toFind = [];
		Object.keys(files).forEach(function(file) {
			var entry = files[file];
			if(entry.address) {
				console.log(entry.address);
				toFind.push(file);
			}
		});
		
		var foundPromises = toFind.map((file) => {
			var entry = files[file];
			return find(entry);
		});

		Promise.all(foundPromises).then(() => {
			done();
		});
	};

	function find(entry) {
		var address = entry.address;
		console.log('find', address);
		return new Promise((resolve) => {
			cache.get(address).then((data) => {
				console.log('response from cache');
				if(data) {
					console.log('cached', data);
					entry.geocoded = data;
					resolve(data);
				} else {
					console.log('not cached');
					geocoder.geocode(address).then((data) => {
						if(data && Array.isArray(data)) {
							var geodata = data[0];
							entry.geocoded = geodata;
							cache.set(address, geodata);
							resolve(geodata);
						} else {
							resolve();
						}
					});
				}
			});
		});
		
	}
};
