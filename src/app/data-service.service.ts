import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DataServiceService {
  private show_graph_screen = new BehaviorSubject<boolean>(false);
  public share = this.show_graph_screen.asObservable();

  private uploading = new BehaviorSubject<boolean>(false);
  public upload = this.uploading.asObservable();

  private files_uploaded: any = [];
  // BehaviorSubject used to set value
  // asObservable used to get value
  private files_list = new BehaviorSubject(this.files_uploaded);
  public share_file_list = this.files_list.asObservable();
  constructor() { }

  update_show_graph_screen(value : boolean){
    this.show_graph_screen.next(value);
  }
  update_uploading(value : boolean){
    this.uploading.next(value);
  }
  set_files_uploaded(values){
     
    this.files_list.next(values);
  }
}
