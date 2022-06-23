import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'VisualQueryBuilder';
  isConnect: boolean = false;
  val = [{1:2}];
  nodes= [
    { id: 0, reflexive: false },
    { id: 1, reflexive: true },
    { id: 2, reflexive: false }
  ];

  constructor(private toastr: ToastrService) {

  }

  showSuccess() {
    this.toastr.success('Success', 'Message:', {closeButton:true});
  }

  showFailure() {
    this.toastr.error('Failure', 'Message:', {closeButton:true});
    this.isConnect = true;
  }
}

