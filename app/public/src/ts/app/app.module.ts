import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';

import { HttpModule ,Http} from '@angular/http';

import {UserService,TestService} from './user.service';

import { AppComponent }  from './app.component';
import {UsersComponent} from './users.component';
import {UserFormComponent} from './userform.component';

@NgModule({
  imports:      [ 
                  BrowserModule,
                  HttpModule ,
                  FormsModule
                ],
  declarations: [ AppComponent ,UsersComponent ,UserFormComponent],
  providers:    [ UserService ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
