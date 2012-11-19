//javascript profiler with d3 visualizations showing run-times and a "spawning tree" 

//object representation of the information the visualizer will show
function MethodObject() {
    this.runs = [] 
};

function StackObject(name) {
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

    $('head').append("<script src='../Caffeine/d3.v2.min.js' type='text/javascript'></script>")
    $('head').append("<script src='../Caffeine/flatGrapher.js' type='text/javascript'></script>")
    $('head').append('<link rel="stylesheet" type="text/css" href="../Caffeine/profiler.css" />')
    $('head').append('<link rel="stylesheet" href="http://code.jquery.com/ui/1.9.1/themes/base/jquery-ui.css" />')
}

Profiler.prototype.start = function(){
    this.traverser(this.toProfile)
    if (this.graphing) {
        grapher = new FlatGrapher().init()
    }
}

Profiler.prototype.traverser = function(object) {
    p = this;
    $.each(object, function(key, value) {
        if (typeof(value) === 'function') {
            object[key] = p.clocker(value, key)
            functions[key] = new MethodObject()
        }
        else if (typeof(value) === 'object'){
            p.traverser(value)
        }
    })
}

// takes in a function and wraps it in a timing scheme, and stores that information
//TODO: make the wrapper take as least time as possible because it'll slow down any nested functions... umm.
Profiler.prototype.clocker = function(toTime, name) {
    var clocked = function() {
        //stack it
        callStack.push(new StackObject(name))
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
