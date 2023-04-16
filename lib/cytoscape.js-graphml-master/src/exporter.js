
module.exports = function (cy, $, options) {

  function xmlToString(xmlData) {

    var xmlString;
    //IE
    if (window.ActiveXObject) {
      xmlString = xmlData.xml;
    }
    // code for Mozilla, Firefox, Opera, etc.
    else {
      xmlString = (new XMLSerializer()).serializeToString(xmlData);
    }
    return xmlString;
  }


  function getEleData(ele) {
    var type = ele.isNode() ? "node" : "edge";
    var attrs = ["css", "data", "position"];
    var result = {};

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      var opt = options[type][attr];
      if (!opt)
        result[attr] = {};
      else if ($.isArray(opt)) {
        result[attr] = {};
        for (var j = 0; j < opt.length; j++) {
          var el = opt[i];
          if (ele[attr](el))
            result[attr][el] = ele[attr](el);
        }
      } else {
        var eleAttr = ele[attr]();
        result[attr] = {};
        for (var key in eleAttr)
          if ($.inArray(key, options[type].discludeds) < 0 && key != "parent")
            result[attr][key] = {value: eleAttr[key], attrType: attr};

      }
    }

    return $.extend(result.css, result.data, result.position);
  }


  function parseNode(ele, xml) {
    var node = $('<node />', xml).attr({id: ele.id()}).appendTo(xml);

    var eleData = getEleData(ele);
    for (var key in eleData)
      $('<data />', node).attr({type: eleData[key].attrType, key: key}).text(eleData[key].value).appendTo(node);


    if (ele.isParent()) {
      var subgraph = $('<graph />', node).attr({id: ele.id() + ':'}).appendTo(node);
      ele.children().each(function (child) {
        parseNode(child, subgraph);
      });
    }

    return node;
  }


  options.node.discludeds.push("id");
  options.edge.discludeds.push("id", "source", "target");

  var xmlDoc = $.parseXML(
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<graphml xmlns="http://graphml.graphdrawing.org/xmlns"\n' +
          'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
          'xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns\n' +
          'http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">\n' +
          '  <graph>\n' +
          ' </graph>\n' +
          ' </graphml>\n'
          );
  var $xml = $(xmlDoc);

  var $graph = $xml.find("graph");

  cy.nodes().orphans().forEach(function (ele) {
    parseNode(ele, $graph);
  });

  cy.edges().forEach(function (ele) {

    var edge = $('<edge />', $graph).attr({id: ele.id(), source: ele.source().id(), target: ele.target().id()}).appendTo($graph);

    var eleData = getEleData(ele);
    for (var key in eleData)
      $('<data />', edge).attr({key: key}).text(eleData[key].value).appendTo(edge);

  });


  return xmlToString(xmlDoc);
};
