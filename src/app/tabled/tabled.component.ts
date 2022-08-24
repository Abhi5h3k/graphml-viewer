import {
  Component,
  OnInit,
  inject,
  Inject
} from '@angular/core';
import {
  MAT_DIALOG_DATA
} from '@angular/material'
@Component({
  selector: 'app-tabled',
  templateUrl: './tabled.component.html',
  styleUrls: ['./tabled.component.css']
})
export class TabledComponent implements OnInit {
  dtOptions: any = {};
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  ngOnInit() {
    this.dtOptions[0] = {
      // Declare the use of the extension in the dom parameter
      dom: 'Bfrtip',
      // Configure the buttons
      buttons: [
        'colvis',
        'copy',
        'print',
        'excel'
      ]
    };
    this.dtOptions[1] = {
      // Declare the use of the extension in the dom parameter
      dom: 'Bfrtip',
      // Configure the buttons
      buttons: [
        'colvis',
        'copy',
        'print',
        'excel'
      ]
    };
  }
}
