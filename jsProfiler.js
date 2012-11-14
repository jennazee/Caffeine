//javascript profiler with d3 visualizations showing run-times and a "spawning tree" 

// * Breakdown *
// 1. Find all the functions
// 2. Wrap them in another function that
//    a) times the function ('clocker')
//    b) figures out which functions it calls
//    c) logs all the info for future viz ('logger')

//object representation of the information the visualizer will show
function FunctionObject() {
    this.runs = [] 
};

function stackObj(name) {
	this.name = name;
	this.children=[]
}

var callStack = []
var originators = []

//constant time, yo.
var functions = {};
var svg;

var traverser = function(object) {
    $.each(object, function(key, value) {
        if (typeof(value) === 'function') {
            object[key] = clocker(value, key)
            functions[key] = new FunctionObject()
        }
        else if (typeof(value) === 'object'){
            traverser(value)
        }
    })
}

//takes in a function and wraps it in a timing scheme, and stores that information in the function's FunctionObject representation
//TODO: make the wrapper take as least time as possible because it'll slow down any nested functions... umm.
var clocker = function(toTime, name) {
    var clocked = function() {
    	//stack it
    	var rep = new stackObj(name)
    	callStack.push(rep)

        //time it
        var start = new Date().getMilliseconds();
        var retVal = toTime.apply(this, arguments);
        var end = new Date().getMilliseconds();
        
        //close it
        var finished = callStack.pop();
        	finished.time = end-start;
        if (callStack.length > 0) {
    		callStack[callStack.length-1].children.push(finished)
    	}
    	else {
    		originators.push(finished)
    	}

        //mark it
        functions[name].runs.push(end-start)
        return retVal;
    }
    return clocked
}

//*** VISUALIZATIONS!! ***
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

	var x = d3.scale.ordinal()
	    .rangeRoundBands([0, width], .1);

	var y = d3.scale.linear()
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")

	var barWidth = 25;

setTimeout(function() {
	var points = [];
	$.each(functions, function(k,v) {points.push( {name: k, avgT: d3.mean(v.runs)} )})

	svg = d3.select("body").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  	.append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	  x.domain(points.map(function(d) { return d.name; }));
	  y.domain([0, d3.max(points, function(d) { return d.avgT; })]);

	  svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	  svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("Average Time (ms)");

	  	svg.selectAll(".bar")
	      .data(points)
	    .enter().append("rect")
	      .attr("class", "bar")
	      .attr("x", function(d,i) {return i*barWidth+40})
	      .attr("width", barWidth)
	      .attr("y", function(d) { return y(d.avgT); })
	      .attr("height", function(d) { return height - y(d.avgT); });
}, 1000)


var redraw = function() {
	var points = [];
	$.each(functions, function(k,v) {points.push( {name: k, avgT: d3.mean(v.runs)} )})

 	svg.selectAll('rect')
 		.data(points)
 		.transition()
 		.duration(500)
		.attr("x", function(d,i) {return i*barWidth+40})
	      .attr("width", barWidth)
	      .attr("y", function(d) { return y(d.avgT); })
	      .attr("height", function(d) { return height - y(d.avgT); });

	svg.selectAll('text')
		.data(points)
		.transition()
		.duration()
		.text(function(d) {return d.name})
}


setInterval(redraw, 1000);