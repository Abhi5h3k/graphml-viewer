cytoscape-graphml
================================================================================

## Description

A Cytoscape.js extension to import from a graph in GraphML format or to export the current Cytsocape.js graph to GraphML format, distributed under [The MIT License](https://opensource.org/licenses/MIT). ([demo](https://ivis-at-bilkent.github.io/cytoscape.js-graphml/demo.html))


## API

`cy.graphml()`
Export the graph as GraphML.

`cy.graphml( cyGraphML )`
Import the graph as GraphML.

`cy.graphml( optionsObj )`
Updates the specified options of extension.

## optionsObj

```js
{
      node: {
        css: false,
        data: true,
        position: true,
        discludeds: []
      },
      edge: {
        css: false,
        data: true,
        discludeds: []
      },
      layoutBy: "cose" // string of layout name or layout function
}
```


## Dependencies

 * Cytoscape.js ^3.2.0
 * jQuery ^1.7 || ^2.0 || ^3.0
 

## Usage instructions

Download the library:
 * via npm: `npm install cytoscape-graphml`,
 * via bower: `bower install cytoscape-graphml`, or
 * via direct download in the repository (probably from a tag).

`require()` the library as appropriate for your project:

CommonJS:
```js
var cytoscape = require('cytoscape');
var jquery = require('jquery');
var graphml = require('cytoscape-graphml');

graphml( cytoscape, jquery ); // register extension
```

AMD:
```js
require(['cytoscape', 'cytoscape-graphml'], function( cytoscape, graphml ){
  graphml( cytoscape ); // register extension
});
```

Plain HTML/JS has the extension registered for you automatically, because no `require()` is needed.


## Publishing instructions

This project is set up to automatically be published to npm and bower.  To publish:

1. Set the version number environment variable: `export VERSION=1.2.3`
1. Publish: `gulp publish`
1. If publishing to bower for the first time, you'll need to run `bower register cytoscape-graphml https://github.com/iVis-at-Bilkent/cytoscape.js-graphml.git`

## Team

  * [Selim Firat Yilmaz](https://github.com/mrsfy), [Metin Can Siper](https://github.com/metincansiper) of [i-Vis at Bilkent University](http://www.cs.bilkent.edu.tr/~ivis)
