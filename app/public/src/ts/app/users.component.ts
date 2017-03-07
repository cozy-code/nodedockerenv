import { Component ,OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import {IUser} from './user';
import {UserService} from './user.service';

@Component({
    selector: 'app-users',
    templateUrl: 'src/js/app/users.component.html'
})
export class UsersComponent implements OnInit{
    users: Observable<IUser[]>;

    constructor(private userService: UserService){}

    ngOnInit(): void{
        this.users=this.userService.getAll();
    }
}
