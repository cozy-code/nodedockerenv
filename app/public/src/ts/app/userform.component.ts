
//https://angular.io/docs/ts/latest/guide/forms.html

import { Component } from '@angular/core';
import {IUser} from './user';
import {UserService} from './user.service';


@Component({
    selector:'app-newuser',
    templateUrl: 'src/js/app/userform.component.html'
})
export class UserFormComponent{
    user: IUser= <IUser>{name:"",email:""};

    constructor(private userService: UserService){}

    newUser(){
        this.userService.create(this.user.name,this.user.email).subscribe(
            (data)=>{this.user=data}
        );
        //this.userService.getAll();
    }
}