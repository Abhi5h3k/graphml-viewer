// @collapse
import {
  Component,
  OnInit
} from '@angular/core';
import {
  FormControl
} from '@angular/forms';
import {
  MatDialog} from "@angular/material";
import {
  MatSnackBar
} from '@angular/material/snack-bar';
import ApexCharts from 'apexcharts/dist/apexcharts.common.js';
// import automove from 'cytoscape-automove';
// import coseBilkent from 'cytoscape-cose-bilkent';
// import cise from 'cytoscape-cise';
import fcose from 'cytoscape-fcose';
import d3Force from 'cytoscape-d3-force';
import dagre from 'cytoscape-dagre';
// import navigator from 'cytoscape-navigator';
// import klay from 'cytoscape-klay';


// import ELK from "elkjs/lib/elk.bundled";
// import cola from 'cytoscape-cola';


import layoutUtilities from 'cytoscape-layout-utilities';
import * as saveAs from 'file-saver';
import * as $ from 'jquery';
import * as JSZip from 'jszip';
import * as graphml from  '../../../lib/cytoscape.js-graphml-master';
import * as cytoscapePanzoom from 'node_modules/cytoscape-panzoom/cytoscape-panzoom.js';
import * as viewUtilities from 'node_modules/cytoscape-view-utilities/cytoscape-view-utilities.js';
import cytoscape from 'node_modules/cytoscape/dist/cytoscape.min.js';
import * as introJs from 'node_modules/intro.js/intro.js';
import ForceGraph3D from "../3d-force/3d-force-graph.min.js";
import {
  Observable
} from 'rxjs';
import {
  map,
  startWith
} from 'rxjs/operators';
import {
  DataServiceService
} from '../data-service.service';
import {
  TabledComponent
} from '../tabled/tabled.component';

import Swal from 'sweetalert2';

// import * as xml2json from "../xml_handler/xml2json.js";
// import * as json2xml from "../xml_handler/json2xml";


@Component({
  selector: 'app-visualiser',
  templateUrl: './visualiser.component.html',
  styleUrls: ['./visualiser.component.css']
})
export class VisualiserComponent implements OnInit {
  // name of the node attribute key, Value of this key is url to the node backgrond image
  node_image_attribute_name = 'image';
  // True or False based on checkbox, To show or Hide node background image
  isShowImageOnNode = false;

  // show preloader while graph load
  showPreloader = false;

  // last set Layout, default is fcose
  last_layout_name = 'fcose';

  // If true then show node / edge hover effect
  enableHoverEffect = true;

  // scrollbar option
  scrollbar_options = {
    autoHide: true

  }

  // change node shape as per legend
  change_node_shape_by_legend = true;
  // Take node shape from 'node_shape' attribute in node data
  node_shape_from_node_data = false;
  // check for this key in node data for node shape
  node_shape_key_name = 'node_shape';

  // If true then, search bar result node will be focused with neighbour else only highlight. Note: search will allow only one node to focus but you can manualy click select multiple node for focus
  focus_on_searched_item = true;

  show_edge_label = false;
  edge_label = [];
  chart_dropdown_options;
  private key_counts;
  max_deg = 0;
  max_indeg = 0;
  min_deg = 0;
  min_indeg = 0;
  show_graph_screen = false;
  all_ele = true;
  color_value1;
  color_value2;
  private cy;
  private api;
  private api2;
  files_uploaded;
  last_graph_index = 0;
  // list of graph json for navigation
  private list_of_graph_json = {};
  // list of captured graph images
  list_of_images = [];
  current_graph_node_count = 0;
  current_graph_edge_count = 0;
  private element_data = [];
  private element_data_header = [];
  private connection_data_header = [];
  private connection_data = [];
  private table_heading = 'Table'
  numeric_node_attr = [];
  str_node_attr = [];
  private node_attr_options = {};
  private color_map = {};
  private layout;
  myControl = new FormControl();
  private options: string[];
  filteredOptions: Observable < string[] > ;
  private my_color_palette = ["#ef5331", "#2f972f", "#EAE2B7", "#FCBF49", "#F77F00", "#D62828", "#F97068", "#D1D646", "#57C4E5", "#4F4789", "#FFB17A", "#FCE762", "#FF331F", "#657ED4", "#3626A7", "#721B65", "#B80D57", "#F8615A", "#FFD868", "#FFE2D1", , "#6BAB90", "#12b57f", "#55917F", "#cc0024"];
  private possible_node_shapes = ["ellipse", "triangle", "round-triangle", "rectangle", "round-rectangle", "bottom-round-rectangle", "cut-rectangle", "barrel", "rhomboid", "diamond", "round-diamond", "pentagon", "round-pentagon", "hexagon", "round-hexagon", "concave-hexagon", "heptagon", "round-heptagon", "octagon", "round-octagon", "star", "tag", "round-tag", "vee"];
  // If graph is rendering in 3d then : true
  render3d = false;
  graph3d = null;
  nodes_dict;
  constructor(private data: DataServiceService, private dialog: MatDialog, private _snackBar: MatSnackBar) {}
  // <-3d graph
  formatGraphTo3dData() {
    var gData = {
      nodes: [],
      links: []
    }

    // console.log(this.cy.nodes());
    // console.log();
    // console.log(this.cy.edges());
    var nodes_dict = {};
    this.cy.nodes().forEach(element => {
      // console.log(element);
      var data = element._private.data;
      data.neighbors = [];
      data.links = [];
      gData.nodes.push(data);
      nodes_dict[data['id']] = data;
    });
    this.nodes_dict = nodes_dict;
    this.cy.edges().forEach(element => {
      gData.links.push(element._private.data);
    });

    return gData;

  }

  // show or hide node backgroud image, need to have "image" key in node data
  showImageOnNode() {
    if (this.isShowImageOnNode) {
      this.cy.nodes().addClass('image');
    } else {
      this.cy.nodes().removeClass('image');
    }
  }

  render3dGraph() {
    if (this.render3d) {

      document.getElementById('mataccordion').style.display = "none";
      document.getElementById('lassoTool').style.display = "none";
      document.getElementById('zoomToSelected').style.display = "none";
      document.getElementById('3dmataccordion').style.display = "block";

      const div_3d = document.getElementById('cy3d');
      div_3d.style.display = "block";
      div_3d.style.zIndex = "2";

      const div_cy = document.getElementById('cy');
      div_cy.style.display = "none";

      // const N = 300;
      // const gData = {
      //   nodes: [...Array(N).keys()].map(i => ({
      //     id: i
      //   })),
      //   links: [...Array(N).keys()]
      //     .filter(id => id)
      //     .map(id => ({
      //       source: id,
      //       target: Math.round(Math.random() * (id - 1))
      //     }))


      // };
      const highlightNodes = new Set();
      const highlightLinks = new Set();
      let hoverNode = null;
      var gData = this.formatGraphTo3dData();
      // console.log(gData);

      gData.links.forEach(link => {
        // console.log(link)
        // console.log(this.nodes_dict[link.source]);
        // console.log(this.nodes_dict[link.target]);
        const a = this.nodes_dict[link.source];
        const b = this.nodes_dict[link.target];
        // console.log(a);
        // !a.neighbors && (a.neighbors = []);
        // !b.neighbors && (b.neighbors = []);
        a.neighbors.push(b);
        b.neighbors.push(a);

        // !a.links && (a.links = []);
        // !b.links && (b.links = []);
        a.links.push(link);
        b.links.push(link);
      });
      // console.log(gData.links);

      var _this = this;
      // .linkDirectionalParticles(2).linkDirectionalParticleColor("green")
      const Graph = ForceGraph3D()
        (document.getElementById('cy3d'));
      this.graph3d = Graph;
      // .linkAutoColorBy("source")
      // removed this color as we want to set by option
      // .nodeColor(node => highlightNodes.has(node) ? node === hoverNode ? 'rgb(255,0,0,1)' : 'rgba(255,160,0,0.8)' : 'rgba(0,255,255,0.6)')
      Graph.graphData(gData).backgroundColor("#252525").height('93vh').width('100vw').linkWidth(link => highlightLinks.has(link) ? 4 : 1)
        .linkDirectionalParticles(link => highlightLinks.has(link) ? 4 : 0)
        .linkDirectionalParticleWidth(4).onNodeHover(node => {
          // no state change
          if ((!node && !highlightNodes.size) || (node && hoverNode === node)) return;

          highlightNodes.clear();
          highlightLinks.clear();
          if (node) {
            highlightNodes.add(node);
            node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
            node.links.forEach(link => highlightLinks.add(link));
          }

          hoverNode = node || null;

          _this.updateHighlight();
          if (node) {
            return `${node.user}: ${node.description}`;
          }

        })
        .onLinkHover(link => {
          highlightNodes.clear();
          highlightLinks.clear();
          // if(link != null){
          //      _this.openSnackBar("Edge connection [ " + link.source.id + " : " +link.target.id + " ]", '!!');
          //       }
          if (link) {
            highlightLinks.add(link);
            highlightNodes.add(link.source);
            highlightNodes.add(link.target);

          }

          _this.updateHighlight();
        }).onNodeClick(node => {
          // Aim at node from outside it
          const distance = 40;
          const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

          Graph.cameraPosition({
              x: node.x * distRatio,
              y: node.y * distRatio,
              z: node.z * distRatio
            }, // new position
            node, // lookAt ({ x, y, z })
            3000 // ms transition duration
          );
        });

      //   onLinkHover((link ,prevLink) =>{
      //     if(link != null){
      //    _this.openSnackBar("Edge connection [ " + link.source.id + " : " +link.target.id + " ]", '!!');
      //     }
      //  })

      // 
      // const controls = {
      //   'DAG Orientation': 'td'
      // };
      // const gui = new dat.GUI();
      // gui.add(controls, 'DAG Orientation', ['td', 'bu', 'lr', 'rl', 'zout', 'zin', 'radialout', 'radialin', null])
      //   .onChange(orientation => graph && graph.dagMode(orientation));

      // // graph config
      // const NODE_REL_SIZE = 1;
      // const graph = ForceGraph3D()
      //   .dagMode('td')
      //   .dagLevelDistance(200)
      //   .backgroundColor('#101020')
      //   .linkColor(() => 'rgba(255,255,255,0.2)')
      //   .nodeRelSize(NODE_REL_SIZE)
      //   .nodeId('path')
      //   .nodeVal('size')
      //   .nodeLabel('path')
      //   .nodeAutoColorBy('module')
      //   .nodeOpacity(0.9)
      //   .linkDirectionalParticles(2)
      //   .linkDirectionalParticleWidth(0.8)
      //   .linkDirectionalParticleSpeed(0.006)
      //   .d3Force('collision', d3.forceCollide(node => Math.cbrt(node.size) * NODE_REL_SIZE))
      //   .d3VelocityDecay(0.3);

      // // Decrease repel intensity
      // graph.d3Force('charge').strength(-15);

    } else {
      // console.log("else");
      document.getElementById('mataccordion').style.display = "block";
      document.getElementById('lassoTool').style.display = "block";
      document.getElementById('zoomToSelected').style.display = "block";
      document.getElementById('3dmataccordion').style.display = "none";
      var div_3d = document.getElementById('cy3d');
      div_3d.style.display = "none";
      div_3d.style.zIndex = "1";
      var div_cy = document.getElementById('cy');
      div_cy.style.display = "block";
    }
  }
  updateHighlight() {
    // trigger update of highlighted objects in scene
    var Graph = this.graph3d;
    // console.log("called");
    Graph.nodeColor(Graph.nodeColor()).linkWidth(Graph.linkWidth()).linkDirectionalParticles(Graph.linkDirectionalParticles());
  }
  // ->


  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
  nodeSizeSlider(event) {
    if (this.all_ele) {
      this.cy.nodes().style({
        'width': event.value,
        'height': event.value
      });
    } else {
      this.cy.nodes(":selected").style({
        'width': event.value,
        'height': event.value
      });
    }
  }
  arrowSizeSlider(event) {
    if (this.all_ele) {
      this.cy.edges().style({
        'arrow-scale': event.value
      });
    } else {
      this.cy.edges(":selected").style({
        'arrow-scale': event.value
      });
    }
  }
  nodeLabelSizeSlider(event) {
    if (this.all_ele) {
      this.cy.nodes().style({
        "font-size": event.value
      });
    } else {
      this.cy.nodes(":selected").style({
        "font-size": event.value
      });
    }
  }
  edgeLabelSizeSlider(event) {
    if (this.all_ele) {
      this.cy.edges().style({
        "font-size": event.value
      });
    } else {
      this.cy.edges(":selected").style({
        "font-size": event.value
      });
    }
  }
  packComponents() {
    var cy = this.cy;
    var components = cy.elements(":visible").components();
    var subgraphs = [];
    components.forEach(function (component) {
      var subgraph = {};
      subgraph["nodes"] = [];
      subgraph["edges"] = [];
      component.edges().forEach(function (edge) {
        var boundingBox = edge.boundingBox();
        subgraph["edges"].push({
          startX: boundingBox.x1,
          startY: boundingBox.y1,
          endX: boundingBox.x2,
          endY: boundingBox.y2
        });
      });
      component.nodes().forEach(function (node) {
        var boundingBox = node.boundingBox();
        subgraph["nodes"].push({
          x: boundingBox.x1,
          y: boundingBox.y1,
          width: boundingBox.w,
          height: boundingBox.h
        });
      });
      subgraphs.push(subgraph);
    });
    var result = this.api2.packComponents(subgraphs);
    components.forEach(function (component, index) {
      component.nodes().layout({
        name: 'preset',
        animate: 'end',
        // Duration for animate:end
        // animationDuration: 500,
        fit: true,
        transform: (node) => {
          let position = {};
          position["x"] = node.position('x') + result.shifts[index].dx;
          position["y"] = node.position('y') + result.shifts[index].dy;
          return position;
        }
      }).run();
    });
  }
  edge_label_option_click(op) {

    if (this.render3d) {
      this.graph3d.linkLabel(op);
      return;
    }

    this.cy.edges().style({
      ["label"]: function (ele) {
        return ele._private.data[op];
      },
      "text-rotation": "autorotate",
      'color': '#000000',
      'text-background-color': '#fff',
      'text-background-opacity': .8,
      'text-background-shape': 'roundrectangle',
      "font-size": 2.5,
    });
  }
  toggel_show_ege_label(bl) {
    this.show_edge_label = bl;
    if (!bl) {
      this.cy.edges().style({
        "font-size": 0,
        'text-background-opacity': 0
      });
    }
  }



  private funn_click = false;
  private chart1 = null;
  chart_option_click(op) {
    this.funn_click = !this.funn_click;
    var label_list = [];
    var value_list = []
    for (var key in this.key_counts[op]) {
      label_list.push(key);
      var percent = parseInt(this.key_counts[op][key]) / this.cy.nodes().length * 100
      value_list.push(parseInt(percent.toFixed(2)));
    }
    var option1 = {
      chart: {
        height: 400,
        type: 'donut'
      },
      series: value_list,
      labels: label_list
    }
    var option2 = {
      chart: {
        height: 400,
        type: "radialBar",
      },
      series: value_list,
      plotOptions: {
        radialBar: {
          dataLabels: {
            total: {
              show: true,
              label: op + ' distribution',
              formatter: function () {
                return "";
              }
            }
          }
        }
      },
      labels: label_list
    };
    if (this.chart1 != null) {
      document.getElementById('chart1_c').remove();
    }
    var ele = document.createElement('div');
    ele.setAttribute("id", 'chart1_c')
    document.getElementById("chart1").appendChild(ele);
    this.chart1 = new ApexCharts(document.querySelector("#chart1_c"), this.funn_click ? option1 : option2).render();
  }
  getButtonsToDef() {
    document.getElementById("lassoTool").style.backgroundColor = "#11ffee00";
  }

  set_node_size(option_value) {


    var cy = this.cy;
    
    if (cy.$(":visible").length > 0) {
      this.openSnackBar("Update!! Node size", '!!');
      var nodes = this.cy.nodes(':visible');

      // var scores_of_attr = [];
      // nodes.forEach(function (n) {
      //  scores_of_attr.push(n._private.data[option_value]);
      // });

      // const sum = scores_of_attr.reduce((a, b) => a + b, 0);
      // const avg = (sum / scores_of_attr.length) || 0;
      // console.log(avg);

      nodes.forEach(function (n) {
        var defaultHeight = n.height();

        var size = parseInt(n._private.data[option_value]) + parseInt(defaultHeight);
        // console.log(`${size} : ${n._private.data[option_value]} : ${defaultHeight}`);
        cy.$('#' + n._private.data.id).style({
          'width': size,
          'height': size
        });
      });
    }
  }
  build_style_attr() {
    var cy = this.cy;
    if (cy.$(":visible").length > 0) {
      var nodes = this.cy.nodes(':visible');
      var n = [];
      if ((nodes).length >= 1) {
        n = Object.keys(nodes[0]._private.data);
      }
      var edges = this.cy.edges(':visible');
      var r = [];
      if ((edges).length >= 1) {
        r = Object.keys(edges[0]._private.data);
      }
      this.edge_label = r;
      for (var i = 0; i < nodes.length; i++) {
        var data = nodes[i]._private.data;
        for (let j = 0; j < n.length; j++) {
          if (n[j] in data) {
            var val = data[n[j]];
            if (!isNaN(parseInt(val))) {
              if (!this.numeric_node_attr.includes(n[j])) {
                this.numeric_node_attr.push(n[j]);
              }
            } else {
              if (!this.str_node_attr.includes(n[j])) {
                this.str_node_attr.push(n[j])
              }
            }
            if (n[j] in this.node_attr_options) {
              if (!this.node_attr_options[n[j]].includes(val)) {
                if (!isNaN(parseInt(val))) {
                  this.node_attr_options[n[j]].push(parseInt(val));
                } else {
                  this.node_attr_options[n[j]].push(val);
                }
              }
            } else {
              if (!isNaN(parseInt(val))) {
                this.node_attr_options[n[j]] = [parseInt(val)];
              } else {
                this.node_attr_options[n[j]] = [val];
              }
            }
          }
        }
      }
      var options = [];
      var node_attr_options = this.node_attr_options;
      var str_node_attr = this.str_node_attr;
      for (var i = 0; i < this.str_node_attr.length; i++) {
        (node_attr_options[str_node_attr[i]]).forEach(element => {
          options.push(str_node_attr[i] + " : " + element);
        });
      }
      this.options = options;
    }
  }
  set_node_color(option_value) {

    var cy = this.cy;
    var context = this;
    var color_map = {};


    var color_applied = [];
    if (cy.$(":visible").length > 0 || this.render3d) {
      this.openSnackBar("Update!! Node color", '!!');
      var values_for_selected_option = this.node_attr_options[option_value];
      for (var i = 0; i < values_for_selected_option.length; i++) {
        if (i < this.my_color_palette.length) {
          var color = this.my_color_palette[i];
        } else {
          var color = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
        }
        if (!color_applied.includes(color)) {
          color_map[values_for_selected_option[i]] = color;
          color_applied.push(color);

        } else {
          while (true) {
            var color = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
            if (!color_applied.includes(color)) {
              color_map[values_for_selected_option[i]] = color;
              color_applied.push(color);
              break;
            }
          }
        }
      }
      this.color_map = color_map;

      var node_shape_map = {};
      if (this.change_node_shape_by_legend) {
        if (!this.node_shape_from_node_data) {
          if (values_for_selected_option.length <= this.possible_node_shapes.length) {
            for (var i = 0; i < values_for_selected_option.length; i++) {
              node_shape_map[values_for_selected_option[i]] = this.possible_node_shapes[i];
            }
          }
        }


      }

      if (this.render3d) {

        // this.graph3d.nodeAutoColorBy(option_value);
        // 
        this.graph3d.nodeColor(ele => {
          return color_map[ele[option_value]];
        });
        this.graph3d.refresh();
        this.create_legend();
        return;
      }

      var nodes = this.cy.nodes(':visible');
      cy.filter(nodes).forEach(function (n) {
        var val = n._private.data[option_value];
        var color_value = color_map[val];

        var shape_val = undefined;

        if (context.change_node_shape_by_legend) {
          if (!context.node_shape_from_node_data) {
            shape_val = node_shape_map[val];
          } else {
            shape_val = n._private.data[context.node_shape_key_name];
            console.log(shape_val);
          }
        }
        cy.$('#' + n._private.data.id).style({
          'background-color': color_value,
          "shape": shape_val
        });
      });
      this.set_edge_color(option_value);
      this.create_legend();
      // this.layout.run();
    }
  }
  set_node_label(option_value) {
    if (this.render3d) {
      this.graph3d.nodeLabel(option_value);
      return;
    }
  }
  set_edge_color(option_value) {

    this.openSnackBar("update!! Edge coolr", '!!');
    var cy = this.cy;
    var edges = this.cy.edges(':visible');
    var color_map = this.color_map;
    cy.filter(edges).forEach(function (n) {
      var source = n._private.data['source'];
      var target = n._private.data['target'];
      var source_color_value = color_map[cy.nodes('#' + source)[0]._private.data[option_value]];
      var target_color_value = color_map[cy.nodes('#' + target)[0]._private.data[option_value]];
      if (source_color_value == undefined || target_color_value == undefined) {
        return;
      }
      n.style({
        'line-fill': 'linear-gradient',
        'line-gradient-stop-colors': source_color_value + " " + target_color_value,
      });
    });
  }
  closeLegend() {
    let clelement = document.getElementById('closelegend');
    clelement.style.visibility = "hidden";
    let element = document.getElementById('legend');
    element.style.display = "none";
  }
  create_legend() {
    this.openSnackBar("Legend!! available", '!!');
    var legendTable = '<table  style="width:100%"><tbody style="overflow: auto">';
    var row = "";
    for (const [key, value] of Object.entries(this.color_map)) {
      var row = row + '<tr><td><svg height="50" width="50"><circle cx="25" cy="25" r="10" stroke-width="1" fill="' + value + '" />  </svg></td><td>' + key + '</td></tr>';
    }
    legendTable = legendTable + row + '</tbody></table>';
    let element = document.getElementById('legend');

    // element.style.display = "block";
    // let clelement = document.getElementById('closelegend');
    // clelement.style.visibility = "visible";
    // element.style.zIndex = "2";
    element.innerHTML = legendTable;
    $("#legend").show();
    setTimeout(function () {
      $("#legend").hide();
    }, 10000);
  }
  changeNColor(evt) {
    this.color_value1 = evt;
    this.setNodeColor();
  }
  changeEColor(evt) {
    this.color_value2 = evt;
    this.setNodeColor(true);
  }
  setNodeColor(isEdge = false) {
    this.api.disableMarqueeZoom();
    this.api.disableLassoMode();
    var cy = this.cy;
    if (cy.$(":selected").length > 0) {
      var color_value = this.color_value1;
      cy.$(":selected").style({
        'background-color': color_value
      });
      if (isEdge) {
        var color_value = this.color_value2;
        cy.$("edge:selected").style({
          'line-color': color_value
        });
      }
    }
  }



  // ng init
  ngOnInit() {
    cytoscapePanzoom(cytoscape);
    viewUtilities(cytoscape);
    cytoscape.use(layoutUtilities);
    // cytoscape.use(coseBilkent);
    cytoscape.use(fcose);
    cytoscape.use(d3Force);
    cytoscape.use(dagre); // register extension
    // navigator( cytoscape ); // register extension
    // cytoscape.use( klay );


    // cytoscape.use(elk);




    // cytoscape.use(cola);
    // cytoscape.use(automove);
    graphml(cytoscape, $, graphml);

    this.init_cy();
    this.readGraphml();
    this.init_event();
    this.build_style_attr();

    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );

    this.current_graph_node_count = (this.cy.nodes()).length;
    this.current_graph_edge_count = (this.cy.edges()).length;

    //   var e = document.getElementById('navigator_ele');
    //   // navigator
    //   var defaults = {
    //     container: e // html dom element
    //   , viewLiveFramerate: 0 // set false to update graph pan only on drag end; set 0 to do it instantly; set a number (frames per second) to update not more than N times per second
    //   , thumbnailEventFramerate: 30 // max thumbnail's updates per second triggered by graph updates
    //   , thumbnailLiveFramerate: false // max thumbnail's updates per second. Set false to disable
    //   , dblClickDelay: 200 // milliseconds
    //   , removeCustomContainer: true // destroy the container specified by user on plugin destroy
    //   , rerenderDelay: 100 // ms to throttle rerender updates to the panzoom for performance
    // };
    // var nav = this.cy.navigator( defaults ); // get navigator instance, nav

  }
  // various layout config
  layoutOptions(layout_name, settings = null) {
    var context = this;
    if (layout_name == 'fcose') {
      // console.log('fcose');
      var fcoselayoutOptions = {
        name: 'fcose',
        // 'draft', 'default' or 'proof' 
        // - "draft" only applies spectral layout 
        // - "default" improves the quality with incremental layout (fast cooling rate)
        // - "proof" improves the quality with incremental layout (slow cooling rate) 
        quality: "default",
        // Use random node positions at beginning of layout
        // if this is set to false, then quality option must be "proof"
        randomize: true,
        // Whether or not to animate the layout
        animate: true,
        // Duration of animation in ms, if enabled
        animationDuration: 1000,
        // Easing of animation, if enabled
        animationEasing: undefined,
        // Fit the viewport to the repositioned nodes
        fit: true,
        // Padding around layout
        padding: 30,
        // Whether to include labels in node dimensions. Valid in "proof" quality
        nodeDimensionsIncludeLabels: false,
        // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
        uniformNodeDimensions: false,
        // Whether to pack disconnected components - valid only if randomize: true
        packComponents: true,
        // Layout step - all, transformed, enforced, cose - for debug purpose only
        step: "all",

        /* spectral layout options */

        // False for random, true for greedy sampling
        samplingType: true,
        // Sample size to construct distance matrix
        sampleSize: 25,
        // Separation amount between nodes
        nodeSeparation: 75,
        // Power iteration tolerance
        piTol: 0.0000001,

        /* incremental layout options */

        // Node repulsion (non overlapping) multiplier
        nodeRepulsion: node => 4500,
        // Ideal edge (non nested) length
        idealEdgeLength: edge => 50,
        // Divisor to compute edge forces
        edgeElasticity: edge => 0.45,
        // Nesting factor (multiplier) to compute ideal edge length for nested edges
        nestingFactor: 0.1,
        // Maximum number of iterations to perform
        numIter: 2500,
        // For enabling tiling
        tile: true,
        // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
        tilingPaddingVertical: 10,
        // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
        tilingPaddingHorizontal: 10,
        // Gravity force (constant)
        gravity: 0.25,
        // Gravity range (constant) for compounds
        gravityRangeCompound: 1.5,
        // Gravity force (constant) for compounds
        gravityCompound: 1.0,
        // Gravity range (constant)
        gravityRange: 3.8,
        // Initial cooling factor for incremental layout  
        initialEnergyOnIncremental: 0.3,

        /* constraint options */

        // Fix desired nodes to predefined positions
        // [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
        fixedNodeConstraint: undefined,
        // Align desired nodes in vertical/horizontal direction
        // {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
        alignmentConstraint: undefined,
        // Place two nodes relatively in vertical/horizontal direction
        // [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
        relativePlacementConstraint: undefined,

        // Called on `layoutready`
        ready: function () {
          context.showPreloader = true;
        },
        // Called on `layoutstop`
        stop: function () {
          context.showPreloader = false;
        },
      };

      return fcoselayoutOptions;
    }

    if (layout_name == 'circle') {
      return {
        name: 'circle', // Called on `layoutready`
        ready: function () {
          context.showPreloader = true;
        },
        // Called on `layoutstop`
        stop: function () {
          context.showPreloader = false;
        },
      };
    }

    if (layout_name == 'concentric') {

      var concentriclayoutOptions = {
        name: 'concentric',

        fit: true, // whether to fit the viewport to the graph
        padding: 30, // the padding on fit
        startAngle: 3 / 2 * Math.PI, // where nodes start in radians
        sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
        clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
        equidistant: false, // whether levels have an equal radial distance betwen them, may cause bounding box overflow
        minNodeSpacing: 50, // min spacing between outside of nodes (used for radius adjustment)
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
        height: undefined, // height of layout area (overrides container height)
        width: undefined, // width of layout area (overrides container width)
        spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
        concentric: function (node) { // returns numeric value for each node, placing higher nodes in levels towards the centre
          return node.degree();
        },
        levelWidth: function (nodes) { // the variation of concentric values in each level
          return nodes.maxDegree() / 4;
        },
        animate: function () {
          if (context.cy.edges().length < 400) {
            return true;
          } else return false;
        }, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: 'ease', // easing of animation if enabled
        animateFilter: function (node, i) {
          return true;
        }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts

        transform: function (node, position) {
          return position;
        }, // transform a given node position. Useful for changing flow direction in discrete layouts
        // Called on `layoutready`
        ready: function () {
          context.showPreloader = true;
        },
        // Called on `layoutstop`
        stop: function () {
          context.showPreloader = false;
        },

      };
      return concentriclayoutOptions;
    }
    if (layout_name == 'd3Force') {
      var d3ForcelayoutOptions = {
        name: 'd3-force',
        fit: true,
        ungrabifyWhileSimulating: true,

        animate: function () {
          if (context.cy.edges().length < 400 && context.cy.nodes().length < 900) {
            return true;
          }

          return false;
        },
        fixedAfterDragging: false,
        linkId: function id(d) {
          return d.id;
        },
        linkDistance: 80,
        manyBodyStrength: -300,
        // Called on `layoutready`
        ready: function () {
          context.showPreloader = true;
        },
        // Called on `layoutstop`
        stop: function () {
          context.showPreloader = false;
        },
        // tick: function(progress) {
        //   console.log('progress - ', progress);
        // },
        randomize: false,
        infinite: true
      }
      return d3ForcelayoutOptions;
    }
    if (layout_name == 'dagre') {
      var dagreLayoutOptions = {
        name: 'dagre',
        // dagre algo options, uses default value on undefined
        nodeSep: undefined, // the separation between adjacent nodes in the same rank
        edgeSep: undefined, // the separation between adjacent edges in the same rank
        rankSep: undefined, // the separation between each rank in the layout
        rankDir: undefined, // 'TB' for top to bottom flow, 'LR' for left to right,
        ranker: undefined, // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
        minLen: function (edge) {
          return 1;
        }, // number of ranks to keep between the source and target of the edge
        edgeWeight: function (edge) {
          return 1;
        }, // higher weight edges are generally made shorter and straighter than lower weight edges

        // general layout options
        fit: true, // whether to fit to viewport
        padding: 30, // fit padding
        spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
        nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node
        animate: function () {
          if (context.cy.edges().length < 800) {
            return true;
          } else return false;
        }, // whether to transition the node positions
        animateFilter: function (node, i) {
          return true;
        }, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        transform: function (node, pos) {
          return pos;
        }, // a function that applies a transform to the final node position
        // Called on `layoutready`
        ready: function () {
          context.showPreloader = true;
        },
        // Called on `layoutstop`
        stop: function () {
          context.showPreloader = false;
        },
      };
      return dagreLayoutOptions;
    }
    // if(layout_name == 'klay'){
    //   var klayLayoutOptions ={
    //     name : 'klay',
    //     nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
    //     fit: true, // Whether to fit
    //     padding: 20, // Padding on fit
    //     animate: false, // Whether to transition the node positions
    //     animateFilter: function( node, i ){ return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
    //     animationDuration: 500, // Duration of animation in ms if enabled
    //     animationEasing: undefined, // Easing of animation if enabled
    //     transform: function( node, pos ){ return pos; }, // A function that applies a transform to the final node position
    //     ready: undefined, // Callback on layoutready
    //     stop: undefined, // Callback on layoutstop
    //     klay: {
    //       // Following descriptions taken from http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
    //       addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
    //       aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
    //       borderSpacing: 20, // Minimal amount of space to be left to the border
    //       compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
    //       crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
    //       /* LAYER_SWEEP The layer sweep algorithm iterates multiple times over the layers, trying to find node orderings that minimize the number of crossings. The algorithm uses randomization to increase the odds of finding a good result. To improve its results, consider increasing the Thoroughness option, which influences the number of iterations done. The Randomization seed also influences results.
    //       INTERACTIVE Orders the nodes of each layer by comparing their positions before the layout algorithm was started. The idea is that the relative order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive layer sweep algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
    //       cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
    //       /* GREEDY This algorithm reverses edges greedily. The algorithm tries to avoid edges that have the Priority property set.
    //       INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values.*/
    //       direction: 'UNDEFINED', // Overall direction of edges: horizontal (right / left) or vertical (down / up)
    //       /* UNDEFINED, RIGHT, LEFT, DOWN, UP */
    //       edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
    //       edgeSpacingFactor: 0.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
    //       feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
    //       fixedAlignment: 'NONE', // Tells the BK node placer to use a certain alignment instead of taking the optimal result.  This option should usually be left alone.
    //       /* NONE Chooses the smallest layout from the four possible candidates.
    //       LEFTUP Chooses the left-up candidate from the four possible candidates.
    //       RIGHTUP Chooses the right-up candidate from the four possible candidates.
    //       LEFTDOWN Chooses the left-down candidate from the four possible candidates.
    //       RIGHTDOWN Chooses the right-down candidate from the four possible candidates.
    //       BALANCED Creates a balanced layout from the four possible candidates. */
    //       inLayerSpacingFactor: 1.0, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
    //       layoutHierarchy: false, // Whether the selected layouter should consider the full hierarchy
    //       linearSegmentsDeflectionDampening: 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
    //       mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
    //       mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
    //       nodeLayering:'NETWORK_SIMPLEX', // Strategy for node layering.
    //       /* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
    //       LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
    //       INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
    //       nodePlacement:'BRANDES_KOEPF', // Strategy for Node Placement
    //       /* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
    //       LINEAR_SEGMENTS Computes a balanced placement.
    //       INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
    //       SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
    //       randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
    //       routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
    //       separateConnectedComponents: true, // Whether each connected component should be processed separately
    //       spacing: 20, // Overall setting for the minimal amount of space to be left between objects
    //       thoroughness: 7 // How much effort should be spent to produce a nice layout..
    //     },
    //     priority: function( edge ){ return null; }, // Edges with a non-nil value are skipped when greedy edge cycle breaking is enabled
    //   };
    //   return klayLayoutOptions;
    // }

    if(layout_name == '3ddag'){
      
      const rootId = 0;

    // Random tree
    const N = 300;
    const gData = {
      nodes: [...Array(N).keys()].map(i => ({ id: i, collapsed: i !== rootId, childLinks: [] })),
      links: [...Array(N).keys()]
        .filter(id => id)
        .map(id => ({
          source: Math.round(Math.random() * (id - 1)),
          target: id
        }))
    };
    console.log(gData.nodes);
    // link parent/children
    var l = gData.nodes.map(node => [node.id, node]);
    console.log(l);
    const nodesById = l.reduce(
      (acc, [key, value]) => Object.assign(acc, { [key.toString()]: value }),
      {},
    );;
    
    gData.links.forEach(link => {
      nodesById[link.source].childLinks.push(link);
    });

    const getPrunedTree = () => {
      const visibleNodes = [];
      const visibleLinks = [];

      (function traverseTree(node = nodesById[rootId]) {
        visibleNodes.push(node);
        if (node.collapsed) return;
        visibleLinks.push(...node.childLinks);
        node.childLinks
          .map(link => ((typeof link.target) === 'object') ? link.target : nodesById[link.target]) // get child node
          .forEach(traverseTree);
      })(); // IIFE

      return { nodes: visibleNodes, links: visibleLinks };
    };

      const div_3d = document.getElementById('cy3d');
      this.graph3d.graphData(getPrunedTree())
      .linkDirectionalParticles(2)
      .nodeColor(node => !node.childLinks.length ? 'green' : node.collapsed ? 'red' : 'yellow')
      .onNodeHover(node => div_3d.style.cursor = node && node.childLinks.length ? 'pointer' : null)
      .onNodeClick(node => {
        if (node.childLinks.length) {
          node.collapsed = !node.collapsed; // toggle collapse state
          this.graph3d.graphData(getPrunedTree());
        }
      });
   
    }
     
  }

  // we will add a form in html someday, so that user can adjust every option from variable
  reRunLayout(layout_name = null) {

    // var context = this;
    this.showPreloader = true;
    if (!this.render3d) {
    this.cy.layout(this.layoutOptions(layout_name)).run();
    this.last_layout_name = layout_name;
    }
    else{
      this.layoutOptions(layout_name);
    }



  }

  // Initialise cy style, layout and call panzoom
  init_cy() {
    var context = this;
    this.cy = cytoscape({
      container: document.getElementById('cy'),
      layout: context.layoutOptions('fcose'),
      style: [{
          selector: 'node',
          style: {
            'content': 'data(id)',
            'background-color': "#fff",
            "opacity": 1,
            "height": 10,
            "width": 10,
            "shape": 'ellipse'
          }
        },
        {
          selector: 'edge',
          style: {
            'line-color': 'white',
            'target-arrow-shape': 'chevron',
            'target-arrow-color': '#fff',
            "curve-style": "unbundled-bezier",
            "control-point-step-size": 20,
            "control-point-weights": 0.5,
            'width': 0.5,
            'arrow-scale': .4,
            'padding': "1em",
            'target-distance-from-node': '5px',
          }
        },
        {
          selector: ':selected',
          style: {
            'border-color': '#c51b7d',
          }
        }, {
          selector: 'edge.highlightE',
          style: {
            'line-color': '#c51b7d',
            'opacity': 1,
            'z-index': 10
          }
        },
        {
          selector: 'node.transparent',
          style: {
            'opacity': 0.1,
            'z-index': 1,
          }
        },
        {
          selector: 'edge.transparent',
          style: {
            'opacity': 0.001,
            'z-index': 1,
            'target-arrow-shape': "none",
          }
        },
        {
          selector: 'node.opaque',
          style: {
            'opacity': 1,
            'z-index': 9999999,
            "text-border-color": "#FED766",
          }
        },
        {
          selector: 'node.border',
          style: {
            'border-width': 3,
            'border-color': '#fc2a30',
            'border-opacity': 0.5,
          }
        },
        {
          selector: 'edge.opaque',
          style: {
            'opacity': 1,
            'z-index': 9999999,
            'target-arrow-shape': 'chevron',
          }
        },
        {
          selector: 'node.image',
          style: {
            'background-image': function (ele) {

              if (context.node_image_attribute_name in ele["_private"]["data"]) {
                return ele["_private"]["data"][context.node_image_attribute_name];
              } else {
                return undefined;
              }
            },
            'background-fit': 'cover'
          }
        },
        {
          selector: 'node.hideN',
          style: {
            'display': 'none'
          }
        },
        {
          selector: 'edge.hideE',
          style: {
            'display': 'none'
          }
        },
        {
          selector: 'node.highlightN',
          style: {
            'border-width': 3,
            'border-color': '#fc2a30',
            'border-opacity': 0.5,
            'opacity': 1
          }
        },
        {
          selector: 'node.label',
          style: {
            "text-valign": 'top',
            "text-halign": 'center',
            "text-margin-y": -10,
            "color": '#fff',
            "text-background-color": "#888",
            "text-background-opacity": 0.3,
            "font-size": 9,
            "min-zoomed-font-size": 12,
            'z-index': 99999,
          }
        },
        {
          selector: 'edge.cy-expand-collapse-collapsed-edge',
          style: {
            'width': function (edge) {
              return 1 + Math.round(((Math.log(edge.data("collapsedEdges").length) / Math.log(3) + Number.EPSILON)) * 100) / 100;
            },
            'line-color': function (edge) {
              if (edge.data("edgeType") == "unknown") {
                return '#b3b3b3'
              } else {}
            },
            'line-style': 'dashed',
            'target-arrow-shape': function (edge) {
              if (edge.data("edgeType") == "unknown") {
                return "chevron"
              } else {}
            },
            'curve-style': 'bezier',
            'target-arrow-color': function (edge) {
              if (edge.data("edgeType") == "unknown") {
                return '#b3b3b3'
              } else {}
            },
            'source-arrow-shape': function (edge) {
              if (edge.data("directionType") == "unidirection") return undefined;
              if (edge.data("edgeType") == "unknown") {
                return "chevron"
              } else {}
            },
            'source-arrow-color': function (edge) {
              if (edge.data("directionType") == "unidirection") return undefined;
              if (edge.data("edgeType") == "unknown") {
                return '#b3b3b3'
              } else {}
            },
          }
        }
      ],
      minZoom: 0.1,
      maxZoom: 2.5,
      motionBlur: false,
      pixelRatio: 'auto'
    });
    this.panZoom();



  }
  // Init panzoom options
  panZoom() {
    var context = this;
    var defaults = {
      zoomFactor: 0.05,
      zoomDelay: 45,
      minZoom: 0.1,
      maxZoom: 2.5,
      fitPadding: 50,
      // panSpeed: 10,
      // panDistance: 10,
      // panDragAreaSize: 75,
      // panMinPercentSpeed: 0.25,
      // panInactiveArea: 8,
      panIndicatorMinOpacity: 0.5,
      zoomOnly: true,
      fitSelector: function () {
        return context.cy.elements();
      },
      animateOnFit: function () {
        return false;
      },
      // fitAnimationDuration: 1000,
      sliderHandleIcon: 'fa fa-minus',
      zoomInIcon: 'fa fa-plus',
      zoomOutIcon: 'fa fa-minus',
      resetIcon: 'fa fa-expand'
    };
    this.cy.panzoom(defaults);
  }
  readGraphml() {
    this.showPreloader = true;
    this.data.share_file_list.subscribe(file_list => (this.files_uploaded = file_list));
    var graphml_data = sessionStorage.getItem(this.files_uploaded[0]);

    var graphmml_options = {
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
      // layoutBy: "cose-bilkent", // string of layout name or layout function
      layoutBy: "fcose", // string of layout name or layout function
    }
    this.cy.graphml(graphmml_options);
    try{
      this.cy.graphml(graphml_data);
    }
    catch(err){
      console.log(err);
      this.handle_graph_load_error(err,graphml_data)
      }

      

      
    this.cy.nodes().addClass('label');
  }
  // various cytoscape events
  init_event() {
    var cy = this.cy;
    var _this = this;
    var api = cy.viewUtilities({
      highlightStyles: [{
          node: {
            'border-color': '#0b9bcd',
            'border-width': 3
          },
          edge: {
            'line-color': '#0b9bcd',
            'source-arrow-color': '#0b9bcd',
            'target-arrow-color': '#0b9bcd',
            'width': 3
          }
        },
        {
          node: {
            'border-color': '#04f06a',
            'border-width': 3
          },
          edge: {
            'line-color': '#04f06a',
            'source-arrow-color': '#04f06a',
            'target-arrow-color': '#04f06a',
            'width': 3
          }
        },
        {
          node: {
            'border-color': '#f5e663',
            'border-width': 3
          },
          edge: {
            'line-color': '#f5e663',
            'source-arrow-color': '#f5e663',
            'target-arrow-color': '#f5e663',
            'width': 3
          }
        }
      ],
      selectStyles: {
        node: {
          'border-color': '#81D4FA',
          'border-width': 3,
          'background-color': 'lightgrey'
        },
        edge: {
          'line-color': '#04f06a',
          'source-arrow-color': '#ffaa00',
          'target-arrow-color': '#ffaa00',
          'width': 1.5
        }
      },
      setVisibilityOnHide: false,
      setDisplayOnHide: true,
      zoomAnimationDuration: 1500,
      neighbor: function (node) {
        return node.closedNeighborhood();
      },
      neighborSelectTime: 1000
    });
    this.api = api;
    var api2 = cy.layoutUtilities({
      desiredAspectRatio: 1,
      polyominoGridSizeFactor: 1,
      componentSpacing: 30
    });
    this.api2 = api2;

    function changeBorder(eles) {
      eles.forEach(function (ele) {
        ele.css("background-color", 'purple');
      });
      return eles;
    }

    function revertBorder(eles) {
      eles.forEach(function (ele) {
        ele.css("background-color", '#fff');
      });
      return eles;
    }
    var tappedBefore;
    cy.on('tap', 'node', function (event) {
      var node = this;
      var tappedNow = node;
      setTimeout(function () {
        tappedBefore = null;
      }, 300);
      if (tappedBefore && tappedBefore.id() === tappedNow.id()) {
        tappedNow.trigger('doubleTap');
        tappedBefore = null;
      } else {
        tappedBefore = tappedNow;
      }
    });

    var layout = cy.layout(this.layoutOptions(this.last_layout_name));
    this.layout = layout;
    api.changeLassoStyle({
      lineColor: "#d67614",
      lineWidth: 3
    });

    // <- focus node, expand and contract node neighbour
    var focus_clicked = false;
    var expand_stack = [];
    var contract_stack = [];
    var focus_on = null;
    document.getElementById('focus').addEventListener("click", function () {
      if (!focus_clicked) {
        focus_clicked = true;
        if (cy.$(":selected").length > 0) {
          _this.openSnackBar("Activate!! Focus mode", '!!');
          var focus = document.getElementById('focus');
          focus.classList.remove('init_position');
          focus.classList.add('focus_position');
          var ep_f = document.getElementById('expandfocus');
          ep_f.classList.remove("hide");
          ep_f.classList.remove("init_position");
          ep_f.classList.add('expand_position');
          var c_f = document.getElementById('contractfocus');
          c_f.classList.remove("hide");
          c_f.classList.remove("init_position");
          c_f.classList.add('contract_position');
          var neighbourOfSelected = cy.$(":selected").neighborhood();
          var selected = cy.$(":selected");
          expand_stack.push(neighbourOfSelected);
          focus_on = selected;
          var n_s = neighbourOfSelected.merge(selected);
          cy.elements().not(n_s).addClass('hideN hideE');
          selected.addClass('selected');
          cy.animate({
            center: selected,
            fit: {
              eles: n_s,
              padding: 100
            }
          }, {
            duration: 500
          });
        }
      } else {
        focus_clicked = false;
        var ep_f = document.getElementById('expandfocus');
        ep_f.classList.add("hide");
        var c_f = document.getElementById('contractfocus');
        c_f.classList.add("hide");
        cy.elements().removeClass('hideN hideE');
        expand_stack = [];
        contract_stack = [];
        focus_on = null;
        cy.animate({
          fit: {
            eles: cy.elements(),
            padding: 40
          }
        }, {
          dureation: 500
        });
      }
    });
    document.getElementById('expandfocus').addEventListener("click", function () {
      if (focus_clicked) {
        // _this.openSnackBar("Expand!! Focus mode", '!!');
        if (contract_stack.length != 0) {
          expand_stack.push(contract_stack.pop());
          var neighbourOfSelected = expand_stack[expand_stack.length - 1];
          var selected = focus_on;
          var n_s = neighbourOfSelected.merge(selected);
          cy.elements().addClass('hideN hideE');
          n_s.removeClass('hideN hideE');
          var t = neighbourOfSelected.difference(expand_stack[expand_stack.length - 2]);
          t.flashClass('highlightN highlightE', 1000);
        } else {
          var last_focus_nodes = expand_stack[expand_stack.length - 1]
          var neighbourOfSelected = last_focus_nodes.neighborhood();
          var selected = focus_on;
          var n_s = neighbourOfSelected.merge(selected);
          cy.elements().addClass('hideN hideE');
          n_s.removeClass('hideN hideE');
          var t = neighbourOfSelected.difference(last_focus_nodes);
          t.flashClass('highlightN highlightE', 1000);
          if (last_focus_nodes.length != neighbourOfSelected.length) {
            expand_stack.push(neighbourOfSelected);
          }
        }
        cy.animate({
          center: selected,
          fit: {
            eles: n_s,
            padding: 100
          }
        }, {
          duration: 500
        });
      }
    });
    document.getElementById('contractfocus').addEventListener("click", function () {
      if (focus_clicked) {
        if (expand_stack.length > 1) {
          // _this.openSnackBar("contract focus", '!!');
          contract_stack.push(expand_stack.pop());
          var neighbourOfSelected = expand_stack[expand_stack.length - 1];
          var selected = focus_on;
          var n_s = neighbourOfSelected.merge(selected);
          cy.elements().addClass('hideN hideE');
          n_s.removeClass('hideN hideE');
        } else if (expand_stack.length == 1) {
          cy.elements().addClass('hideN hideE');
          focus_on.removeClass('hideN')
          contract_stack.push(expand_stack.pop());
        }
        cy.animate({
          center: selected,
          fit: {
            eles: n_s,
            padding: 100
          }
        }, {
          duration: 500
        });
      }
    });
    // ->

    var clicked_lasso = false;
    document.getElementById("lassoTool").addEventListener("click", function () {
      if (!clicked_lasso) {
        introJs().start().goToStep(7);
        clicked_lasso = true;
      }
      api.disableMarqueeZoom();
      document.getElementById("lassoTool").style.backgroundColor = "darkgray";
      var callbackFunc = function () {
        document.getElementById("lassoTool").style.backgroundColor = "#11ffee00";
      };
      api.enableLassoMode(callbackFunc);
    });


    // <-right bottom bar (go next graph, go previous graph), note : remove graph is seprate func()
    var list_of_graphs = this.files_uploaded;
    document.getElementById('next_graph').addEventListener("click", function () {
      if (_this.last_graph_index < list_of_graphs.length - 1) {

        if (_this.last_graph_index + 1 in _this.list_of_graph_json) {
          swap_graph();
          _this.last_graph_index++;
          cy.json(_this.list_of_graph_json[_this.last_graph_index]);
          cy.nodes().addClass('label');
          _this.current_graph_node_count = (cy.nodes()).length;
          _this.current_graph_edge_count = (cy.edges()).length;
        } else {
          swap_graph();
          _this.last_graph_index++;
          var graphml_data = sessionStorage.getItem(list_of_graphs[_this.last_graph_index]);
          cy.graphml(graphml_data);
          cy.nodes().addClass('label');
          _this.current_graph_node_count = (cy.nodes()).length;
          _this.current_graph_edge_count = (cy.edges()).length;
        }
      }
    });
    document.getElementById('previous_graph').addEventListener("click", function () {
      if (_this.last_graph_index > 0) {
        if (_this.last_graph_index - 1 in _this.list_of_graph_json) {
          swap_graph();
          _this.last_graph_index--;
          cy.json(_this.list_of_graph_json[_this.last_graph_index]);
          cy.nodes().addClass('label');
          _this.current_graph_node_count = (cy.nodes()).length;
          _this.current_graph_edge_count = (cy.edges()).length;
        } else {
          swap_graph();
          _this.last_graph_index--;
          var graphml_data = sessionStorage.getItem(list_of_graphs[_this.last_graph_index]);
          cy.graphml(graphml_data);
          cy.nodes().addClass('label');
          _this.current_graph_node_count = (cy.nodes()).length;
          _this.current_graph_edge_count = (cy.edges()).length;
        }
      }
    });

    function swap_graph() {
      var graph_json = cy.json();
      _this.list_of_graph_json[_this.last_graph_index] = graph_json;
      cy.destroy();
      _this.node_attr_options = {};
      _this.numeric_node_attr = [];
      _this.str_node_attr = [];
      if (cy.destroyed()) {
        _this.init_cy();
        _this.init_event();
      }
      cy = _this.cy;
    }
    // ->
    document.getElementById("hide").addEventListener("click", function () {
      api.disableMarqueeZoom();
      api.disableLassoMode();
      var nodesWithHiddenNeighbor = cy.edges(":hidden").connectedNodes(':visible');
      revertBorder(nodesWithHiddenNeighbor);
      api.hide(cy.$(":selected"));
      if ((cy.$(":selected")).length > 0) {
        _this.openSnackBar("Hide selected element", '!!');
      }
      nodesWithHiddenNeighbor = cy.edges(":hidden").connectedNodes(':visible');
      changeBorder(nodesWithHiddenNeighbor);
      layout.run();
    });
    document.getElementById("showAll").addEventListener("click", function () {
      _this.openSnackBar("Unhide ALL Hidden", '!!');
      api.disableMarqueeZoom();
      api.disableLassoMode();
      var nodesWithHiddenNeighbor = cy.edges(":hidden").connectedNodes(':visible');
      revertBorder(nodesWithHiddenNeighbor);
      api.show(cy.elements());
      layout.run();
    });
    document.getElementById("highlightNeighbors").addEventListener("click", function () {
      api.disableMarqueeZoom();
      api.disableLassoMode();
      if (cy.$(":selected").length > 0) {
        _this.openSnackBar("Highlight neighbor of selected element", '!!');
        cy.$(":selected").neighborhood().flashClass('highlightN', 5000);
      }
    });
    document.getElementById("zoomToSelected").addEventListener("click", function () {
      api.disableMarqueeZoom();
      api.disableLassoMode();
      var selectedEles = cy.$(":selected");
      if (selectedEles.length > 0) {
        _this.openSnackBar("Zoom to selected node", '!!');
      }
      api.zoomToSelected(selectedEles);
    });
    var cyTappedBefore;
    cy.on('tap', function (event) {
      var evtTarget = event.target;
      if (evtTarget === cy) {
        var tappedNow = this;
        setTimeout(function () {
          cyTappedBefore = null;
        }, 300);
        if (cyTappedBefore && cyTappedBefore === tappedNow) {
          api.disableMarqueeZoom();
          document.getElementById("lassoTool").style.backgroundColor = "darkgray";
          var callbackFunc = function () {
            document.getElementById("lassoTool").style.backgroundColor = "#11ffee00";
          };
          api.enableLassoMode(callbackFunc);
          cyTappedBefore = null;
        } else {
          cyTappedBefore = tappedNow;
        }
      }
    });
    cy.on('doubleTap', 'node', function (event) {
      _this.openSnackBar('Double Tap!! Now In lasso mode, click empty region to start', '!!');
      api.disableMarqueeZoom();
      api.disableLassoMode();
      var selectedNodes = cy.nodes(":selected");
      var nodesWithHiddenNeighbor = cy.edges(":hidden").connectedNodes(':visible');
      revertBorder(nodesWithHiddenNeighbor);
      api.showHiddenNeighbors(selectedNodes);
      nodesWithHiddenNeighbor = cy.edges(":hidden").connectedNodes(':visible');
      changeBorder(nodesWithHiddenNeighbor);
    });
    var timeouts = [];
    cy.on('mouseover', 'node', function (event) {
      if (!_this.enableHoverEffect) {
        return;
      }
      cy.nodes(event.target).addClass('border');

      var time = setTimeout(function () {
        var selectedNodes = cy.nodes(event.target);
        var neighbor = selectedNodes.neighborhood();

        _this.openSnackBar('neighbors [ ' + (neighbor.nodes()).length + " ]", '!!');
        cy.elements().addClass('transparent');
        neighbor.addClass('opaque');
        selectedNodes.addClass('opaque');
      }, 1000);

      timeouts.push(time);

    });
    cy.on('mouseout', 'node', function () {
      if (!_this.enableHoverEffect) {
        return;
      }
      for (var i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
      }
      cy.elements().removeClass('transparent opaque border');
    });
    cy.on('mouseover', 'edge', function (event) {
      if (!_this.enableHoverEffect) {
        return;
      }
      var time = setTimeout(function () {
        var edge_selected = event.target;
        var source = cy.nodes('#' + edge_selected._private.data.source);
        var target = cy.nodes('#' + edge_selected._private.data.target);
        _this.openSnackBar("Edge connection [ " + edge_selected._private.data.source + " : " + edge_selected._private.data.target + " ]", '!!');
        var selectedEdge = cy.edges(event.target);
        cy.elements().addClass('transparent');
        selectedEdge.addClass('opaque');
        source.addClass('opaque');
        target.addClass('opaque');
      }, 1000);
      timeouts.push(time);
    });
    cy.on('mouseout', 'edge', function () {
      if (!_this.enableHoverEffect) {
        return;
      }
      for (var i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
      }
      cy.elements().removeClass('transparent opaque');
    });
  }

  handle_graph_load_error(err, graph_data){
    if(err.message.includes('Can not create second element with ID')){
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err,
        footer: 'Try Fixing The Duplicate ID!!',
        showCancelButton: true,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          Swal.fire('Fixing ID!!', '', 'success');
          this.fix_duplicate_id(graph_data);
          location.reload();
        } else if (result.isDismissed) {
          Swal.fire('Reload', '', 'info');
          location.reload();
        }
      })
    }
    else{
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          Swal.fire('Reload', '', 'success');
          location.reload();
        } 
      })
    }
  }
   parseXml(xml) {
    console.log("parse in");
    let  ActiveXObject:any;

    var dom = null;
    if ((<any>window).DOMParser) {
       try { 
          dom = (new DOMParser()).parseFromString(xml, "text/xml"); 
       } 
       catch (e) { dom = null; }
    }
    else if ((<any>window).ActiveXObject) {
       try {
          dom = new ActiveXObject('Microsoft.XMLDOM');
          dom.async = false;
          if (!dom.loadXML(xml)) // parse error ..
 
             window.alert(dom.parseError.reason + dom.parseError.srcText);
       } 
       catch (e) { dom = null; }
    }
    else
       alert("cannot parse xml string!");
    return dom;
 }

  fix_duplicate_id(graphml_data){
    // console.log(graphml_data);
    var dom = this.parseXml(graphml_data);
    var json = JSON.parse( this.xml2json(dom,""));
    console.log(json);
    var node_ids = [];
    for( let prop in json["graphml"]["graph"]["node"] ){
      var  n_id = json["graphml"]["graph"]["node"][prop]['@id'] ;
      node_ids.push(n_id);

  }
    for( let prop in json["graphml"]["graph"]["edge"] ){
      var key = json["graphml"]["graph"]["edge"][prop]['@id'];
      if (node_ids.includes(key)){
        // console.log(`Duplicate Key : ${key} , updating it!`);
        // add your own logic to make it unique
        json["graphml"]["graph"]["edge"][prop]['@id'] = key + 'abhi';
        // console.log(json["graphml"]["graph"]["edge"][prop]['@id']);
        for(let k in json["graphml"]["graph"]["edge"][prop]['@id']["data"]){
          var data_ = json["graphml"]["graph"]["edge"][prop]['@id']["data"];
          if( 'key' in data_[k]){
            data_[k]['key'] =  key + 'abhi';
          }
        }
      }
      
  }
    // console.log("done");

    var xml2 = this.json2xml(json,"");
    // console.log(xml2);
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(xml2));
    element.setAttribute('download', `updated_${this.files_uploaded[0]}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    // this.cy.graphml(xml2);
    // this.cy.nodes().addClass('label');


  }
  xml2json(xml, tab) {
    var X = {
       toObj: function(xml) {
          var o = {};
          if (xml.nodeType==1) {   // element node ..
             if (xml.attributes.length)   // element with attributes  ..
                for (var i=0; i<xml.attributes.length; i++)
                   o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
             if (xml.firstChild) { // element has child nodes ..
                var textChild=0, cdataChild=0, hasElementChild=false;
                for (var n=xml.firstChild; n; n=n.nextSibling) {
                   if (n.nodeType==1) hasElementChild = true;
                   else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                   else if (n.nodeType==4) cdataChild++; // cdata section node
                }
                if (hasElementChild) {
                   if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                      X.removeWhite(xml);
                      for (var n=xml.firstChild; n; n=n.nextSibling) {
                         if (n.nodeType == 3)  // text node
                            o["#text"] = X.escape(n.nodeValue);
                         else if (n.nodeType == 4)  // cdata node
                            o["#cdata"] = X.escape(n.nodeValue);
                         else if (o[n.nodeName]) {  // multiple occurence of element ..
                            if (o[n.nodeName] instanceof Array)
                               o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                            else
                               o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                         }
                         else  // first occurence of element..
                            o[n.nodeName] = X.toObj(n);
                      }
                   }
                   else { // mixed content
                      if (!xml.attributes.length)
                         o = X.escape(X.innerXml(xml));
                      else
                         o["#text"] = X.escape(X.innerXml(xml));
                   }
                }
                else if (textChild) { // pure text
                   if (!xml.attributes.length)
                      o = X.escape(X.innerXml(xml));
                   else
                      o["#text"] = X.escape(X.innerXml(xml));
                }
                else if (cdataChild) { // cdata
                   if (cdataChild > 1)
                      o = X.escape(X.innerXml(xml));
                   else
                      for (var n=xml.firstChild; n; n=n.nextSibling)
                         o["#cdata"] = X.escape(n.nodeValue);
                }
             }
             if (!xml.attributes.length && !xml.firstChild) o = null;
          }
          else if (xml.nodeType==9) { // document.node
             o = X.toObj(xml.documentElement);
          }
          else
             alert("unhandled node type: " + xml.nodeType);
          return o;
       },
       toJson: function(o, name, ind) {
          var json = name ? ("\""+name+"\"") : "";
          if (o instanceof Array) {
             for (var i=0,n=o.length; i<n; i++)
                o[i] = X.toJson(o[i], "", ind+"\t");
             json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
          }
          else if (o == null)
             json += (name&&":") + "null";
          else if (typeof(o) == "object") {
             var arr = [];
             for (var m in o)
                arr[arr.length] = X.toJson(o[m], m, ind+"\t");
             json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
          }
          else if (typeof(o) == "string")
             json += (name&&":") + "\"" + o.toString() + "\"";
          else
             json += (name&&":") + o.toString();
          return json;
       },
       innerXml: function(node) {
          var s = ""
          if ("innerHTML" in node)
             s = node.innerHTML;
          else {
             var asXml = function(n) {
                var s = "";
                if (n.nodeType == 1) {
                   s += "<" + n.nodeName;
                   for (var i=0; i<n.attributes.length;i++)
                      s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                   if (n.firstChild) {
                      s += ">";
                      for (var c=n.firstChild; c; c=c.nextSibling)
                         s += asXml(c);
                      s += "</"+n.nodeName+">";
                   }
                   else
                      s += "/>";
                }
                else if (n.nodeType == 3)
                   s += n.nodeValue;
                else if (n.nodeType == 4)
                   s += "<![CDATA[" + n.nodeValue + "]]>";
                return s;
             };
             for (var c=node.firstChild; c; c=c.nextSibling)
                s += asXml(c);
          }
          return s;
       },
       escape: function(txt) {
          return txt.replace(/[\\]/g, "\\\\")
                    .replace(/[\"]/g, '\\"')
                    .replace(/[\n]/g, '\\n')
                    .replace(/[\r]/g, '\\r');
       },
       removeWhite: function(e) {
          e.normalize();
          for (var n = e.firstChild; n; ) {
             if (n.nodeType == 3) {  // text node
                if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                   var nxt = n.nextSibling;
                   e.removeChild(n);
                   n = nxt;
                }
                else
                   n = n.nextSibling;
             }
             else if (n.nodeType == 1) {  // element node
                X.removeWhite(n);
                n = n.nextSibling;
             }
             else                      // any other node
                n = n.nextSibling;
          }
          return e;
       }
    };
    if (xml.nodeType == 9) // document node
       xml = xml.documentElement;
    var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
    return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
 }


 json2xml(o, tab) {
  var toXml = function(v, name, ind) {
     var xml = "";
     if (v instanceof Array) {
        for (var i=0, n=v.length; i<n; i++)
           xml += ind + toXml(v[i], name, ind+"\t") + "\n";
     }
     else if (typeof(v) == "object") {
        var hasChild = false;
        xml += ind + "<" + name;
        for (var m in v) {
           if (m.charAt(0) == "@")
              xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
           else
              hasChild = true;
        }
        xml += hasChild ? ">" : "/>";
        if (hasChild) {
           for (var m in v) {
              if (m == "#text")
                 xml += v[m];
              else if (m == "#cdata")
                 xml += "<![CDATA[" + v[m] + "]]>";
              else if (m.charAt(0) != "@")
                 xml += toXml(v[m], m, ind+"\t");
           }
           xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
        }
     }
     else {
        xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";
     }
     return xml;
  }, xml="";
  for (var m in o)
     xml += toXml(o[m], m, "");
  return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
}
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1000,
    });
  }

  //<- analytics side nav
  openNav() {
    if (Object.keys(this.node_attr_options).length == 0) {
      this.build_style_attr();
    }
    var key_counts = {}
    var deg_dict = {}
    var selected_keys = []
    for (let key in this.node_attr_options) {
      if (this.node_attr_options[key].length <= (this.cy.nodes()).length / 2 && this.node_attr_options[key].length > 0) {
        selected_keys.push(key);
      }
    }
    for (let val of selected_keys) {
      var temp = {}
      var temp2 = {}
      for (let item of this.node_attr_options[val]) {
        if (item != 'NA') {
          temp[item] = 0;
          temp2[item] = [];
        }
      }
      if (Object.keys(temp).length > 1) {
        key_counts[val] = temp;
        deg_dict[val] = temp2;
      }
    }
    selected_keys = Object.keys(key_counts);
    this.chart_dropdown_options = selected_keys;
    this.cy.nodes().forEach(element => {
      var data = element._private.data
      for (var val of selected_keys) {
        if (val in data) {
          key_counts[val][data[val]] = key_counts[val][data[val]] + 1;
          deg_dict[val][data[val]].push(this.cy.nodes('#' + data['id']).degree());
        }
      }
    });
    this.key_counts = key_counts;
    var biggest_key = null;
    var biggest_key_size = 0;
    for (var key in key_counts) {
      if ((Object.keys(key_counts[key])).length > biggest_key_size) {
        biggest_key_size = (Object.keys(key_counts[key])).length;
        biggest_key = key;
      }
    }
    this.chart_option_click(biggest_key);
    this.max_deg = this.cy.nodes().maxDegree();
    this.max_indeg = this.cy.nodes().maxIndegree();
    this.min_deg = this.cy.nodes().minDegree();
    this.min_indeg = this.cy.nodes().minIndegree();
    document.getElementById("mySidenav").style.width = "100%";
    document.getElementById("mySidenav").style.paddingLeft = "20px";
  }
  closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("mySidenav").style.paddingLeft = "0px";
  }
  // ->

  // <- start demo tour
  startTour() {
    introJs().start();
    var ele = document.getElementById('tourbtn');
    ele.classList.add('btn_opacity');
  }
  // ->

  // <- search box
  search_box_focus() {
    this.openSnackBar("Search node attribute", '!!');
    var top_bar = document.getElementById('top_bar');
    top_bar.classList.add('top-bar-shade');
  }
  search_box_not_focus() {
    var top_bar = document.getElementById('top_bar');
    top_bar.classList.remove('top-bar-shade');
  }

  option_click(option_value) {
    this.openSnackBar('Highlight selected', '!!');
    var option_value = option_value.split(":");
    var attr = (option_value[0]).trim();
    var attr_value = (option_value[1]).trim();
    var nodes = null;
    nodes = this.cy.elements('node[' + attr + ' = "' + attr_value + '"]');

    if (this.focus_on_searched_item) {
      nodes.select();
      const focus_ele = document.getElementById('focus');
      focus_ele.click();
      setTimeout(() => {
        focus_ele.click();
        nodes.unselect();
      }, 1500);
    } else {
      this.cy.nodes().flashClass('transparent', 1500);
      this.cy.edges().flashClass('transparent', 1500);
      nodes.flashClass('highlightN', 1500);
    }

  }

  // ->


  // <- bottom right bar , Note : (go next graph and  go previous graph) are in init_event()
  remove_graph() {
    var selector = document.getElementById('remove_graph');
    selector.classList.add('magictime', 'bombLeftOut');
    setTimeout(
      function () {
        document.getElementById('remove_graph').classList.remove('magictime', 'bombLeftOut');
      }, 1000
    );
    this.openSnackBar('Removing Current Graph', '!!');
    var cy = this.cy;
    var li = this.last_graph_index;
    var removed = this.files_uploaded.splice(li, 1);
    delete this.list_of_graph_json[li];
    cy.destroy();
    this.node_attr_options = {};
    this.numeric_node_attr = [];
    this.str_node_attr = [];
    if (cy.destroyed()) {
      this.init_cy();
      this.init_event();
      cy = this.cy;
      var graphml_data = sessionStorage.getItem(this.files_uploaded[0]);
      this.last_graph_index = 0;
      cy.graphml(graphml_data);
      cy.nodes().addClass('label');
      this.current_graph_node_count = (cy.nodes()).length;
      this.current_graph_edge_count = (cy.edges()).length;
    }
    if (Object.keys(this.files_uploaded).length == 0) {
      setTimeout(function () {
        location.reload();
      }, 1000);
    }
  }
  // <- bottom left bar (view/export table, export json/graphml, download as image)
  // show elements and connection data as table
  openDialog(flag) {
    if (flag == 1) {
      this.get_elemet_and_connection_data(flag);
      var th = this.element_data_header;
      var tr = this.element_data;
      this.table_heading = 'Elements';
    } else if (flag == 2) {
      this.get_elemet_and_connection_data(flag);
      var th = this.connection_data_header;
      var tr = this.connection_data;
      this.table_heading = 'Connections';
    }
    let dialogRef = this.dialog.open(TabledComponent, {
      data: {
        dialog_type: flag,
        heading: this.table_heading,
        th: th,
        tr: tr
      },
      height: '90vh',
      width: '90vw'
    });
    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('Dialog result : ' + result);
    // });
  }
  //  helper function (openDialog)
  get_elemet_and_connection_data(flag) {
    if (flag == 1) {
      var nodes = this.cy.nodes(':visible');
      var th = [];
      var tr = [];
      if ((nodes).length >= 1) {
        th = Object.keys(nodes[0]._private.data);
      }
      for (let i = 0; i < (nodes).length; i++) {
        var data = nodes[i]._private.data;
        var temp = [];
        for (let j = 0; j < th.length; j++) {
          if (th[j] in data) {
            temp.push(data[th[j]]);
          } else {
            temp.push("");
          }
        }
        tr.push(temp);
      }
      this.element_data_header = th;
      this.element_data = tr;
    } else if (flag == 2) {
      var edges = this.cy.edges(':visible');
      var th = [];
      var tr = [];
      if ((edges).length >= 1) {
        th = Object.keys(edges[0]._private.data);
      }
      for (let i = 0; i < (edges).length; i++) {
        var data = edges[i]._private.data;
        var temp = [];
        for (let j = 0; j < th.length; j++) {
          if (th[j] in data) {
            temp.push(data[th[j]]);
          } else {
            temp.push("");
          }
        }
        tr.push(temp);
      }
      this.connection_data_header = th;
      this.connection_data = tr;
    }
  }
  // download graph images
  download_images() {
    this.openSnackBar('Zip and download all graph images', '!!');
    if (this.list_of_images.length != 0) {
      var zip = new JSZip();
      var imgFolder = zip.folder("images");
      for (let i = 0; i < this.list_of_images.length; i++) {
        imgFolder.file(this.list_of_images[i]["f_name"], this.list_of_images[i]["img"], {
          base64: true
        });
      }
      zip.generateAsync({
          type: "blob"
        })
        .then(function (content) {
          saveAs(content, "images_" + Date.now() + "_.zip");
        });
    }
  }
  download_graphml() {
    this.openSnackBar('Download Current Graph as GraphML', '!!');
    var data = this.cy.graphml();
    var fname = Date.now();
    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([data], {
      type: 'text'
    }));
    a.download = fname + '.graphml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  download_json() {
    this.openSnackBar('Download Current Graph as JSON', '!!');
    var data = this.cy.json();
    var fname = Date.now();
    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([JSON.stringify(data)], {
      type: 'application/json'
    }));
    a.download = fname + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  // capture grap images, so we can download later as zip
  capture_png() {
    this.openSnackBar('Capture Graph as PNG', '!!');
    var f_name = this.files_uploaded[this.last_graph_index] + "_" + Date.now() + "_" + this.list_of_images.length + ".png";
    this.list_of_images.push({
      "img": this.cy.png({
        "output": 'base64'
      }),
      "f_name": f_name
    });
  }
  // ->
  // <- right tool bar for graph styling
  openToolBar() {
    if (window.matchMedia('screen and (max-width: 800px) ').matches) {
      document.getElementById("tool_bar").style.width = "90%";
    } else {
      document.getElementById("tool_bar").style.width = "40%";
    }
    document.getElementById("tool_bar").style.padding = "1em";
    //<- just being lazzy to fix scroll  bas
    document.getElementById("tool_bar").style.overflow = "hidden";
    setTimeout(() => {
      document.getElementById("tool_bar").style.overflow = "auto";
    }, 1000);
    //  ->
    if (Object.keys(this.node_attr_options).length == 0) {
      this.build_style_attr();
    }
  }
  closeToolBar() {
    document.getElementById("tool_bar").style.width = "0";
    document.getElementById("tool_bar").style.padding = "0";
    document.getElementById("tool_bar").style.overflow = "hidden";
  }
  // ->


}
