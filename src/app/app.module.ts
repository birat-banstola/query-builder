import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import {ToastrModule} from "ngx-toastr";
import {CommonModule} from "@angular/common";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { LeftMenuComponent } from './left-menu/left-menu.component';
import { CanvasComponent } from './canvas/canvas.component';
import { DbInfoComponent } from './db-info/db-info.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LeftMenuComponent,
    CanvasComponent,
    DbInfoComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot({preventDuplicates: true}),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
