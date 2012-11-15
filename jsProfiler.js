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