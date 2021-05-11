//======== Import Required Files ===============
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var jwt = require('jsonwebtoken');
require('log-timestamp');
var rotate = require('log-rotate');

const pool = require('./lib/dbpool');
var config = require('./config/conf');

const queryRoute = require('./routes/queryRoute');

// move a log file while incrementing existing indexed / rotated logs
rotate('./test.log', function(err) {
    // ls ./ => test.log test.log.0
});
  
//============ Create Express app and initialize to app variable ========
const corsOpts = {
    origin: '*',

    methods: [ 
        'GET',
        'POST',
    ],

    allowedHeaders: [
        'Content-Type',
    ],
};


const app = express()
    .use(cors())
    .set('port', config.port || 9000)
    .use(express.json())
    .get('/', (req, res) => { res.send({ 'status': true, 'msg': "Server Started." }); })
    .use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
        res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, HEAD, OPTIONS, PUT");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
        res.header("Access-Control-Expose-Headers", "x-access-token, x-refresh-token");
        next();
    })
    .use((req, res, next) => {
        // next();
        // return;
        if (req.url.endsWith('/nopwd')) {
            console.log("No password route successfully hit")
            next();
            return;
        }
        const token = req.headers['auth'];
        if (!token) {
            res.status(401).json({ status: 401, message: "Not Authorized. Please identify yourself" });
        } else {
            jwt.verify(token, config.secret, (err, decoded) => {
                if (err) {
                    res.status(401).json({ status: 401, message: "Not Authorized. Please identify yourself" });
                    console.error(`A user tried to authenticate using an expired token. I have locked him/her out.`);
                } else {
                    console.log(`User ${decoded.user_id} has been verified. Allowed to proceed to ${req.url}`);
                    
                    //Pass id of requesting user instead of getting it from client
                    req.userId = decoded.user_id;
                    next();
                }
            });
        }
    })
    .use(cors(corsOpts));

//Profile image mb size limit. Fix for 413 Payload too large
// app.use(express.json({limit: '15mb', extended: true}));
// app.use(express.urlencoded({limit: "15mb", extended: true, parameterLimit:150000}));

const http = require('http');
const socketServer = http.Server(app);

app
    .use(queryRoute());

//====== Start Socket Server ===================
socketServer.listen(app.get('port'), () => {
    token = jwt.sign({ user_id: 33 }, config.secret, { expiresIn: '6h' });
    console.log('Server running in port ' + app.get('port'));
    console.log(`Use this token: ${token}`);
});