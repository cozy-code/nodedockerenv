import { Injectable }     from '@angular/core';
import { Http, Headers ,Response,RequestOptions} from '@angular/http';

    // https://angular.io/docs/ts/latest/tutorial/toh-pt6.html  Observables secrion
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {IUser} from './user';

@Injectable()
export class UserService{
    // example :: https://embed.plnkr.co/?show=preview
    private headers = new Headers({'Content-Type': 'application/json'});
    private apiUrl='/user/';  // URL to web api //see server side app.ts

    constructor(private http: Http) { }

    create(name:string ,email:string):Observable<IUser> {
        var user = <IUser>{name:name, email:email};
        var body= JSON.stringify(user);
        let options = new RequestOptions({ headers: this.headers });
        var result=this.http
            .post( this.apiUrl,body,options)   //, {headers:this.headers}
            .map((response)=> {
                return response.json() as IUser;
            })
            .catch(this.handleError)
            ;
        
        return result;
    }

    getAll():Observable<IUser[]>{
        return this.http
            .get(this.apiUrl)
            .map((response)=>{
                    return response.json() as IUser[];
                });
    }
    private handleError (error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}

@Injectable()
export class TestService{
    constructor(){
        console.log('Test service constructor');
    }

    public doTest():void{
        console.log('Test service doTest');
    }
}
