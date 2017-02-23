import * as http from 'http';
import * as debug from 'debug';
import App from './app';

debug('app:server');

class www {
    protected static port:number | string | boolean;
    protected static server : http.Server;
    constructor() {
        www.port = this.normalizePort(process.env.PORT || '3000');
        //console.log('port=' + www.port);
        App.express.set('port', www.port);

        www.server = http.createServer(<any>App.express);
        //console.log(www.server);
        www.server.listen(www.port);
        www.server.on('error', this.onError);
        www.server.on('listening', this.onListening);
    }

    // Normalize a port into a number, string, or false.
    private normalizePort(val: number | string): number | string | boolean {
        let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
        if (isNaN(port)) return val;
        else if (port >= 0) return port;
        else return false;
    }

    //Event listener for HTTP server "error" event.
    private onError(error) {
        if (error.syscall !== 'listen') throw error;

        var bind = (typeof www.port === 'string') ? 'Pipe ' + www.port : 'Port ' + www.port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    //Event listener for HTTP server "listening" event.
    private onListening() {
        var addr = www.server.address();
        var bind = (typeof addr === 'string') ? 'pipe ' + addr  : 'port ' + addr.port;
        debug('Listening on ' + bind);
    }

}

new www();
