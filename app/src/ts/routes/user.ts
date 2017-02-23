import {Router, Request, Response, NextFunction} from 'express';
import * as User from '../models/User';
//import * as mongoose from 'mongoose';

export class UserRouter{
    public router:Router;

    constructor(){
        this.router=Router();
        this.setRoute();
    }

    //// functions
    // create user
    public create(req:Request, res:Response,next:NextFunction){
        var user = <User.IUser>{name: req.body.name, email: req.body.email };

        User.User.create(user,(err,user)=>{
            if(err){
                res.send(err);
            } else {
                res.json({message: 'User created'});    
            }
        });
    }
    // get all users
    public getAll(req:Request, res:Response,next:NextFunction){
        User.User.find((err,result)=>{
            res.json(result);
        });
    }

    // map http request and class functions
    private setRoute(){
        this.router.get('/',this.getAll);
        this.router.post('/',this.create);
    }

};

const userRouter:UserRouter= new UserRouter();

export default userRouter.router;