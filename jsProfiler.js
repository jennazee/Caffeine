//javascript profiler with d3 visualizations showing run-times and a "spawning tree" 

//object representations of the information the visualizer will show
function MethodObject() {
    this.runs = [];
};

function StackObject(name) {
    this.name = name;
    this.children = [];
};

StackObject.prototype.sameAs  = function(other) {
    if (!(this.name.split('_v_')[0] === other.name.split('_v_')[0])) {
        return false;
    }
    else if (!(this.children.length === other.children.length)) {
        return false;
    }
    else {
        for (var i=0; i<this.children.length; i++) {
            if (!(this.children[i].sameAs(other.children[i]))) {
                return false;
            };
        };
    };
    //still here? it's a match!
    return true;
}

StackObject.prototype.collapseTimesInto  = function(other) {
    if (!(this.time.length)) {
        this.time = [this.time];
    }
    this.time.push(other.time);
    for (var i = 0; i < this.children.length; i++) {
        this.children[i].collapseTimesInto(other.children[i]);
    };
};


///////////////////////////////////////////////////////////////////

function Profiler(toProfile, graphing) {
    this.toProfile = toProfile;
    this.graphing = graphing;
    this.methods = {};
    this.topLevelMethods = []
    this.callStack = [];
    this.grapher;
}

Profiler.prototype.makeSVG = function() {
    return d3.select("#graphpad").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr('id', 'graph');
}

Profiler.prototype.start = function() {
    var self = this;
    self.traverser(this.toProfile);
    if (self.graphing) {
        $('body').append("<div id='graphpad'></div>");
        $('#graphpad').append("<h1 id='graphtitle'>Methods, Profiled</h1>");
        $('#graphpad').append('<form id="graph-select"><label><input type="radio" name="mode" value="flat" checked> Flat</label><label><input type="radio" name="mode" value="stacked"> Nested</label></form>');
        
        var svg = self.makeSVG();

        //global
        self.grapher = new FlatGrapher(svg, self.methods);
        var createGrapher = (function(){self.grapher.init()}).bind(self, arguments)
        setTimeout(function(){createGrapher()}, 100);

        $("#graphpad").draggable().resizable({
            minHeight: 300,
            minWidth: 475,
            alsoResize: "svg",
            resize: function(event, ui) {
                self.grapher.scale()
                height = $('svg').height()- margin.top - margin.bottom;
                width = $('svg').width()- margin.left - margin.right;
            }
        })

        $('input').change(function() {
            if ($(this).val() === 'flat') {
                self.grapher.stop();
                d3.select('svg').remove();
                var svg = self.makeSVG.call(self);
                self.grapher = new FlatGrapher(svg, self.methods);
                self.grapher.init();
            }
            else {
                self.grapher.stop();
                d3.select('svg').remove();
                var svg = self.makeSVG.call(self);
                self.grapher = new StackedGrapher(svg, self.topLevelMethods);
                self.grapher.init();
            }
        })
    }
}

//possible context problems
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
    })
}

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
            finished.time = end-start;
        if (self.callStack.length > 0) {
            self.callStack[self.callStack.length-1].children.push(finished);
        }
        else {
            self.topLevelMethods.push(finished);
        }
        //mark it
        self.methods[name].runs.push(end-start);
        return retVal;
    }
    return clocked;
}