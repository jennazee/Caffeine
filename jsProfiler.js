//javascript profiler with d3 visualizations showing run-times and a "spawning tree" 

//object representations of the information the visualizer will show
function MethodObject() {
    this.runs = [];
};

function StackObject(name) {
    this.name = name;
    this.children = [];
};

StackObject.prototype.sameAs = function(otherStackObj) {
    if (!(this.name.split('_v_')[0] === otherStackObj.name.split('_v_')[0])) {
        return false;
    }
    else if (!(this.children.length === otherStackObj.children.length)) {
        return false;
    }
    else {
        for (var i = 0; i < this.children.length; i++) {
            if (!(this.children[i].sameAs(otherStackObj.children[i]))) {
                return false;
            }
        }
    }
    //still here? it's a match!
    return true;
};

//contemplate map? is it worth the underscore dependency?
//DEAL WITH TIME!!!!!
StackObject.prototype.collapseTimesInto  = function(otherStackObj) {
    if (!(this.time.length)) {
        this.time = [this.time];
    }
    this.time.push(otherStackObj.time);
    for (var i = 0; i < this.children.length; i++) {
        this.children[i].collapseTimesInto(otherStackObj.children[i]);
    }
};

///////////////////////////////////////////////////////////////////

function Profiler(toProfile, graphing) {
    this.toProfile = toProfile;
    this.graphing = graphing;
    this.methods = {};
    this.topLevelMethods = []
    this.callStack = [];
    this.grapher;
};

Profiler.prototype.makeSVG = function() {
    return d3.select("#graphpad").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr('id', 'graph');
};

Profiler.prototype.makeGraph = function() {
    var self = this; 

    $('body').append("<div id='graphpad'></div>");
    $('#graphpad').append("<h1 id='graphtitle'>Methods, Profiled</h1>");
    $('#graphpad').append('<form id="graph-select"><label><input type="radio" name="mode" value="flat" checked> Flat</label><label><input type="radio" name="mode" value="stacked"> Nested</label></form>');
    
    var svg = self.makeSVG();

    self.grapher = new FlatGrapher(svg, self.methods);
    var startGraphing = (function() { self.grapher.init()} ).bind(self, arguments);
    setTimeout(startGraphing, 100);

    $("#graphpad").draggable().resizable({
        minHeight: 300,
        minWidth: 475,
        alsoResize: "svg",
        resize: function(event, ui) {
            self.grapher.scale()
            height = $('svg').height() - margin.top - margin.bottom;
            width = $('svg').width() - margin.left - margin.right;
        }
    });
    self.initGraphSwitching();
};

Profiler.prototype.initGraphSwitching = function() {
    var self = this;

    $('input').change(function() {
        self.grapher.stop();
        d3.select('svg').remove();
        var svg = self.makeSVG.call(self);
        if ($(this).val() === 'flat') {
            self.grapher = new FlatGrapher(svg, self.methods);
        }
        else {
            self.grapher = new StackedGrapher(svg, self.topLevelMethods);
        }
        self.grapher.init();
    });
};

Profiler.prototype.start = function() {
    var self = this;

    self.traverser(this.toProfile);
    if (self.graphing) {
        self.makeGraph();
    }
};

//possible context problems
//TODO: resolve that obj.foo.bar & obj.bar would be the same
Profiler.prototype.traverser = function(object) {
    var self = this;

    $.each(object, function(key, value) {
        if (typeof(value) === 'function') {
            object[key] = self.clocker(value, key);
            self.methods[key] = new MethodObject();
        }
        else if (typeof(value) === 'object') {
            self.traverser(value);
        }
    });
};

// takes in a function and wraps it in a timing scheme, and stores that information
//TODO: make the wrapper take as least time as possible because it'll slow down any nested functions... umm.
Profiler.prototype.clocker = function(toTime, name) {
    var self = this

    var clocked = function() {
        //stack it
        self.callStack.push(new StackObject(name));
        var start = new Date().getMilliseconds();
        var retVal = toTime.apply(this, arguments);
        var end = new Date().getMilliseconds();

        var finished = self.callStack.pop();
            finished.time = end - start;
        if (self.callStack.length > 0) {
            self.callStack[self.callStack.length - 1].children.push(finished);
        }
        else {
            self.topLevelMethods.push(finished);
        }
        //mark it
        self.methods[name].runs.push(end - start);
        return retVal;
    }
    return clocked;
};