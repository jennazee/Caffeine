var margin = {top: 20, right: 20, bottom: 30, left: 40};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;


function FlatGrapher() {
    this.svg;
    this.redrawer;

    this.x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    this.y = d3.scale.linear()
        .range([height, 0]);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom");

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left")
}

//bar chart
FlatGrapher.prototype.initFlat = function() {
    var self = this
    setTimeout(function() {
    
    var points = [];
    $.each(functions, function(k,v) {points.push( {name: k, avgT: d3.mean(v.runs)} )})

    $('body').append("<div id='graphpad'></div>")
    $($('#graphpad').css('width', $('svg').attr('width')).css('height', $('svg').attr('height')))

    self.svg = d3.select("#graphpad").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    self.x.domain(points.map(function(d) { return d.name; }));
    self.y.domain([0, d3.max(points, function(d) { return d.avgT; })]);

    self.svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(self.xAxis);

    self.svg.append("g")
        .attr("class", "y-axis")
        .call(self.yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Average Time (ms)");

    self.svg.selectAll(".bar")
        .data(points)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d,i) {return self.x(d.name)})
        .attr("width", self.x.rangeBand())
        .attr("y", function(d) {
            if (d.avgT){
                return self.y(d.avgT)
            }
            else {
                return 0;
            }
        })
        .attr("height", function(d) {
            if (d.avgT){
                return height-self.y(d.avgT)
            }
            else {
                return 0;
            }
        });

        $($("#graphpad").draggable().resizable({
            minHeight: 150,
            alsoResize: "svg",
            resize: function(event, ui) {
                self.scaleFlat()
                height = $('svg').height()- margin.top - margin.bottom;
                width = $('svg').width()- margin.left - margin.right;
            }

        }));
    }, 1000)
    self.redrawer = setInterval(function(){self.redrawFlat.call(self)}, 1000);
}


FlatGrapher.prototype.redrawFlat = function() {
    console.log('redraw')
    var self = this;
    var points = [];
    $.each(functions, function(k,v) {points.push( {name: k, avgT: d3.mean(v.runs)} )})

    self.svg.selectAll('rect')
        .data(points)
        .attr("x", function(d,i) {return self.x(d.name)})
        .attr("width", self.x.rangeBand())
        .attr("y", function(d) { if (d.avgT){
                return self.y(d.avgT)
            }
            else {
                return 0;
            }
        })
        .attr("height", function(d) { if (d.avgT){
                return height-self.y(d.avgT)
            }
            else {
                return 0;
            }
        });

    self.svg.selectAll('text')
        .data(points)
        .text(function(d) {return d.name})
}

FlatGrapher.prototype.scaleFlat = function() {
    var points = [];
    $.each(functions, function(k,v) {points.push( {name: k, avgT: d3.mean(v.runs)} )})

    var self = this;
    
    self.x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    self.y = d3.scale.linear()
        .range([height, 0]);

    self.xAxis = d3.svg.axis()
        .scale(self.x)
        .orient("bottom");

    self.yAxis = d3.svg.axis()
        .scale(self.y)
        .orient("left")

    self.x.domain(points.map(function(d) { return d.name; }));
    self.y.domain([0, d3.max(points, function(d) { return d.avgT; })]);

    self.svg.selectAll('.x-axis')
        .attr("transform", "translate(0," + height + ")")
        .call(self.xAxis);

    self.svg.selectAll(".y-axis")
        .call(self.yAxis)

    self.redrawFlat()
}

FlatGrapher.prototype.stopFlat = function() {
    var self = this;
    clearInterval(self.redrawer)
}