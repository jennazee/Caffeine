//javascript profiler with d3 visualizations showing run-times and a "spawning tree" 

//object representation of the information the visualizer will show
function MethodObject() {
    this.runs = [] 
};

function StackObject(name) {
    this.name = name;
    this.children=[]
}

StackObject.prototype.sameAs  = function(other) {
    if (!(this.name === other.name)){
        return false
    }
    else if (!(this.children.length === other.children.length)) {
        return false
    }
    else {
        for (i=0; i<this.children.length; i++) {
            if (!(this.children[i].sameAs(other.children[i]))){
                return false
            }
        }
    }
    //still here? it's a match!
    return true
}

StackObject.prototype.collapseTimesInto  = function(other) {
    if (!(this.time.length)){
        this.time = [this.time]
    }
    this.time.push(other.time)
    for (i=0; i<this.children.length; i++){
        this.children[i].collapseTimesInto(other.children[i])
    }
}

var collapseOriginators = function(){
    var flattened = {}
    $.each(originators, function() {
        var curr = this
        if (!flattened[curr.name]){
            flattened[curr.name] = [this]
        }
        else {
            $.each(flattened[curr.name], function(){
                if (this.sameAs(curr)){
                    this.collapseTimesInto(curr)
                }
                else {
                    curr.name = curr.name + '(' + str(flattened[curr.name].length) + ')'
                    flattened[curr.name].push(curr)
                }
            })
        }
    })
    var flattenedArray = []
    $.each(flattened, function(k,v) {
        if (v[0].time.length > 1) {
            v[0].time = d3.mean(v[0].time)
        }
        flattenedArray.push(v[0])
    })
    return flattenedArray
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

Profiler.prototype.makeSVG = function() {
    return d3.select("#graphpad").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr('id', 'graph')
}

Profiler.prototype.start = function(p){
    self = p;
    this.traverser(this.toProfile)
    if (this.graphing) {
        $('body').append("<div id='graphpad'></div>")
        $('#graphpad').append("<h1 id='graphtitle'>Methods, Profiled</h1>")
        $('#graphpad').append('<form id="graph-select"><label><input type="radio" name="mode" value="flat" checked> Flat</label><label><input type="radio" name="mode" value="stacked"> Nested</label></form>')
        
        var svg = this.makeSVG()

        grapher = new FlatGrapher(svg)
        setTimeout(function() {grapher.init()}, 100)

        $("#graphpad").draggable().resizable({
            minHeight: 300,
            minWidth: 475,
            alsoResize: "svg",
            resize: function(event, ui) {
                grapher.scale()
                height = $('svg').height()- margin.top - margin.bottom;
                width = $('svg').width()- margin.left - margin.right;
            }
        })

        $('input').change(function(){
            if ($(this).val() === 'flat') {
                grapher.stop()
                d3.select('svg').remove()
                var svg = p.makeSVG.call(p)
                grapher = new FlatGrapher(svg)
                grapher.init();
            }
            else {
                grapher.stop()
                d3.select('svg').remove()
                var svg = p.makeSVG.call(p)
                grapher = new StackedGrapher(svg)
                grapher.init();
            }
        })
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