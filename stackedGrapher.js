function StackedGrapher(svg, data) {
    Grapher.prototype.init.call(this, svg, data);
    this.colors =  d3.scale.category10();
    this.methodVariations = {};
};

StackedGrapher.prototype = new Grapher();

StackedGrapher.prototype.createCallTree = function() {
    self = this;
    var callTree = {};
    $.each(this.data, function() {
        var curr = this;
        if (!callTree[curr.name]) {
            callTree[curr.name] = [curr];
            self.methodVariations[curr.name] = [curr.name];
        }
        else {
            $.each(callTree[curr.name], function() {
                if (this.sameAs(curr)) {
                    this.collapseTimesInto(curr);
                }
                else {
                    var oldname = curr.name;
                    curr.name = curr.name + '_v_' + self.methodVariations[curr.name].length.toString();
                    self.methodVariations[oldname].push(curr.name);
                    callTree[curr.name] = [curr];
                };
            })
        }
    })
    return callTree;
};

StackedGrapher.prototype.arrayifyCallTree = function(callTree) {
    var callArray = [];
    $.each(callTree, function(k,v) {
        if (v[0].time.length > 1) {
            v[0].time = d3.mean(v[0].time);
        }
        callArray.push(v[0]);
    })
    return callArray
};

//bar chart
StackedGrapher.prototype.init = function() {
    var self = this;

    var topsArray = self.arrayifyCallTree(self.createCallTree(self.data))

    this.x.domain(topsArray.map(function(d) { return d.name; }));
    this.y.domain([0, d3.max(topsArray, function(d) { return d.time; })]);

    this.svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(this.xAxis);

    this.svg.append("g")
        .attr("class", "y-axis")
        .call(this.yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Average Time (ms)");

    this.svg.selectAll(".sbar")
        .data(topsArray)
        .enter().append("rect")
        .attr("class", "sbar")
        .attr('id', function(d) {return d.name})
        .attr("x", function(d) {return self.x(d.name)})
        .attr("width", self.x.rangeBand())
        .attr("y", function(d) { return self.y(d.time) })
        .attr("height", function(d) { return Math.max(0, height-self.y(d.time)); })
        .style('fill', self.colors(0))

    $.each(topsArray, function(){
        self.nest(this, this.name, 1);
    });

    self.redrawer = setInterval(function(){ self.redraw.call(self) }, 1000);
};

StackedGrapher.prototype.nest = function(sObj, id, depth) {
    var self = this;

    var topsArray = self.arrayifyCallTree(self.createCallTree(self.data))
    var width = $('#'+id).attr('width')/topsArray[0].children.length
    for (var i = 0; i < sObj.children.length; i++) {
        d3.select('#graph').append('rect')
            .attr('width', width - padding - padding)
            .attr('x', parseFloat($('#'+id).attr('x'))+(i*width)+padding)
            .attr("y", this.y(sObj.children[i].time))
            .attr("height", Math.max(0, height-this.y(sObj.children[i].time)))
            .attr('id', id + '-'+ sObj.children[i].name)
            .style('fill', this.colors(depth));
        d3.select('#graph').append('text')
            .attr('x', parseFloat($('#'+id).attr('x'))+(i*width)+padding+5)
            .attr("y", this.y(sObj.children[i].time)-2)
            .attr('id', id + '-'+ sObj.children[i].name+ '-TEXT')
            .text(sObj.children[i].name);
        if (sObj.children[i].children.length > 0) {
            this.nest(sObj.children[i], id + '-' + sObj.children[i].name, depth+1)
        }
    }
}

StackedGrapher.prototype.recursiveRedraw = function(sObj, id, depth) {
    var self = this;

    var topsArray = self.arrayifyCallTree(self.createCallTree(self.data))
    var width = $('#'+id).attr('width')/topsArray[0].children.length
    //if this top-level method has been seen in a previous draw
    if (sObj.children.length>0) {
        if (d3.select('#'+id + '-' + sObj.children[0].name)) {
            for (var i=0; i<sObj.children.length; i++) {
                d3.select('#'+id + '-' + sObj.children[i].name)
                    .attr('width', width - padding - padding)
                    .attr('x', parseFloat($('#'+id).attr('x'))+(i*width)+padding)
                    .attr("y", this.y(sObj.children[i].time))
                    .attr("height", Math.max(0, height-this.y(sObj.children[i].time)))
                    .style('fill', this.colors(depth));

                d3.select('#'+id + '-'+ sObj.children[i].name+ '-TEXT')
                    .attr('x', parseFloat($('#'+id).attr('x'))+(i*width)+padding+5)
                    .attr("y", this.y(sObj.children[i].time)-2);

                if (sObj.children[i].children.length > 0) {
                    this.recursiveRedraw(sObj.children[i], depth+1);
                }
            }
        }
    }
    else {
        this.nest(sObj, id, depth);
    }
};

StackedGrapher.prototype.redraw = function() {
    var self = this;

    var topsArray = self.arrayifyCallTree(self.createCallTree(self.data));
    this.x.domain(topsArray.map(function(d) { return d.name; }));
    this.y.domain([0, d3.max(topsArray, function(d) { return d.time; })]);

    d3.select('.x-axis')
        .attr("transform", "translate(0," + height + ")")
        .call(this.xAxis);

    $.each(topsArray, function() {
        if ($('#'+this.name).length > 0) {
            d3.select('#'+this.name)
                .attr("x", self.x(this.name))
                .attr("width", self.x.rangeBand())
                .attr("y", self.y(this.time))
                .attr("height", Math.max(0, height-self.y(this.time)))
        }
        else {
            d3.select('#graph')
                .append('rect')
                .attr("class", "sbar")
                .attr('id', this.name)
                .attr("x", self.x(this.name))
                .attr("width", self.x.rangeBand())
                .attr("y", self.y(this.time))
                .attr("height", Math.max(0, height-self.y(this.time)))
                .style('fill', self.colors(0))
        }
        self.recursiveRedraw(this, this.name, 1);
    });
};


StackedGrapher.prototype.scale = function() {
    var self = this;
    var topsArray = self.arrayifyCallTree(self.createCallTree(self.data));

    self.x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    self.y = d3.scale.linear()
        .range([height, 0]);

    self.xAxis = d3.svg.axis()
        .scale(self.x)
        .orient("bottom");

    self.yAxis = d3.svg.axis()
        .scale(self.y)
        .orient("left");

    self.x.domain(topsArray.map(function(d) { return d.name; }));
    self.y.domain([0, d3.max(topsArray, function(d) { return d.time; })]);

    self.svg.selectAll('.x-axis')
        .attr("transform", "translate(0," + height + ")")
        .call(self.xAxis);

    self.svg.selectAll(".y-axis")
        .call(self.yAxis);

    self.redraw();
};