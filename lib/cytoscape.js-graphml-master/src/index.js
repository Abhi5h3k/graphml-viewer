;
(function () {
  'use strict';

  // registers the extension on a cytoscape lib ref
  var register = function (cytoscape, $) {

    if (!cytoscape || !$) {
      return;
    } // can't register if cytoscape unspecified

    var exporter = require("./exporter");
    var importer = require("./importer");


    var options = {
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
    };



    cytoscape('core', 'graphml', function (cyGraphML) {
      var cy = this;
      var res;

      switch (typeof cyGraphML) {
        case "string": // import
          res = importer(cy, $, options, cyGraphML);
          break;
        case "object": // set options
          $.extend(true, options, cyGraphML);
          res = cy;
          break;
        case "undefined": // export
          res = exporter(cy, $, options);
          break;
        default:
          console.log("Functionality(argument) of .graphml() is not recognized.");
      }

      return res;

    });

  };

  if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
    module.exports = register;
  }

  if (typeof define !== 'undefined' && define.amd) { // expose as an amd/requirejs module
    define('cytoscape-graphml', function () {
      return register;
    });
  }

  if (typeof cytoscape !== 'undefined' && typeof $ !== 'undefined') { // expose to global cytoscape (i.e. window.cytoscape)
    register(cytoscape, $);
  }

})();
