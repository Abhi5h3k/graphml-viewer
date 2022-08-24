import { Component, Output } from '@angular/core';
import { DataServiceService } from './data-service.service'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'abhi-cyto';
  show_graph_screen = false;

  constructor(private data: DataServiceService){}

  ngOnInit(){
    this.data.share.subscribe(x=>  this.show_graph_screen = x);    
  }
  
}
