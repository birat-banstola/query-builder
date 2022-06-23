import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.css']
})
export class LeftMenuComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  public undirectedVal: boolean = false;
  public directedVal: boolean = false;
  public nodeVal: boolean = false;

  doUndirectedSelect() {
    this.undirectedVal = !this.undirectedVal;
    this.nodeVal = false;
    this.directedVal = false;
  }

  doDirectedSelect() {
    this.directedVal = !this.directedVal;
    this.undirectedVal = false;
    this.nodeVal = false;
  }

  doNodeSelect() {
    this.nodeVal = !this.nodeVal;
    this.undirectedVal = false;
    this.directedVal = false;
  }
}
