//javascript profiler with d3 visualizations showing run-times and a "spawning tree" 

// * Breakdown *
// 1. Find all the functions
// 2. Wrap them in another function that
// 	a) times the function ('clocker')
// 	b) figures out which functions it calls
//	c) logs all the info for future viz ('logger')

//object representation of the information the visualizer will show
function FunctionObject(time) {
	this.runs = []
	this.parents = []
};

//constant time, yo.
var functionsTracked = {};

var traverser = function(object) {
	$.each(object, function(key, value) {
		if (typeof(value) === 'function') {
			object[key] = clocker(value, key)
			functionsTracked[key] = new FunctionObject()
		}
		else if (typeof(value) === 'object'){
			traverser(object)
		}
	})
}

//takes in a function and wraps it in a timing scheme, and stores that information in the function's FunctionObject representation
//TODO: make the wrapper take as least time as possible because it'll slow down any nested functions... umm.
var clocker = function(toTime, name) {
	var clocked = function() {
		//time it
		var start = new Date().getMilliseconds();
		var retVal = toTime.apply(this, arguments);
		var end = new Date().getMilliseconds();
		functionsTracked[name].runs.push(end-start)
		functionsTracked[name].parents[functionsTracked[name].runs.length]=[]
		pushParents(name, arguments)
		return retVal;
	}
	return clocked
}

var pushParents = function(name, args) {
	console.log(args)
	if (args.length>0){
		functionsTracked[name].parents[functionsTracked[name].runs.length].push(args.callee.caller.name)
		pushParents(name, args.callee.caller.arguments)
	}
}

// clocker(function(num){
// 	var arr = [];
// 		for (var i=0; i<num; i++){
// 		$.each([1,2,3,4], function(i,v){
// 			arr.push(v + i)
// 		})
// 	};
// })(50000)


// 2 + 4 * 10

//     +
//   /   \
//  2     *
//       / \
//       4  10 