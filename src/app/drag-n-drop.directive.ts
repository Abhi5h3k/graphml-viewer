import {
  Directive,
  HostListener,
  HostBinding,
  EventEmitter,
  Output
} from '@angular/core';
import {
  DomSanitizer,
  SafeUrl
} from '@angular/platform-browser';
import {
  DataServiceService
} from './data-service.service'
export interface FileHandle {
  file: File,
    url: SafeUrl
}
@Directive({
  selector: '[appDragNDrop]'
})
export class DragNDropDirective {
  private i = 1;
  private keys_len = 0;
  // @Output() show_graph_screen  = new EventEmitter<Boolean>();
  constructor(private sanitizer: DomSanitizer, private data: DataServiceService) {}
  // @Output() files: EventEmitter<FileHandle[]> = new EventEmitter();
  @HostBinding('style.background-color') background = '#f5fcff';
  @HostBinding('style.opacity') opacity = '1';
  // shake effect
  @HostBinding('class.shakeit') shakeit: boolean;
  //Dragover listener
  @HostListener('dragover', ['$event']) onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.shakeit = true;
    this.background = '#ffcc00';
    this.opacity = '0.8';
  }
  //Dragleave listener
  @HostListener('dragleave', ['$event']) onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.shakeit = false;
    this.background = '#f5fcff'
    this.opacity = '1'
  }
  //Drop listener
  @HostListener('drop', ['$event']) public ondrop(evt) {
    this.data.update_uploading(true);
    // console.log(Object.keys(sessionStorage));
    evt.preventDefault();
    evt.stopPropagation();
    this.shakeit = false;
    this.background = '#f5fcff';
    this.opacity = '1';
    var file_list = [];
    // console.log();
    this.keys_len = Object.keys(evt.dataTransfer.files).length;
    this.i = 1;
    for (let [key, value] of Object.entries(evt.dataTransfer.files)) {
      file_list.push(value["name"]);
      this.uploadDocument(value);
    }
    // console.log(Object.keys(sessionStorage));
    this.data.set_files_uploaded(file_list);
  }
  reFormatCytoData(graphml_data){

    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(graphml_data,"text/xml");
    
    var graphml_key_map = {}
    Array.from(xmlDoc.getElementsByTagName("key")).forEach(element => {
      var val  = element.getAttribute("attr.name");
      graphml_key_map[element.getAttribute("id")] =element.getAttribute("attr.name");
      element.setAttribute("id",String(val));    
    });
    Array.from(xmlDoc.getElementsByTagName("data")).forEach(element => {
      // var val  = element.getAttribute("key");
      element.setAttribute("key",graphml_key_map[element.getAttribute("key")]);
      });
  
    return new XMLSerializer().serializeToString(xmlDoc.documentElement);
    }


  file: any;
  uploadDocument(file) {
    // console.log(file);
    this.file = file;
    let fileReader = new FileReader();
    fileReader.readAsText(this.file);
    fileReader.onload = (e) => {
      sessionStorage.setItem(file.name,this.reFormatCytoData(fileReader.result as string));
      if (this.i == this.keys_len) {
        this.data.update_uploading(false);
        this.data.update_show_graph_screen(true);
      }
      this.i = this.i + 1;
    }
  }
}
