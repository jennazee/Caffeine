# Caffeine: A Visualized Profiler for Web Applications


#### About
Allows you to capture the run time of specific Javascript objects' methods so you can see how the code YOU wrote is doing

#### Unbundled Dependencies
jQuery

#### Warning
It is recognized that, based on the architecture of this program, profiling your methods using this program slows down your program marginally. We have not yet profiled this program's methods.

### Quick How-To
0. Put the Caffeine folder on your program's path.
1. If you don't already have jQuery as a script in the head of your HTML, put the following line in your HTML head:
		`<script src='../Caffeine/jquery-1.8.2.min.js'></script>`
2. In the head of you HTML file, put following after all of your other requisite JS files

		<script src="http://code.jquery.com/ui/1.9.1/jquery-ui.js"></script>
		<script src='Caffeine/jsProfiler.js' type='text/javascript'></script>
		<script src='http://d3js.org/d3.v2.js'></script>
		<script src='Caffeine/flatGrapher.js' type='text/javascript'></script>
		<script src='Caffeine/stackedGrapher.js' type='text/javascript'></script>
		<link rel="stylesheet" type="text/css" href="Caffeine/profiler.css" />
		<link rel="stylesheet" href="http://code.jquery.com/ui/1.9.1/themes/base/jquery-ui.css" />


3. In your Javascript, just pass the instance of your object that will be used throughout your program to a new instance of the Profiler, along with a boolean of if you want the Profiler to make a graph. Then start the Profiler by calling `start()` on it. Make sure you call `start()` before your object instance does anything, or all of the object's behaviors won't be profiled. For example:
		
		lolcat = new LOLCat();
		new Profiler(lolcat, true).start();


## API
### Application-wide Variables

#### `grapher`
The application-wide graph alias. Starts off as instance of `FlatGrapher`

#### `originators`
A list of ```StackObjects``` representing the top-level functions

#### `functions`
An object holding all the `MethodObjects`

------------------------------

### `MethodObject()`
An object representing one of the profiled object's methods

#### `MethodObject.runs`
An array of the clocked runtime for each time the represented method was run

----------------------------------------------

### `StackObject()`
Dummy representations of objects that keep track of a method's call stack (which methods it calls, tree-like)

#### `StackObject.name`
The name of the method that this object represents

#### `StackObject.children`
An array of StackObjects representing the methods that the represented method calls

----------------------------------

### Profiler

#### `Profiler(toProfile, graphing)`
Creates a new profiler for the passed in object. If graphing == true, the average runtimes will be in a moveable and scalable graph div appended to the bottom of the page upon starting the Profiler

#### `Profiler.start()`
Begins the runtime analysis.

#### `Profiler.traverser()`
Helper method that recursively traverses an object's attributes looking for methods, keeping track of each method it finds, and delegating to Profiler.clocker() for timing the methods.

#### `Profiler.clocker()`
Helper method that wraps a method in clocking code and figures out the call structure of each method. Aids in the creation of the ```originators``` object.

Returns the wrapped method.

--------------------------------------
### Grapher
Super class of FlatGrapher and StackedGrapher

#### `Grapher.init()`
Creates the initial graph. Overridden in subclasses

#### `Grapher.redraw()`
Redraws the graph. Overridden in subclasses. Refreshes every second.

#### `Grapher.scale()`
Scales the graph. Calls redraw(). Overridden in subclasses

#### `Grapher.stop()`
Stops the redrawing of the graph

----------------------------------------------------
### FlatGrapher
Inherits from Grapher

#### `FlatGrapher.init()`
Creates the initial graph visualization such that each method has it's own bar

#### `FlatGrapher.redraw()`
Redraws the graph. See Grapher.redraw() for more information.

####`FlatGrapher.scale()`
Scales the graph.

####`FlatGrapher.stop()`
Stops the redrawing of the graph

-----------------------------------------------------
### StackedGrapher
Inherits from Grapher

#### ```StackedGrapher.init()```
Creates the initial graph visualization such that each bar represents a top-level method in `originators`. Nested inside each bar, recursively, are the methods called by the depicted method.

### `StackedGrapher.nest()`
Helper method for `StackedGrapher.init()` that recursively draws the nested bars

#### `StackedGrapher.redraw()`
Redraws the graph. See `Grapher.redraw()` for more information.

#### `StackedGrapher.recursiveRedraw()`
Helper method for `StackedGrapher.redraw()` that recursively redraws the nested bars

#### `StackedGrapher.scale()`
Scales the graph.

#### `StackedGrapher.stop()`
Stops the redrawing of the graph
