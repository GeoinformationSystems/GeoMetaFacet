var mongo = require('mongodb');
 
var Server = mongo.Server,
Db = mongo.Db,
BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('geometadb', server);
 
db.open(function(err, db) {
if (!err) {
	console.log("Connected to 'geometadadb' database");  
	db.collection('geometadata').remove();
	populateDB();
	db.collection('geometadata', {strict:true}, function(err, collection) {
		if (err) {
			console.log("The 'geometadatadb' collection doesn't exist. Creating it with sample data...");
			populateDB();
		}
	});
}
});
 
// -----------------------------------------------------------------------------
// --------------------------- by id, all ids ----------------------------------                     
// ----------------------------------------------------------------------------- 
 
exports.findById = function(req, res) {
	var id = req.params.id;
	console.log('Retrieving metadata: ' + id);
	db.collection('geometadata', function(err, collection) { 
		collection.findOne({'id': id}, function(err, item) {
			res.send(item);
		});
	});
};

exports.findAllIds = function(req, res) {
	db.collection('geometadata', function(err, collection) {
		collection.find({ }, { id:1, label:1, _id:0 }).sort( { label: 1 } ).toArray(function(err, items) {
			res.send(items);
		});
	});
};

// -----------------------------------------------------------------------------
// --------------------------- SIMILAR -----------------------------------------                     
// ----------------------------------------------------------------------------- 

exports.findSimilarGeneral = function(req, res) {
	var simString =  '/*' + req.params.sim + '/*';
	console.log(simString);
	
	var andArray = []; 
	andArray.push({ $or: [{ 'label': { $regex: simString, $options: 'i' } }] }); 
	andArray.push({ $or: [{ 'description': { $regex: simString, $options: 'i' } }] }); 
	andArray.push({ $or: [{ 'geographicboundingbox': { $regex: simString, $options: 'i' } }] });
	andArray.push({ $or: [{ 'temporalextentbeginposition': { $regex: simString, $options: 'i' } }] });
	andArray.push({ $or: [{ 'temporalextentendposition': { $regex: simString, $options: 'i' } }] });
	andArray.push({ $or: [{ 'url': { $regex: simString, $options: 'i' } }] });
					
	db.collection('geometadata', function(err, collection) {	
		collection.find( { $or: andArray } ).sort( { label: 1 } ).toArray(function(err, items) {
			res.send(items);
		}); 
	}); 
};

exports.findSimilarLimited = function(req, res) {
	var simString =  '/*' + req.params.sim + '/*';
	console.log(simString);
	
	var orArray = []; 
	orArray.push({ $or: [{ 'label': { $regex: simString, $options: 'i' } }] }); 
	orArray.push({ $or: [{ 'description': { $regex: simString, $options: 'i' } }] }); 
	orArray.push({ $or: [{ 'geographicboundingbox': { $regex: simString, $options: 'i' } }] });
	orArray.push({ $or: [{ 'temporalextentbeginposition': { $regex: simString, $options: 'i' } }] });
	orArray.push({ $or: [{ 'temporalextentendposition': { $regex: simString, $options: 'i' } }] });
	orArray.push({ $or: [{ 'url': { $regex: simString, $options: 'i' } }] });
	
	var andArray = [];
	var hierarchylevelnames = req.params.hierarchylevelnames;
	var topiccategories = req.params.topiccategories;
	var datatypes = req.params.datatypes;
	var organizations = req.params.organizations; 
	var scenarios = req.params.scenarios;  
  
	//preparing scenarios
	if (scenarios != "-") {
		var scenariosSplit = scenarios.split(";");
		var scenariosArr = [];

		for (var i = 0; i < scenariosSplit.length; i++)
			scenariosArr.push({ 'scenario' : scenariosSplit[i] }); 
 
		andArray.push({ $or: scenariosArr });
	} 
	
	//preparing hvls
	if (hierarchylevelnames != "-") {
		var hierarchylevelnamesSplit = hierarchylevelnames.split(";");
		var hierarchylevelnamesArr = [];

		for (var i = 0; i < hierarchylevelnamesSplit.length; i++)
			hierarchylevelnamesArr.push({ 'hierarchylevelname' : hierarchylevelnamesSplit[i] }); 
 
		andArray.push({ $or: hierarchylevelnamesArr });
	} 

	//preparing topiccategories
	if (topiccategories != "-") {
		var topiccategoriesSplit = topiccategories.split(";");
		var topiccategoriesArr = [];

		for (var i = 0; i < topiccategoriesSplit.length; i++)
			topiccategoriesArr.push({ 'topiccategory' : topiccategoriesSplit[i] }); 
    
		andArray.push({ $or: topiccategoriesArr });   
	}

	//preparing datatypes
	if (datatypes != "-") {
		var datatypesSplit = datatypes.split(";");
		var datatypesArr = [];

		for (var i = 0; i < datatypesSplit.length; i++)
			datatypesArr.push({ 'datatype' : datatypesSplit[i] }); 
    
		andArray.push({ $or: datatypesArr });   
	}

	//preparing organizations
	if (organizations != "-") {
		var organizationsSplit = organizations.split(";");
		var organizationsArr = [];

		for (var i = 0; i < organizationsSplit.length; i++)
			organizationsArr.push({ 'organization' : organizationsSplit[i] }); 
    
		andArray.push({ $or: organizationsArr });   
	}
 
	andArray.push( { $or: orArray } );
					
	db.collection('geometadata', function(err, collection) {	
		collection.find( { $and: andArray } ).sort( { label: 1 } ).toArray(function(err, items) {
			res.send(items);
		}); 
	}); 
	 
};

exports.findSimilarScenarios = function(req, res) {
	var simString =  '/*' + req.params.sim + '/*';
	console.log(simString);
	db.collection('geometadata', function(err, collection) {	
		collection.find( { 'scenario': { $regex: simString, $options: 'i' } } ).sort( { label: 1 } ).toArray(function(err, items) {
			res.send(items);
		}); 
	});
};

exports.findSimilarScenarioValues = function(req, res) {	
	var andArray = [];
	var hierarchylevelnames = req.params.hierarchylevelnames;
	var topiccategories = req.params.topiccategories;
	var datatypes = req.params.datatypes;
	var organizations = req.params.organizations; 
	
	var simString =  '/*' + req.params.sim + '/*';  	
	andArray.push({ 'scenario': { $regex: simString, $options: 'i' } });	 
	
	console.log(simString);
	
	//preparing hvls
	if (hierarchylevelnames != "-") {
		var hierarchylevelnamesSplit = hierarchylevelnames.split(";");
		var hierarchylevelnamesArr = [];

		for (var i = 0; i < hierarchylevelnamesSplit.length; i++)
			hierarchylevelnamesArr.push({ 'hierarchylevelname' : hierarchylevelnamesSplit[i] }); 
 
		andArray.push({ $or: hierarchylevelnamesArr });
	} 

	//preparing topiccategories
	if (topiccategories != "-") {
		var topiccategoriesSplit = topiccategories.split(";");
		var topiccategoriesArr = [];

		for (var i = 0; i < topiccategoriesSplit.length; i++)
			topiccategoriesArr.push({ 'topiccategory' : topiccategoriesSplit[i] }); 
    
		andArray.push({ $or: topiccategoriesArr });   
	}

	//preparing datatypes
	if (datatypes != "-") {
		var datatypesSplit = datatypes.split(";");
		var datatypesArr = [];

		for (var i = 0; i < datatypesSplit.length; i++)
			datatypesArr.push({ 'datatype' : datatypesSplit[i] }); 
    
		andArray.push({ $or: datatypesArr });   
	}

	//preparing organizations
	if (organizations != "-") {
		var organizationsSplit = organizations.split(";");
		var organizationsArr = [];

		for (var i = 0; i < organizationsSplit.length; i++)
			organizationsArr.push({ 'organization' : organizationsSplit[i] }); 
    
		andArray.push({ $or: organizationsArr });   
	}
 
	//request
	if (andArray.length > 0) {
		db.collection('geometadata', function(err, collection) { 
			collection.distinct('scenario', { $and: andArray }, function(err, items) {res.send(items.sort());})	 
		});
	} else {
		db.collection('geometadata', function(err, collection) { 
			collection.distinct( 'scenario' , function(err, items) {res.send(items.sort());})
		});
	}
};

exports.findSimilarHierarchylevelnames = function(req, res) {
	var simString =  '/*' + req.params.sim + '/*';
	console.log(simString);
	db.collection('geometadata', function(err, collection) {	
		collection.find( { 'hierarchylevelname': { $regex: simString, $options: 'i' } } ).sort( { label: 1 } ).toArray(function(err, items) {
			res.send(items);
		}); 
	});
};

exports.findSimilarHierarchylevelnameValues = function(req, res) {	
	var andArray = [];
	var scenarios = req.params.scenarios;
	var topiccategories = req.params.topiccategories;
	var datatypes = req.params.datatypes;
	var organizations = req.params.organizations; 
	
	var simString =  '/*' + req.params.sim + '/*';  	
	andArray.push({ 'hierarchylevelname': { $regex: simString, $options: 'i' } });	 
	
	console.log(simString);
	
	//preparing scenarios
	if (scenarios != "-") {
		var scenariosSplit = scenarios.split(";");
		var scenariosArr = [];

		for (var i = 0; i < scenariosSplit.length; i++)
			scenariosArr.push({ 'scenario' : scenariosSplit[i] }); 
 
		andArray.push({ $or: scenariosArr });
	} 

	//preparing topiccategories
	if (topiccategories != "-") {
		var topiccategoriesSplit = topiccategories.split(";");
		var topiccategoriesArr = [];

		for (var i = 0; i < topiccategoriesSplit.length; i++)
			topiccategoriesArr.push({ 'topiccategory' : topiccategoriesSplit[i] }); 
    
		andArray.push({ $or: topiccategoriesArr });   
	}

	//preparing datatypes
	if (datatypes != "-") {
		var datatypesSplit = datatypes.split(";");
		var datatypesArr = [];

		for (var i = 0; i < datatypesSplit.length; i++)
			datatypesArr.push({ 'datatype' : datatypesSplit[i] }); 
    
		andArray.push({ $or: datatypesArr });   
	}

	//preparing organizations
	if (organizations != "-") {
		var organizationsSplit = organizations.split(";");
		var organizationsArr = [];

		for (var i = 0; i < organizationsSplit.length; i++)
			organizationsArr.push({ 'organization' : organizationsSplit[i] }); 
    
		andArray.push({ $or: organizationsArr });   
	}
 
	//request
	if (andArray.length > 0) {
		db.collection('geometadata', function(err, collection) { 
			collection.distinct('hierarchylevelname', { $and: andArray }, function(err, items) {res.send(items.sort());})	 
		});
	} else {
		db.collection('geometadata', function(err, collection) { 
			collection.distinct( 'hierarchylevelname' , function(err, items) {res.send(items.sort());})
		});
	}
};

exports.findSimilarTopiccategory = function(req, res) {
	var simString =  '/*' + req.params.sim + '/*';
	console.log(simString);
	db.collection('geometadata', function(err, collection) {	
		collection.find( { 'topiccategory': { $regex: simString, $options: 'i' } } ).sort( { label: 1 } ).toArray(function(err, items) {
			res.send(items);
		}); 
	});
};

exports.findSimilarTopiccategoryValues = function(req, res) {	
	var andArray = [];
	var scenarios = req.params.scenarios;
	var hierarchylevelnames = req.params.hierarchylevelnames;
	var datatypes = req.params.datatypes;
	var organizations = req.params.organizations; 
	
	var simString =  '/*' + req.params.sim + '/*';  	
	andArray.push({ 'topiccategory': { $regex: simString, $options: 'i' } });	 
	
	console.log(simString);
	
	//preparing scenarios
	if (scenarios != "-") {
		var scenariosSplit = scenarios.split(";");
		var scenariosArr = [];

		for (var i = 0; i < scenariosSplit.length; i++)
			scenariosArr.push({ 'scenario' : scenariosSplit[i] }); 
 
		andArray.push({ $or: scenariosArr });
	} 

	//preparing hierarchylevelnames
	if (hierarchylevelnames != "-") {
		var hierarchylevelnamesSplit = hierarchylevelnames.split(";");
		var hierarchylevelnamesArr = [];

		for (var i = 0; i < hierarchylevelnamesSplit.length; i++)
			hierarchylevelnamesArr.push({ 'hierarchylevelname' : hierarchylevelnamesSplit[i] }); 
    
		andArray.push({ $or: hierarchylevelnamesArr });   
	}

	//preparing datatypes
	if (datatypes != "-") {
		var datatypesSplit = datatypes.split(";");
		var datatypesArr = [];

		for (var i = 0; i < datatypesSplit.length; i++)
			datatypesArr.push({ 'datatype' : datatypesSplit[i] }); 
    
		andArray.push({ $or: datatypesArr });   
	}

	//preparing organizations
	if (organizations != "-") {
		var organizationsSplit = organizations.split(";");
		var organizationsArr = [];

		for (var i = 0; i < organizationsSplit.length; i++)
			organizationsArr.push({ 'organization' : organizationsSplit[i] }); 
    
		andArray.push({ $or: organizationsArr });   
	}
 
	//request
	if (andArray.length > 0) {
		db.collection('geometadata', function(err, collection) { 
			collection.distinct('topiccategory', { $and: andArray }, function(err, items) {res.send(items.sort());})	 
		});
	} else {
		db.collection('geometadata', function(err, collection) { 
			collection.distinct( 'topiccategory' , function(err, items) {res.send(items.sort());})
		});
	}
};

exports.findSimilarDatatype = function(req, res) {
	var simString =  '/*' + req.params.sim + '/*';
	console.log(simString);
	db.collection('geometadata', function(err, collection) {	
		collection.find( { 'datatype': { $regex: simString, $options: 'i' } } ).sort( { label: 1 } ).toArray(function(err, items) {
			res.send(items);
		}); 
	});
};

exports.findSimilarDatatypeValues = function(req, res) {	
	var andArray = [];
	var scenarios = req.params.scenarios;
	var hierarchylevelnames = req.params.hierarchylevelnames;
	var topiccategories = req.params.topiccategories;
	var organizations = req.params.organizations; 
	
	var simString =  '/*' + req.params.sim + '/*';  	
	andArray.push({ 'datatype': { $regex: simString, $options: 'i' } });	 
	
	console.log(simString);
	
	//preparing scenarios
	if (scenarios != "-") {
		var scenariosSplit = scenarios.split(";");
		var scenariosArr = [];

		for (var i = 0; i < scenariosSplit.length; i++)
			scenariosArr.push({ 'scenario' : scenariosSplit[i] }); 
 
		andArray.push({ $or: scenariosArr });
	} 

	//preparing hierarchylevelnames
	if (hierarchylevelnames != "-") {
		var hierarchylevelnamesSplit = hierarchylevelnames.split(";");
		var hierarchylevelnamesArr = [];

		for (var i = 0; i < hierarchylevelnamesSplit.length; i++)
			hierarchylevelnamesArr.push({ 'hierarchylevelname' : hierarchylevelnamesSplit[i] }); 
    
		andArray.push({ $or: hierarchylevelnamesArr });   
	}

	//preparing topiccategories
	if (topiccategories != "-") {
		var topiccategoriesSplit = topiccategories.split(";");
		var topiccategoriesArr = [];

		for (var i = 0; i < topiccategoriesSplit.length; i++)
			topiccategoriesArr.push({ 'topiccategory' : topiccategoriesSplit[i] }); 
    
		andArray.push({ $or: topiccategoriesArr });   
	}

	//preparing organizations
	if (organizations != "-") {
		var organizationsSplit = organizations.split(";");
		var organizationsArr = [];

		for (var i = 0; i < organizationsSplit.length; i++)
			organizationsArr.push({ 'organization' : organizationsSplit[i] }); 
    
		andArray.push({ $or: organizationsArr });   
	}
 
	//request
	if (andArray.length > 0) {
		db.collection('geometadata', function(err, collection) { 
			collection.distinct('datatype', { $and: andArray }, function(err, items) {res.send(items.sort());})	 
		});
	} else {
		db.collection('geometadata', function(err, collection) { 
			collection.distinct( 'datatype' , function(err, items) {res.send(items.sort());})
		});
	}
};

exports.findSimilarOrganization = function(req, res) {
	var simString =  '/*' + req.params.sim + '/*';
	console.log(simString);
	db.collection('geometadata', function(err, collection) {	
		collection.find( { 'organization': { $regex: simString, $options: 'i' } } ).sort( { label: 1 } ).toArray(function(err, items) {
			res.send(items);
		}); 
	});
};

exports.findSimilarOrganizationValues = function(req, res) {	
	var andArray = [];
	var scenarios = req.params.scenarios;
	var hierarchylevelnames = req.params.hierarchylevelnames;
	var topiccategories = req.params.topiccategories;
	var datatypes = req.params.datatypes; 
	
	var simString =  '/*' + req.params.sim + '/*';  	
	andArray.push({ 'organization': { $regex: simString, $options: 'i' } });	 
	
	console.log(simString);
	
	//preparing scenarios
	if (scenarios != "-") {
		var scenariosSplit = scenarios.split(";");
		var scenariosArr = [];

		for (var i = 0; i < scenariosSplit.length; i++)
			scenariosArr.push({ 'scenario' : scenariosSplit[i] }); 
 
		andArray.push({ $or: scenariosArr });
	} 

	//preparing hierarchylevelnames
	if (hierarchylevelnames != "-") {
		var hierarchylevelnamesSplit = hierarchylevelnames.split(";");
		var hierarchylevelnamesArr = [];

		for (var i = 0; i < hierarchylevelnamesSplit.length; i++)
			hierarchylevelnamesArr.push({ 'hierarchylevelname' : hierarchylevelnamesSplit[i] }); 
    
		andArray.push({ $or: hierarchylevelnamesArr });   
	}

	//preparing topiccategories
	if (topiccategories != "-") {
		var topiccategoriesSplit = topiccategories.split(";");
		var topiccategoriesArr = [];

		for (var i = 0; i < topiccategoriesSplit.length; i++)
			topiccategoriesArr.push({ 'topiccategory' : topiccategoriesSplit[i] }); 
    
		andArray.push({ $or: topiccategoriesArr });   
	}

	//preparing datatypes
	if (datatypes != "-") {
		var datatypesSplit = datatypes.split(";");
		var datatypesArr = [];

		for (var i = 0; i < datatypesSplit.length; i++)
			datatypesArr.push({ 'datatype' : datatypesSplit[i] }); 
    
		andArray.push({ $or: datatypesArr });   
	}
 
	//request
	if (andArray.length > 0) {
		db.collection('geometadata', function(err, collection) { 
			collection.distinct('organization', { $and: andArray }, function(err, items) {res.send(items.sort());})	 
		});
	} else {
		db.collection('geometadata', function(err, collection) { 
			collection.distinct( 'organization' , function(err, items) {res.send(items.sort());})
		});
	}
};

// -----------------------------------------------------------------------------
// --------------------------- BBoxen ------------------------------------------                     
// ----------------------------------------------------------------------------- 

exports.findAllBBox = function(req, res) {
	db.collection('geometadata', function(err, collection) {
		collection.find({ }, { id:1, geographicboundingbox:1, _id:0 }).toArray(function(err, items) {
			res.send(items);
		});
	});
};

exports.findMixedBox = function(req, res) {
	var hierarchylevelnames = req.params.hierarchylevelnames;
	var topiccategories = req.params.topiccategories;
	var datatypes = req.params.datatypes;
	var organizations = req.params.organizations;
	var scenarios = req.params.scenarios;

	var andArray = [];

	//preparing scenarios
	if (scenarios != "-") {
		var scenariosSplit = scenarios.split(";");
		var scenariosArr = [];

		for (var i = 0; i < scenariosSplit.length; i++)
			scenariosArr.push({ 'scenario' : scenariosSplit[i] }); 
 
		andArray.push({ $or: scenariosArr });
	} 

	//preparing hvls
	if (hierarchylevelnames != "-") {
		var hierarchylevelnamesSplit = hierarchylevelnames.split(";");
		var hierarchylevelnamesArr = [];

		for (var i = 0; i < hierarchylevelnamesSplit.length; i++)
			hierarchylevelnamesArr.push({ 'hierarchylevelname' : hierarchylevelnamesSplit[i] }); 
 
		andArray.push({ $or: hierarchylevelnamesArr });
	}

	//preparing topics
	if (topiccategories != "-") {
		var topiccategoriesSplit = topiccategories.split(";");
		var topiccategoriesArr = [];

		for (var i = 0; i < topiccategoriesSplit.length; i++)
			topiccategoriesArr.push({ 'topiccategory' : topiccategoriesSplit[i] }); 
  
		andArray.push({ $or: topiccategoriesArr });  
	}

	//preparing datatypes
	if (datatypes != "-") {
		var datatypesSplit = datatypes.split(";");
		var datatypesArr = [];

		for (var i = 0; i < datatypesSplit.length; i++)
			datatypesArr.push({ 'datatype' : datatypesSplit[i] }); 
    
		andArray.push({ $or: datatypesArr });   
	}

	//preparing organizations
	if (organizations != "-") {
		var organizationsSplit = organizations.split(";");
		var organizationsArr = [];

		for (var i = 0; i < organizationsSplit.length; i++)
			organizationsArr.push({ 'organization' : organizationsSplit[i] }); 
    
		andArray.push({ $or: organizationsArr });   
	}

	//requesting
	console.log('Retrieving metadata by mixed: ' + andArray);
	db.collection('geometadata', function(err, collection) {               
		collection.distinct('geographicboundingbox', { $and: andArray }, function(err, items) { res.send(items); }); 
	});
};

// -----------------------------------------------------------------------------
// --------------------------- hierarchylevelnames -----------------------------                      
// -----------------------------------------------------------------------------

exports.findAllHierarchylevelnames = function(req, res) {
	var topiccategories = req.params.topiccategories;
	var datatypes = req.params.datatypes;
	var organizations = req.params.organizations;
	var scenarios = req.params.scenarios;

	var andArray = [];

	//preparing scenarios
	if (scenarios != "-") {
		var scenariosSplit = scenarios.split(";");
		var scenariosArr = [];

		for (var i = 0; i < scenariosSplit.length; i++)
			scenariosArr.push({ 'scenario' : scenariosSplit[i] }); 
 
		andArray.push({ $or: scenariosArr });
	} 

	//preparing topiccategories
	if (topiccategories != "-") {
		var topiccategoriesSplit = topiccategories.split(";");
		var topiccategoriesArr = [];

		for (var i = 0; i < topiccategoriesSplit.length; i++)
			topiccategoriesArr.push({ 'topiccategory' : topiccategoriesSplit[i] }); 
 
		andArray.push({ $or: topiccategoriesArr });
	} 

	//preparing datatypes
	if (datatypes != "-") {
		var datatypesSplit = datatypes.split(";");
		var datatypesArr = [];

		for (var i = 0; i < datatypesSplit.length; i++)
			datatypesArr.push({ 'datatype' : datatypesSplit[i] }); 
    
		andArray.push({ $or: datatypesArr });   
	}

	//preparing organizations
	if (organizations != "-") {
		var organizationsSplit = organizations.split(";");
		var organizationsArr = [];

		for (var i = 0; i < organizationsSplit.length; i++)
			organizationsArr.push({ 'organization' : organizationsSplit[i] }); 
    
		andArray.push({ $or: organizationsArr });   
	}

	//requesting
	console.log('Retrieving metadata by mixed: ' + andArray);

	if (andArray.length > 0) { 
		db.collection('geometadata', function(err, collection) {
			collection.distinct('hierarchylevelname', { $and: andArray }, function(err, items) {res.send(items.sort());});
		});
	} else {
		db.collection('geometadata', function(err, collection) {
			collection.distinct( 'hierarchylevelname', function(err, items) {res.send(items.sort());});
		});
	}
};

// ----------------------------------------------------------------------------- 

var hvlCountArray = [];

function clearHVLCount() {
	hvlCountArray = [];
}

function addHVLCount(hvl, count) {
	hvlCountArray.push({ 'hvl' : hvl, 'count' : count }); 
}

exports.countAllHierarchylevelnames = function(req, res) {
	var hierarchylevelnames = req.params.hierarchylevelnames;

	var scenarios = req.params.scenarios;
	var topiccategories = req.params.topiccategories;
	var datatypes = req.params.datatypes;
	var organizations = req.params.organizations;

	var andArray = [];

	//preparing scenarios
	if (scenarios != "-") {
		var scenariosSplit = scenarios.split(";");
		var scenariosArr = [];

		for (var i = 0; i < scenariosSplit.length; i++)
			scenariosArr.push({ 'scenario' : scenariosSplit[i] }); 
 
		andArray.push({ $or: scenariosArr });
	} 

	//preparing topiccategories
	if (topiccategories != "-") {
		var topiccategoriesSplit = topiccategories.split(";");
		var topiccategoriesArr = [];

		for (var i = 0; i < topiccategoriesSplit.length; i++)
			topiccategoriesArr.push({ 'topiccategory' : topiccategoriesSplit[i] }); 
 
		andArray.push({ $or: topiccategoriesArr });
	} 

	//preparing datatypes
	if (datatypes != "-") {
		var datatypesSplit = datatypes.split(";");
		var datatypesArr = [];

		for (var i = 0; i < datatypesSplit.length; i++)
			datatypesArr.push({ 'datatype' : datatypesSplit[i] }); 
    
		andArray.push({ $or: datatypesArr });   
	}

	//preparing organizations
	if (organizations != "-") {
		var organizationsSplit = organizations.split(";");
		var organizationsArr = [];

		for (var i = 0; i < organizationsSplit.length; i++)
			organizationsArr.push({ 'organization' : organizationsSplit[i] }); 
    
		andArray.push({ $or: organizationsArr });   
	}

	//requesting
	console.log('Retrieving metadata by mixed: ' + andArray);
	db.collection('geometadata', function(err, collection) {     
		var hierarchylevelnameSplit = hierarchylevelnames.split(";");
		hvlCounter(0, hierarchylevelnameSplit, collection, andArray, res);
	});
};

function hvlCounter(i, hierarchylevelnameSplit, collection, andArray, res) {
	if (i < hierarchylevelnameSplit.length) {
		if (i > 0 && andArray != null && andArray.length >= 1) 
			andArray.splice(andArray.length-1);
		
		andArray.push({ 'hierarchylevelname' :  hierarchylevelnameSplit[i]});    
		
		collection.find({ $and: andArray }).count(function(err, items) {  
			addHVLCount(hierarchylevelnameSplit[i], items);
			hvlCounter(i + 1, hierarchylevelnameSplit, collection, andArray, res);
		});
	} else {
		res.send(hvlCountArray);
		clearHVLCount();
	}
}

// -----------------------------------------------------------------------------
// --------------------------- topiccategories ---------------------------------                      
// -----------------------------------------------------------------------------

exports.findAllTopiccategories = function(req, res) {
	var hierarchylevelnames = req.params.hierarchylevelnames;
	var datatypes = req.params.datatypes;
	var organizations = req.params.organizations;
	var scenarios = req.params.scenarios;

	var andArray = [];

	//preparing scenarios
	if (scenarios != "-") {
		var scenariosSplit = scenarios.split(";");
		var scenariosArr = [];

		for (var i = 0; i < scenariosSplit.length; i++)
			scenariosArr.push({ 'scenario' : scenariosSplit[i] }); 
 
		andArray.push({ $or: scenariosArr });
	} 

	//preparing hvls
	if (hierarchylevelnames != "-") {
		var hierarchylevelnamesSplit = hierarchylevelnames.split(";");
		var hierarchylevelnamesArr = [];

		for (var i = 0; i < hierarchylevelnamesSplit.length; i++)
			hierarchylevelnamesArr.push({ 'hierarchylevelname' : hierarchylevelnamesSplit[i] }); 
 
		andArray.push({ $or: hierarchylevelnamesArr });
	} 

	//preparing datatypes
	if (datatypes != "-") {
		var datatypesSplit = datatypes.split(";");
		var datatypesArr = [];

		for (var i = 0; i < datatypesSplit.length; i++)
			datatypesArr.push({ 'datatype' : datatypesSplit[i] }); 
    
		andArray.push({ $or: datatypesArr });   
	}

	//preparing organizations
	if (organizations != "-") {
		var organizationsSplit = organizations.split(";");
		var organizationsArr = [];

		for (var i = 0; i < organizationsSplit.length; i++)
			organizationsArr.push({ 'organization' : organizationsSplit[i] }); 
    
		andArray.push({ $or: organizationsArr });   
	}

	//requesting
	console.log('Retrieving metadata by mixed: ' + andArray);

	if (andArray.length > 0) {
		db.collection('geometadata', function(err, collection) {
			collection.distinct('topiccategory', { $and: andArray }, function(err, items) {res.send(items.sort());})
		});
	} else {
		db.collection('geometadata', function(err, collection) {
			collection.distinct( 'topiccategory' , function(err, items) {res.send(items.sort());})
		});
	}
};

// ----------------------------------------------------------------------------- 

var tcCountArray = [];

function clearTCCount() {
	tcCountArray = [];
}

function addTCCount(tc, count) {
	tcCountArray.push({ 'tc' : tc, 'count' : count }); 
}

exports.countAllTopiccategories = function(req, res) {
	var hierarchylevelnames = req.params.hierarchylevelnames;
	var scenarios = req.params.scenarios;
	var topiccategories = req.params.topiccategories;
	var datatypes = req.params.datatypes;
	var organizations = req.params.organizations;

	var andArray = [];

	//preparing scenarios
	if (scenarios != "-") {
		var scenariosSplit = scenarios.split(";");
		var scenariosArr = [];

		for (var i = 0; i < scenariosSplit.length; i++)
			scenariosArr.push({ 'scenario' : scenariosSplit[i] }); 
 
		andArray.push({ $or: scenariosArr });
	} 

	//preparing datatypes
	if (datatypes != "-") {
		var datatypesSplit = datatypes.split(";");
		var datatypesArr = [];

		for (var i = 0; i < datatypesSplit.length; i++)
			datatypesArr.push({ 'datatype' : datatypesSplit[i] }); 
 
		andArray.push({ $or: datatypesArr });
	} 

	//preparing hierarchylevelnames
	if (hierarchylevelnames != "-") {
		var hierarchylevelnamesSplit = hierarchylevelnames.split(";");
		var hierarchylevelnamesArr = [];

		for (var i = 0; i < hierarchylevelnamesSplit.length; i++)
			hierarchylevelnamesArr.push({ 'hierarchylevelname' : hierarchylevelnamesSplit[i] }); 
    
		andArray.push({ $or: hierarchylevelnamesArr });   
	}

	//preparing organizations
	if (organizations != "-") {
		var organizationsSplit = organizations.split(";");
		var organizationsArr = [];

		for (var i = 0; i < organizationsSplit.length; i++)
			organizationsArr.push({ 'organization' : organizationsSplit[i] }); 
    
		andArray.push({ $or: organizationsArr });   
	}

	//requesting
	console.log('Retrieving metadata by mixed: ' + andArray);
	db.collection('geometadata', function(err, collection) {     
		var topiccategoriesSplit = topiccategories.split(";");
		tcCounter(0, topiccategoriesSplit, collection, andArray, res);
	});
};

function tcCounter(i, topiccategoriesSplit, collection, andArray, res) {
	if (i < topiccategoriesSplit.length) {
		if (i > 0 && andArray != null && andArray.length >= 1) 
			andArray.splice(andArray.length-1);
		
		andArray.push({ 'topiccategory' :  topiccategoriesSplit[i]});    
		
		collection.find({ $and: andArray }).count(function(err, items) {  
			addTCCount(topiccategoriesSplit[i], items);
			tcCounter(i + 1, topiccategoriesSplit, collection, andArray, res);
		});
	} else {
		res.send(tcCountArray);
		clearTCCount();
	}
}
 
//---------------------------------------------------------------------------------------------------------
 
exports.findByTopiccategories = function(req, res) {
	var topiccategories = req.params.topiccategories;
	console.log('Retrieving metadata with topiccategories: ' + topiccategories);
	db.collection('geometadata', function(err, collection) {
		var topiccategoriesSplit = topiccategories.split(";");
		var topiccategoriesArr = [];

		for (var i = 0; i < topiccategoriesSplit.length; i++)
			topiccategoriesArr.push({ 'topiccategory' : topiccategoriesSplit[i] }); 
  
		collection.find({ $or: topiccategoriesArr }, { id:1, label:1, _id:0 }).sort( { label: 1 } ).toArray(function(err, items) {
			res.send(items);
		});
	});
};

// -----------------------------------------------------------------------------
// --------------------------- data types --------------------------------------                       
// -----------------------------------------------------------------------------

exports.findAllDatatypes = function(req, res) {
	var hierarchylevelnames = req.params.hierarchylevelnames;
	var topiccategories = req.params.topiccategories;
	var organizations = req.params.organizations;
	var scenarios = req.params.scenarios;

	var andArray = [];

	//preparing scenarios
	if (scenarios != "-") {
		var scenariosSplit = scenarios.split(";");
		var scenariosArr = [];

		for (var i = 0; i < scenariosSplit.length; i++)
			scenariosArr.push({ 'scenario' : scenariosSplit[i] }); 
 
		andArray.push({ $or: scenariosArr });
	} 

	//preparing hierarchylevelnames
	if (hierarchylevelnames != "-") {
		var hierarchylevelnamesSplit = hierarchylevelnames.split(";");
		var hierarchylevelnamesArr = [];

		for (var i = 0; i < hierarchylevelnamesSplit.length; i++)
			hierarchylevelnamesArr.push({ 'hierarchylevelname' : hierarchylevelnamesSplit[i] }); 
 
		andArray.push({ $or: hierarchylevelnamesArr });
	} 

	//preparing topiccategories
	if (topiccategories != "-") {
		var topiccategoriesSplit = topiccategories.split(";");
		var topiccategoriesArr = [];

		for (var i = 0; i < topiccategoriesSplit.length; i++)
			topiccategoriesArr.push({ 'topiccategory' : topiccategoriesSplit[i] }); 
    
		andArray.push({ $or: topiccategoriesArr });   
	}

	//preparing organizations
	if (organizations != "-") {
		var organizationsSplit = organizations.split(";");
		var organizationsArr = [];

		for (var i = 0; i < organizationsSplit.length; i++)
			organizationsArr.push({ 'organization' : organizationsSplit[i] }); 
    
		andArray.push({ $or: organizationsArr });   
	}

	//requesting
	console.log('Retrieving metadata by mixed: ' + andArray);

	if (andArray.length > 0) {
		db.collection('geometadata', function(err, collection) {
			collection.distinct('datatype', { $and: andArray }, function(err, items) {res.send(items.sort());})
		});
	} else {
		db.collection('geometadata', function(err, collection) {
			collection.distinct( 'datatype' , function(err, items) {res.send(items.sort());})
		});
	}
};

// ----------------------------------------------------------------------------- 

var dtCountArray = [];

function clearDTCount() {
	dtCountArray = [];
}

function addDTCount(dt, count) {
	dtCountArray.push({ 'dt' : dt, 'count' : count }); 
}

exports.countAllDatatypes = function(req, res) {
	var hierarchylevelnames = req.params.hierarchylevelnames;
	var scenarios = req.params.scenarios;
	var topiccategories = req.params.topiccategories;
	var datatypes = req.params.datatypes;
	var organizations = req.params.organizations;

	var andArray = [];

	//preparing scenarios
	if (scenarios != "-") {
		var scenariosSplit = scenarios.split(";");
		var scenariosArr = [];

		for (var i = 0; i < scenariosSplit.length; i++)
			scenariosArr.push({ 'scenario' : scenariosSplit[i] }); 
 
		andArray.push({ $or: scenariosArr });
	} 

	//preparing topiccategories
	if (topiccategories != "-") {
		var topiccategoriesSplit = topiccategories.split(";");
		var topiccategoriesArr = [];

		for (var i = 0; i < topiccategoriesSplit.length; i++)
			topiccategoriesArr.push({ 'topiccategory' : topiccategoriesSplit[i] }); 
 
		andArray.push({ $or: topiccategoriesArr });
	} 

	//preparing hierarchylevelnames
	if (hierarchylevelnames != "-") {
		var hierarchylevelnamesSplit = hierarchylevelnames.split(";");
		var hierarchylevelnamesArr = [];

		for (var i = 0; i < hierarchylevelnamesSplit.length; i++)
			hierarchylevelnamesArr.push({ 'hierarchylevelname' : hierarchylevelnamesSplit[i] }); 
    
		andArray.push({ $or: hierarchylevelnamesArr });   
	}

	//preparing organizations
	if (organizations != "-") {
		var organizationsSplit = organizations.split(";");
		var organizationsArr = [];

		for (var i = 0; i < organizationsSplit.length; i++)
			organizationsArr.push({ 'organization' : organizationsSplit[i] }); 
    
		andArray.push({ $or: organizationsArr });   
	}

	//requesting
	console.log('Retrieving metadata by mixed: ' + andArray);
	db.collection('geometadata', function(err, collection) {     
		var datatypesSplit = datatypes.split(";");
		dtCounter(0, datatypesSplit, collection, andArray, res);
	});
};

function dtCounter(i, datatypesSplit, collection, andArray, res) {
	if (i < datatypesSplit.length) {
		if (i > 0 && andArray != null && andArray.length >= 1) 
			andArray.splice(andArray.length-1);
		
		andArray.push({ 'datatype' :  datatypesSplit[i]});    
		
		collection.find({ $and: andArray }).count(function(err, items) {  
			addDTCount(datatypesSplit[i], items);
			dtCounter(i + 1, datatypesSplit, collection, andArray, res);
		});
	} else {
		res.send(dtCountArray);
		clearDTCount();
	}
}
 
//---------------------------------------------------------------------------------------------------------

exports.findByDatatypes = function(req, res) {
var datatypes = req.params.datatypes;
console.log('Retrieving metadata with datatype: ' + datatypes);
db.collection('geometadata', function(err, collection) {

var datatypesSplit = datatypes.split(";");
var datatypesArr = [];

for (var i = 0; i < datatypesSplit.length; i++)
  datatypesArr.push({ 'datatype' : datatypesSplit[i] }); 
  
collection.find({ $or: datatypesArr }, { id:1, label:1, _id:0 }).sort( { label: 1 } ).toArray(function(err, items) {
res.send(items);
});
});
};

// -----------------------------------------------------------------------------
// --------------------------- organizations -----------------------------------                      
// -----------------------------------------------------------------------------

var orgaCountArray = [];

function clearOrgaCount() {
	orgaCountArray = [];
}

function addOrgaCount(orga, count) {
	orgaCountArray.push({ 'orga' : orga, 'count' : count }); 
}

exports.countAllOrganizations = function(req, res) {
	var hierarchylevelnames = req.params.hierarchylevelnames;
	var scenarios = req.params.scenarios;
	var topiccategories = req.params.topiccategories;
	var datatypes = req.params.datatypes;
	var organizations = req.params.organizations;

	var andArray = [];

	//preparing hierarchylevelnames
	if (hierarchylevelnames != "-") {
		var hierarchylevelnamesSplit = hierarchylevelnames.split(";");
		var hierarchylevelnamesArr = [];

		for (var i = 0; i < hierarchylevelnamesSplit.length; i++)
			hierarchylevelnamesArr.push({ 'hierarchylevelname' : hierarchylevelnamesSplit[i] }); 
 
		andArray.push({ $or: hierarchylevelnamesArr });
	} 

	//preparing topiccategories
	if (topiccategories != "-") {
		var topiccategoriesSplit = topiccategories.split(";");
		var topiccategoriesArr = [];

		for (var i = 0; i < topiccategoriesSplit.length; i++)
			topiccategoriesArr.push({ 'topiccategory' : topiccategoriesSplit[i] }); 
 
		andArray.push({ $or: topiccategoriesArr });
	} 

	//preparing datatypes
	if (datatypes != "-") {
		var datatypesSplit = datatypes.split(";");
		var datatypesArr = [];

		for (var i = 0; i < datatypesSplit.length; i++)
			datatypesArr.push({ 'datatype' : datatypesSplit[i] }); 
    
		andArray.push({ $or: datatypesArr });   
	}

	//preparing scenarios
	if (scenarios != "-") {
		var scenariosSplit = scenarios.split(";");
		var scenariosArr = [];

		for (var i = 0; i < scenariosSplit.length; i++)
			scenariosArr.push({ 'scenario' : scenariosSplit[i] }); 
    
		andArray.push({ $or: scenariosArr });   
	}

	//requesting
	console.log('Retrieving metadata by mixed: ' + andArray);
		db.collection('geometadata', function(err, collection) {     
			var orgaSplit = organizations.split(";");
			orgaCounter(0, orgaSplit, collection, andArray, res);	
	});
};

function orgaCounter(i, orgaSplit, collection, andArray, res) {
	if (i < orgaSplit.length) {
		if (i > 0 && andArray != null && andArray.length >= 1) 
			andArray.splice(andArray.length-1);
		
		andArray.push({ 'organization' :  orgaSplit[i]});    
		
		collection.find({ $and: andArray }).count(function(err, items) {  
			addOrgaCount(orgaSplit[i], items);
			orgaCounter(i + 1, orgaSplit, collection, andArray, res);
		});
	} else {
		res.send(orgaCountArray);
		clearOrgaCount();
	}
}
 
//---------------------------------------------------------------------------------------------------------

exports.findAllOrganizations = function(req, res) {
	var hierarchylevelnames = req.params.hierarchylevelnames;
	var topiccategories = req.params.topiccategories;
	var datatypes = req.params.datatypes;
	var scenarios = req.params.scenarios;

	var andArray = [];

	//preparing scenarios
	if (scenarios != "-") {
		var scenariosSplit = scenarios.split(";");
		var scenariosArr = [];

		for (var i = 0; i < scenariosSplit.length; i++)
			scenariosArr.push({ 'scenario' : scenariosSplit[i] }); 
 
		andArray.push({ $or: scenariosArr });
	} 

	//preparing hierarchylevelnames
	if (hierarchylevelnames != "-") {
		var hierarchylevelnamesSplit = hierarchylevelnames.split(";");
		var hierarchylevelnamesArr = [];

		for (var i = 0; i < hierarchylevelnamesSplit.length; i++)
			hierarchylevelnamesArr.push({ 'hierarchylevelname' : hierarchylevelnamesSplit[i] }); 
 
		andArray.push({ $or: hierarchylevelnamesArr });
	} 

	//preparing topiccategories
	if (topiccategories != "-") {
		var topiccategoriesSplit = topiccategories.split(";");
		var topiccategoriesArr = [];

		for (var i = 0; i < topiccategoriesSplit.length; i++)
			topiccategoriesArr.push({ 'topiccategory' : topiccategoriesSplit[i] }); 
    
		andArray.push({ $or: topiccategoriesArr });   
	}

	//preparing datatypes
	if (datatypes != "-") {
		var datatypesSplit = datatypes.split(";");
		var datatypesArr = [];

		for (var i = 0; i < datatypesSplit.length; i++)
			datatypesArr.push({ 'datatype' : datatypesSplit[i] }); 
    
		andArray.push({ $or: datatypesArr });   
	}

	//requesting
	console.log('Retrieving metadata by mixed: ' + andArray);

	if (andArray.length > 0) {
		db.collection('geometadata', function(err, collection) {
			collection.distinct('organization', { $and: andArray }, function(err, items) {res.send(items.sort());})
		});
	} else {
		db.collection('geometadata', function(err, collection) {
			collection.distinct( 'organization' , function(err, items) {res.send(items.sort());})
		});
	}
};


exports.findByOrganizations = function(req, res) {
	var organizations = req.params.organizations;
	console.log('Retrieving metadata with organization: ' + organizations);
	db.collection('geometadata', function(err, collection) {
		var organizationsSplit = organizations.split(";");
		var organizationsArr = [];

		for (var i = 0; i < organizationsSplit.length; i++)
			organizationsArr.push({ 'organization' : organizationsSplit[i] }); 
  
		collection.find({ $or: organizationsArr }, { id:1, label:1, _id:0 }).sort( { label: 1 } ).toArray(function(err, items) {
			res.send(items);
		});
	});
};

// -----------------------------------------------------------------------------
// --------------------------- scenarios -----------------------------------                      
// -----------------------------------------------------------------------------

exports.findAllScenarios = function(req, res) {
var hierarchylevelnames = req.params.hierarchylevelnames;
var topiccategories = req.params.topiccategories;
var datatypes = req.params.datatypes;
var organizations = req.params.organizations; 

var andArray = [];

//preparing hvls
if (hierarchylevelnames != "-") {
  var hierarchylevelnamesSplit = hierarchylevelnames.split(";");
  var hierarchylevelnamesArr = [];

  for (var i = 0; i < hierarchylevelnamesSplit.length; i++)
    hierarchylevelnamesArr.push({ 'hierarchylevelname' : hierarchylevelnamesSplit[i] }); 
 
  andArray.push({ $or: hierarchylevelnamesArr });
} 

//preparing topiccategories
if (topiccategories != "-") {
  var topiccategoriesSplit = topiccategories.split(";");
  var topiccategoriesArr = [];

  for (var i = 0; i < topiccategoriesSplit.length; i++)
    topiccategoriesArr.push({ 'topiccategory' : topiccategoriesSplit[i] }); 
    
  andArray.push({ $or: topiccategoriesArr });   
}

//preparing datatypes
if (datatypes != "-") {
  var datatypesSplit = datatypes.split(";");
  var datatypesArr = [];

  for (var i = 0; i < datatypesSplit.length; i++)
    datatypesArr.push({ 'datatype' : datatypesSplit[i] }); 
    
  andArray.push({ $or: datatypesArr });   
}

//preparing organizations
if (organizations != "-") {
  var organizationsSplit = organizations.split(";");
  var organizationsArr = [];

  for (var i = 0; i < organizationsSplit.length; i++)
    datatypesArr.push({ 'organization' : organizationsSplit[i] }); 
    
  andArray.push({ $or: organizationsArr });   
}

//requesting
console.log('Retrieving metadata by mixed: ' + andArray);

if (andArray.length > 0) {
	db.collection('geometadata', function(err, collection) {
		collection.distinct('scenario', { $and: andArray }, function(err, items) {res.send(items.sort());})
	});
} else {
	db.collection('geometadata', function(err, collection) {
		collection.distinct( 'scenario' , function(err, items) {res.send(items.sort());})
	});
}
};


var scenCountArray = [];

function clearScenCount() {
	scenCountArray = [];
}

function addScenCount(scen, count) {
	scenCountArray.push({ 'scen' : scen, 'count' : count }); 
}

exports.countAllScenarios = function(req, res) {
var hierarchylevelnames = req.params.hierarchylevelnames;
var scenarios = req.params.scenarios;
var topiccategories = req.params.topiccategories;
var datatypes = req.params.datatypes;
var organizations = req.params.organizations;

var andArray = [];

//preparing hierarchylevelnames
if (hierarchylevelnames != "-") {
  var hierarchylevelnamesSplit = hierarchylevelnames.split(";");
  var hierarchylevelnamesArr = [];

  for (var i = 0; i < hierarchylevelnamesSplit.length; i++)
    hierarchylevelnamesArr.push({ 'hierarchylevelname' : hierarchylevelnamesSplit[i] }); 
 
  andArray.push({ $or: hierarchylevelnamesArr });
} 

//preparing topiccategories
if (topiccategories != "-") {
  var topiccategoriesSplit = topiccategories.split(";");
  var topiccategoriesArr = [];

  for (var i = 0; i < topiccategoriesSplit.length; i++)
    topiccategoriesArr.push({ 'topiccategory' : topiccategoriesSplit[i] }); 
 
  andArray.push({ $or: topiccategoriesArr });
} 

//preparing datatypes
if (datatypes != "-") {
  var datatypesSplit = datatypes.split(";");
  var datatypesArr = [];

  for (var i = 0; i < datatypesSplit.length; i++)
    datatypesArr.push({ 'datatype' : datatypesSplit[i] }); 
    
  andArray.push({ $or: datatypesArr });   
}

//preparing organizations
if (organizations != "-") {
  var organizationsSplit = organizations.split(";");
  var organizationsArr = [];

  for (var i = 0; i < organizationsSplit.length; i++)
    organizationsArr.push({ 'organization' : organizationsSplit[i] }); 
    
  andArray.push({ $or: organizationsArr });   
}

//requesting
console.log('Retrieving metadata by mixed: ' + andArray);
db.collection('geometadata', function(err, collection) {     

	var scenarioSplit = scenarios.split(";");
	scenCounter(0, scenarioSplit, collection, andArray, res);
	
});
};

function scenCounter(i, scenarioSplit, collection, andArray, res) {
	if (i < scenarioSplit.length) {
		if (i > 0 && andArray != null && andArray.length >= 1) 
			andArray.splice(andArray.length-1);
		
		andArray.push({ 'scenario' :  scenarioSplit[i]});    
		
		collection.find({ $and: andArray }).count(function(err, items) {  
			addScenCount(scenarioSplit[i], items);
			scenCounter(i + 1, scenarioSplit, collection, andArray, res);
		});
	} else {
		res.send(scenCountArray);
		clearScenCount();
	}
}

// -----------------------------------------------------------------------------
// --------------------------- relateds ----------------------------------------                      
// -----------------------------------------------------------------------------

exports.findRelatedPublication = function(req, res) {
 
	var simString =  '/*' + req.params.id + '/*';
	
	var andArray = [];
	andArray.push({ 'datatype' :  'publication' }); 
	andArray.push({ $and: [{ 'related datasets': { $regex: simString, $options: 'i' } }] });

	//requesting
	console.log('Retrieving metadata by related: ' + simString);
	db.collection('geometadata', function(err, collection) {
               
	collection.find({ $and: andArray }, { id:1, label:1, _id:0 }).sort( { label: 1 } ).toArray(function(err, items) { res.send(items); });

});
};

// -----------------------------------------------------------------------------
// --------------------------- grandparent -------------------------------------                      
// -----------------------------------------------------------------------------

var path = [];
exports.findGrandParent = function(req, res) {
 
	var id =  req.params.id;
	var andArray = [];
	andArray.push({ 'id' :  id });  

	//requesting
	console.log('Retrieving metadata by related: ' + id);
	db.collection('geometadata', function(err, collection) {
               
	collection.find({ $and: andArray }, { id:1, label:1, parent:1, children:1, _id:0 }).toArray(function(err, items) { 
		if (items[0]!= undefined && items[0].parent != null) {  
			path.push(req.params.id);
			req.params.id = items[0].parent;
			exports.findGrandParent(req, res);
		} else if(items[0]!=undefined)
			{
				path.push(req.params.id);
				path.reverse();
				items[0].pathToChild = path;
				path=[];
				res.send(items[0]);
			} else res.send(500,"item not found");
		
	});

});
};


//-----------------------------------------------------------------------------
//--------------------------- tree --------------------------------------------                      
//-----------------------------------------------------------------------------

exports.findTree = function(req, res) {
	var obj;
	initId = req.params.id;

	//counter variable: checks wether recursion if finished --> if null: everything is done
	var count=1;
	
	//to remember initial item
	var initItem;
	
	db.collection('geometadata', function(err, collection) {
	
		//callbackfunction which starts the callback only, when item is found in database
		callbackfunction = function(id,callback){
			collection.findOne({'id':id}, function(err,item){
				if(!err){
					count--;
					callback(null,item);
				} else {
					res.send(500, "error");
					return;
				}
			});
		};
		
		//helper function is called in setChildren (through callbackfunction)
		// calls recursive setChildren again, with the child (item2)
		// after recursion is done child is pushed into parent (item1);
		helper = function(item1, item2)	{
			setChildren(item2);
			item1.treeChildren.push(item2);
			//if count is 0, whole recursion is finished and response can be send. 
			if(count==0){
				sortChildren(initItem);
				res.send(initItem);
			};
					
			
		};
	
		//main function here
		//checks wether item1 has children
		// if so: loops through all children and calls itself through helper-function(see above) recursive again
		setChildren = function(item1){
			if(item1.children!= null && item1.children.length>0){
				item1.treeChildren=[];
				for (var i=0; i < item1.children.length; i++){
					var id = item1.children[i];
					count++;
					callbackfunction(id, function(err,item2){
						if(!err && item2!=undefined)
							helper(item1,item2);
						else {
							console.log("item not found in DB");
							res.send(500,"item not found");
							return;
						}
					});
				};
			}; 
		};
	
		//initial call for setChildren, after grandparent-object is found
		callbackfunction(initId,function(err,item){
			if(!err && item!=undefined){
				if (item.children == null || !item.children.length>0){
					res.send(item);
					return;
				}
				initItem = item;
				setChildren(item);
			} else {
				console.log("item not found in DB");
				res.send(500,"item not found");
			}
		});
		
		
		
		sortChildren = function sortChildren(object){
			  var children = object["treeChildren"];
			  if (children != undefined) {
				  object["treeChildren"].sort(function(a,b) {
					  if(a.label.toLowerCase()>b.label.toLowerCase())
						  return 1;
					  if(a.label.toLowerCase()<b.label.toLowerCase())
						  return -1;
					  return 0;
				  });
				  
				  for ( var i = 0; i<children.length; i++){
					 sortChildren(children[i]); 
				  }
			  }
			  return object;
		  }; 
	
	});
};



// -----------------------------------------------------------------------------
// --------------------------- complex query -----------------------------------                      
// -----------------------------------------------------------------------------

exports.findByMixed = function(req, res) {
var hierarchylevelnames = req.params.hierarchylevelnames;
var topiccategories = req.params.topiccategories;
var datatypes = req.params.datatypes;
var organizations = req.params.organizations;
var scenarios = req.params.scenarios;

var andArray = [];

//preparing scenarios
if (scenarios != "-") {
  var scenariosSplit = scenarios.split(";");
  var scenariosArr = [];

  for (var i = 0; i < scenariosSplit.length; i++)
    scenariosArr.push({ 'scenario' : scenariosSplit[i] }); 
 
  andArray.push({ $or: scenariosArr });
} 

//preparing hvls
if (hierarchylevelnames != "-") {
  var hierarchylevelnamesSplit = hierarchylevelnames.split(";");
  var hierarchylevelnamesArr = [];

  for (var i = 0; i < hierarchylevelnamesSplit.length; i++)
    hierarchylevelnamesArr.push({ 'hierarchylevelname' : hierarchylevelnamesSplit[i] }); 
 
  andArray.push({ $or: hierarchylevelnamesArr });
}

//preparing topics
if (topiccategories != "-") {
  var topiccategoriesSplit = topiccategories.split(";");
  var topiccategoriesArr = [];

  for (var i = 0; i < topiccategoriesSplit.length; i++)
    topiccategoriesArr.push({ 'topiccategory' : topiccategoriesSplit[i] }); 
  
  andArray.push({ $or: topiccategoriesArr });  
}

//preparing datatypes
if (datatypes != "-") {
  var datatypesSplit = datatypes.split(";");
  var datatypesArr = [];

  for (var i = 0; i < datatypesSplit.length; i++)
    datatypesArr.push({ 'datatype' : datatypesSplit[i] }); 
    
  andArray.push({ $or: datatypesArr });   
}

//preparing organizations
if (organizations != "-") {
  var organizationsSplit = organizations.split(";");
  var organizationsArr = [];

  for (var i = 0; i < organizationsSplit.length; i++)
    organizationsArr.push({ 'organization' : organizationsSplit[i] }); 
    
  andArray.push({ $or: organizationsArr });   
}

//requesting
console.log('Retrieving metadata by mixed: ' + andArray);
db.collection('geometadata', function(err, collection) {
               
collection.find({ $and: andArray }, { id:1, label:1, _id:0 }).sort( { label: 1 } ).toArray(function(err, items) { res.send(items); });

});
};

 
exports.findAll = function(req, res) {
db.collection('geometadata', function(err, collection) {
collection.find().sort( { label: 1 } ).toArray(function(err, items) {   
res.send(items);
});
});
};
 

// -----------------------------------------------------------------------------
// --------------------------- add, update, delete -----------------------------                       
// -----------------------------------------------------------------------------

exports.addMetadata = function(req, res) {
var metadata = req.body;
console.log('Adding metadata: ' + JSON.stringify(metadata));
db.collection('geometadata', function(err, collection) {
collection.insert(wine, {safe:true}, function(err, result) {
if (err) {
res.send({'error':'An error has occurred'});
} else {
console.log('Success: ' + JSON.stringify(result[0]));
res.send(result[0]);
}
});
});
}
 
exports.updateMetadata = function(req, res) {
var id = req.params.id;
var metadata = req.body;
console.log('Updating metadata: ' + id);
console.log(JSON.stringify(metadata));
db.collection('geometadata', function(err, collection) {
collection.update({'_id':new BSON.ObjectID(id)}, metadata, {safe:true}, function(err, result) {
if (err) {
console.log('Error updating wine: ' + err);
res.send({'error':'An error has occurred'});
} else {
console.log('' + result + ' document(s) updated');
res.send(metadata);
}
});
});
}
 
exports.deleteMetadata = function(req, res) {
var id = req.params.id;
console.log('Deleting metadata: ' + id);
db.collection('geometadata', function(err, collection) {
collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
if (err) {
res.send({'error':'An error has occurred - ' + err});
} else {
console.log('' + result + ' document(s) deleted');
res.send(req.body);
}
});
});
}
 
  
/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {
 
var geometadata = 
 
db.collection('geometadata', function(err, collection) {
collection.insert(geometadata, {safe:true}, function(err, result) {});
});
 
};


var populateDB2 = function() {
 
var geometadata = [  ];
db.collection('geometadata', function(err, collection) {
collection.insert(geometadata, {safe:true}, function(err, result) {});
});
 
};