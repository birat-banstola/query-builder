import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';


@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {
  svg:any;
  dragLine:any;
  path:any;
  circle:any;
  // set up initial nodes and links
  //  - nodes are known by 'id', not by index in array.
  //  - reflexive edges are indicated on the node (as a bold black circle).
  //  - links are always source < target; edge directions are set by 'left' and 'right'.
  nodes:any[] = [
    /*{ id: 0, reflexive: false },
    { id: 1, reflexive: true },
    { id: 2, reflexive: false }*/
  ];

  links:any[] = [
    /*{ source: this.nodes[0], target: this.nodes[1], left: false, right: true },
    { source: this.nodes[1], target: this.nodes[2], left: false, right: true }*/
  ];
  constructor() {
  }

  ngOnInit(): void {
    this.svg = d3.select('#myCanvas')
      .append('svg')
      .on('contextmenu', (event, d) => { event.preventDefault(); })
      .attr('width', 550)
      .attr('height', 550);
    // define arrow markers for graph links
    this.svg.append('svg:defs').append('svg:marker')
      .attr('id', 'end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 6)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#000');

    this.svg.append('svg:defs').append('svg:marker')
      .attr('id', 'start-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 4)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M10,-5L0,0L10,5')
      .attr('fill', '#000');

    // line displayed when dragging new nodes
    this.dragLine = this.svg.append('svg:path')
      .attr('class', 'link dragline hidden')
      .attr('d', 'M0,0L0,0');

    // handles to link and node element groups
    this.path = this.svg.append('svg:g').selectAll('path');
    this.circle = this.svg.append('svg:g').selectAll('g');
  }


  drawElement(event:any) {
    // set up SVG for D3
    const width = 550;
    const height = 550;
    const colors = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = this.svg;

// set up initial nodes and links
//  - nodes are known by 'id', not by index in array.
//  - reflexive edges are indicated on the node (as a bold black circle).
//  - links are always source < target; edge directions are set by 'left' and 'right'.
    const nodes = this.nodes;
    let lastNodeId = this.nodes.length-1;
    const links = this.links;

// init D3 force layout
   const force = d3.forceSimulation()
      .force('link', d3.forceLink().id((d:any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('x', d3.forceX(width / 2))
      .force('y', d3.forceY(height / 2))
      .on('tick', tick);

    // init D3 drag support
    const drag = d3.drag<SVGCircleElement, unknown>()
      // Mac Firefox doesn't distinguish between left/right click when Ctrl is held...
      .filter(() => event.button === 0 || event.button === 2)
      .on('start', (event, d:any) => {
        if (!event.active) force.alphaTarget(0.3).restart();

        d.fx = d.x;
        d.fy = d.y;
        d.fy = d.y;
      })
      .on('drag', (event, d:any) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d:any) => {
        if (!event.active) force.alphaTarget(0);

        d.fx = null;
        d.fy = null;
      });

    // line displayed when dragging new nodes
    const dragLine = this.dragLine;

    // handles to link and node element groups
    let path = this.path;
    let circle = this.circle;

    // mouse event vars
    let selectedNode:any = null;
    let selectedLink:any = null;
    let mousedownLink:any = null;
    let mousedownNode:any = null;
    let mouseupNode:any = null;

    function resetMouseVars() {
      mousedownNode = null;
      mouseupNode = null;
      mousedownLink = null;
    }

// update force layout (called automatically each iteration)
    function tick() {
      // draw directed edges with proper padding from node centers
      path.attr('d', (d:any) => {
        const deltaX = d.target.x - d.source.x;
        const deltaY = d.target.y - d.source.y;
        const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const normX = deltaX / dist;
        const normY = deltaY / dist;
        const sourcePadding = d.left ? 17 : 12;
        const targetPadding = d.right ? 17 : 12;
        const sourceX = d.source.x + (sourcePadding * normX);
        const sourceY = d.source.y + (sourcePadding * normY);
        const targetX = d.target.x - (targetPadding * normX);
        const targetY = d.target.y - (targetPadding * normY);
        console.log(`${d.x}`);
        return `M${sourceX},${sourceY}L${targetX},${targetY}`;
      });

      // circle.attr('transform', (d:any) => `translate(${d.x},${d.y})`);
      

      circle.attr('transform', (d:any) => `translate(100,250)`);
    }

// update graph (called when needed)
    function restart() {
      // path (link) group
      path = path.data(links);

      // update existing links
      path.classed('selected', (d:any) => d === selectedLink)
        .style('marker-start', (d:any) => d.left ? 'url(#start-arrow)' : '')
        .style('marker-end', (d:any) => d.right ? 'url(#end-arrow)' : '');

      // remove old links
      path.exit().remove();

      // add new links
      path = path.enter().append('svg:path')
        .attr('class', 'link')
        .classed('selected', (d:any) => d === selectedLink)
        .style('marker-start', (d:any) => d.left ? 'url(#start-arrow)' : '')
        .style('marker-end', (d:any) => d.right ? 'url(#end-arrow)' : '')
        .on('mousedown', (event:any, d:any) => {
          if (event.ctrlKey) return;

          // select link
          mousedownLink = d;
          selectedLink = (mousedownLink === selectedLink) ? null : mousedownLink;
          selectedNode = null;
          restart();
        })
        .merge(path);

      // circle (node) group
      // NB: the function arg is crucial here! nodes are known by id, not by index!
      circle = circle.data(nodes, (d:any) => d.id);

      // update existing nodes (reflexive & selected visual states)
      circle.selectAll('circle')
        .style('fill', (d:any) => (d === selectedNode) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id))
        .classed('reflexive', (d:any) => d.reflexive);

      // remove old nodes
      circle.exit().remove();
      d3.select("#myCanvas > svg > g").html("");

      // add new nodes
      const g = circle.enter().append('svg:g');
      g.append('svg:circle')
        .attr('class', 'node')
        .attr('r', 12)
        .style('fill', (d:any) => (d === selectedNode) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id))
        .style('stroke', (d:any) => d3.rgb(colors(d.id)).darker().toString())
        .classed('reflexive', (d:any) => d.reflexive)
        .on('mouseover', function (this:any, d:any) {
          if (!mousedownNode || d === mousedownNode) return;
          // enlarge target node
          d3.select(this).attr('transform', 'scale(1.1)');
        })
        .on('mouseout', function (this:any, d:any) {
          if (!mousedownNode || d === mousedownNode) return;
          // unenlarge target node
          d3.select(this).attr('transform', '');
        })
        .on('mousedown', (d:any) => {
          if (event.ctrlKey) return;

          // select node
          mousedownNode = d;
          selectedNode = (mousedownNode === selectedNode) ? null : mousedownNode;
          selectedLink = null;

          // reposition drag line
          dragLine
            .style('marker-end', 'url(#end-arrow)')
            .classed('hidden', false)
            .attr('d', `M${mousedownNode.x},${mousedownNode.y}L${mousedownNode.x},${mousedownNode.y}`);

          restart();
        })
        .on('mouseup', function (this:any, d:any) {
          if (!mousedownNode) return;

          // needed by FF
          dragLine
            .classed('hidden', true)
            .style('marker-end', '');

          // check for drag-to-self
          mouseupNode = d;
          if (mouseupNode === mousedownNode) {
            resetMouseVars();
            return;
          }

          // unenlarge target node
          d3.select(this).attr('transform', '');

          // add link to graph (update if exists)
          // NB: links are strictly source < target; arrows separately specified by booleans
          const isRight = mousedownNode.id < mouseupNode.id;
          const source = isRight ? mousedownNode : mouseupNode;
          const target = isRight ? mouseupNode : mousedownNode;

          const link = links.filter((l) => l.source === source && l.target === target)[0];
          if (link) {
            link[isRight ? 'right' : 'left'] = true;
          } else {
            links.push({ source, target, left: !isRight, right: isRight });
          }

          // select new link
          selectedLink = link;
          selectedNode = null;
          restart();
        });

      // show node IDs
      g.append('svg:text')
        .attr('x', 0)
        .attr('y', 4)
        .attr('class', 'id')
        .text((d:any) => d.id);

      circle = g.merge(circle);

      // set the graph in motion
      (force as any)
        .nodes(nodes)
        .force('link').links(links);

      force.alphaTarget(0.3).restart();
    }

    function mousedown(this:any, event:any) {
      // because :active only works in WebKit?
      svg.classed('active', true);

      if (event.ctrlKey || mousedownNode || mousedownLink) return;

      // insert new node at point
      const point = d3.pointer(event, this);
      // console.log('point '+point);
      const node = { id: ++lastNodeId, reflexive: false, x: point[0], y: point[1] };
      // console.log(node);
      nodes.push(node);
      // console.log('print');
      // console.log(nodes);
      restart();
    }

    function mousemove(this:any, event:any) {
      if (!mousedownNode) return;

      // update drag line
      dragLine.attr('d', `M${mousedownNode.x},${mousedownNode.y}L${d3.pointer(event, this)[0]},${d3.pointer(event, this)[1]}`);
    }

    function mouseup() {
      if (mousedownNode) {
        // hide drag line
        dragLine
          .classed('hidden', true)
          .style('marker-end', '');
      }

      // because :active only works in WebKit?
      svg.classed('active', false);

      // clear mouse event vars
      resetMouseVars();
    }

    function spliceLinksForNode(node:any) {
      const toSplice = links.filter((l) => l.source === node || l.target === node);
      for (const l of toSplice) {
        links.splice(links.indexOf(l), 1);
      }
    }

// only respond once per keydown
    let lastKeyDown = -1;

    function keydown() {
      event.preventDefault();

      if (lastKeyDown !== -1) return;
      lastKeyDown = (event as any).keyCode;

      // ctrl
      if ((event as any).keyCode === 17) {
        circle.call(drag)
        svg.classed('ctrl', true);
        return;
      }

      if (!selectedNode && !selectedLink) return;

      switch ((event as any).keyCode) {
        case 8: // backspace
        case 46: // delete
          if (selectedNode) {
            nodes.splice(nodes.indexOf(selectedNode), 1);
            spliceLinksForNode(selectedNode);
          } else if (selectedLink) {
            links.splice(links.indexOf(selectedLink), 1);
          }
          selectedLink = null;
          selectedNode = null;
          restart();
          break;
        case 66: // B
          if (selectedLink) {
            // set link direction to both left and right
            selectedLink.left = true;
            selectedLink.right = true;
          }
          restart();
          break;
        case 76: // L
          if (selectedLink) {
            // set link direction to left only
            selectedLink.left = true;
            selectedLink.right = false;
          }
          restart();
          break;
        case 82: // R
          if (selectedNode) {
            // toggle node reflexivity
            selectedNode.reflexive = !selectedNode.reflexive;
          } else if (selectedLink) {
            // set link direction to right only
            selectedLink.left = false;
            selectedLink.right = true;
          }
          restart();
          break;
      }
    }

    function keyup() {
      lastKeyDown = -1;

      // ctrl
      if ((event as any).keyCode === 17) {
        circle.on('.drag', null);
        svg.classed('ctrl', false);
      }
    }

// app starts here
    svg.on('mousedown', mousedown)
      .on('mousemove', mousemove)
      .on('mouseup', mouseup);
    d3.select(window)
      .on('keydown', keydown)
      .on('keyup', keyup);
    restart();
  }
}
