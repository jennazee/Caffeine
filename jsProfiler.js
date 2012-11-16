//javascript profiler with d3 visualizations showing run-times and a "spawning tree" 

//TODO
//- make the graph window centered, but draggable and resizable
//- make the whole thing an object that take in the to-be-profiled object as a parameter. The profiler can then be started and stopped as the user pleases
//p = new Profiler(myObject, true).start 

//object representation of the information the visualizer will show



function FunctionObject() {
    this.runs = [] 
};

function stackObj(name) {
    this.name = name;
    this.children=[]
}

//program-wide variables
var grapher;
var callStack = [];
var originators = [];
var functions = {};

///////////////////////////////////////////////////////////////////

function Profiler(toProfile, graphing) {
    this.toProfile = toProfile;
    this.graphing = graphing;
}

Profiler.prototype.start = function(){
    this.traverser(this.toProfile)
    if (this.graphing) {
        grapher = new FlatGrapher().initFlat()
    }
}

Profiler.prototype.traverser = function(object) {
    p = this;
    $.each(object, function(key, value) {
        if (typeof(value) === 'function') {
            object[key] = p.clocker(value, key)
            functions[key] = new FunctionObject()
        }
        else if (typeof(value) === 'object'){
            p.traverser(value)
        }
    })
    console.log(functions)
}

// takes in a function and wraps it in a timing scheme, and stores that information
//TODO: make the wrapper take as least time as possible because it'll slow down any nested functions... umm.
Profiler.prototype.clocker = function(toTime, name) {
    var clocked = function() {
        //stack it
        callStack.push(new stackObj(name))
        var start = new Date().getMilliseconds();
        var retVal = toTime.apply(this, arguments);
        var end = new Date().getMilliseconds();

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
