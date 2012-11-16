var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


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
    self = this
    setTimeout(function() {
    
    var points = [];
    $.each(functions, function(k,v) {points.push( {name: k, avgT: d3.mean(v.runs)} )})

    self.svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    $("svg").draggable();

    self.x.domain(points.map(function(d) { return d.name; }));
    self.y.domain([0, d3.max(points, function(d) { return d.avgT; })]);

    self.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(self.xAxis);

    self.svg.append("g")
        .attr("class", "y axis")
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

    self.redrawer = setInterval(self.redrawFlat.apply(self), 1000);

}, 1000)}

FlatGrapher.prototype.redrawFlat = function() {
    console.log(this)
    self = this;
    var points = [];
    $.each(functions, function(k,v) {points.push( {name: k, avgT: d3.mean(v.runs)} )})

    self.svg.selectAll('rect')
        .data(points)
        .transition()
        .duration(500)
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
        .transition()
        .duration()
        .text(function(d) {return d.name})
}

FlatGrapher.prototype.stopFlat = function() {
    self = this;
    clearInterval(self.redrawer)
}

