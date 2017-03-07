import { Component } from '@angular/core';
import {TestService} from './user.service';
@Component({
  selector: 'my-app',
  template: `<h1>Hello {{name}}</h1><app-newuser></app-newuser><app-users></app-users>` 
})
export class AppComponent { 
  name = 'Angular slow??'; 
}