import {Router} from 'express';
import * as User from '../models/User';
import * as mongoose from 'mongoose';


let router = Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('respond with a mongo.ts');
});

router.get('/new', function(req, res, next) {
    var user : User.IUser=<User.IUser>{name:'the name',email:'mail@example.com'};
    User.User.create(user);
    res.redirect('list');
});

router.get('/list', function(req, res, next) {
    User.User.find({},(err,users)=>{
        res.send(users);
    });
});

export default router;
