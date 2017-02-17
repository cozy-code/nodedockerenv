import * as express from 'express';
import path = require('path');
import favicon = require('serve-favicon');
import logger = require('morgan');
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');

import index from './routes/index';
import mongo from './routes/mongo';
import * as mongoose from 'mongoose';

class App {
    public express: express.Application;

    constructor() {
        // express instance
        this.express = express();
        console.log("express created.")

        //initialize database
        let url = 'mongodb://mongo/nodeenv';
        mongoose.connect(url);

        // setup 
        this.setViewEngine();
        this.setMiddleWare();
        this.setRoutes();

        this.setErrorHandler(); //must be after setRoutes
    }
    private setViewEngine(): void {
        // view engine setup
        this.express.set('views', path.join(__dirname, '../../views'));
        this.express.set('view engine', 'ejs');
    }

    private setMiddleWare(): void {
        // uncomment after placing your favicon in /public
        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        this.express.use(logger('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(cookieParser());
        this.express.use(express.static(path.join(__dirname, 'public')));
    }

    private setErrorHandler(): void {
        // catch 404 and forward to error handler
        this.express.use(function (req: express.Request, res: express.Response, next) {
            var err = new Error('Not Found');
            err['status'] = 404;
            next(err);
        });

        // error handler
        this.express.use(function (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};

            // render the error page
            res.status(err['status'] || 500);
            res.render('error');
        });
    }

    private setRoutes(): void {
        this.express.use('/', index);
        this.express.use('/mongo', mongo);
    }
}

export default new App();

