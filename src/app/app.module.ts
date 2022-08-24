import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DragNDropDirective } from './drag-n-drop.directive';
import { DragNDropComponent } from './drag-n-drop/drag-n-drop.component';
import { VisualiserComponent } from './visualiser/visualiser.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// abhi
import {MatTabsModule} from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import {MatRadioModule} from '@angular/material/radio';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSliderModule} from '@angular/material/slider';
import { ColorPickerModule } from 'ngx-color-picker';
import {MatMenuModule} from '@angular/material/menu';
import {MatDialogModule} from '@angular/material/dialog';
import { TabledComponent } from './tabled/tabled.component';
import {MatButtonModule} from '@angular/material/button';
import { DataTablesModule } from 'angular-datatables';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDividerModule} from '@angular/material/divider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCheckboxModule} from '@angular/material/checkbox';

import { SimplebarAngularModule } from 'simplebar-angular';
// 

@NgModule({
  declarations: [
    AppComponent,
    DragNDropDirective,
    DragNDropComponent,
    VisualiserComponent,
    TabledComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatIconModule,
    MatRadioModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    ColorPickerModule,
    MatMenuModule,
    MatDialogModule,
    MatButtonModule,
    DataTablesModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatDividerModule,
    MatExpansionModule,
    MatCheckboxModule,
    SimplebarAngularModule,
    
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [TabledComponent]
})
export class AppModule { }
