var express = require('express');
var router = express.Router();

var models  = require('../models');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/dbtest1', function(req, res, next) {
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host     : 'db',
    user     : 'root',
    database : 'mysql',
    password : process.env.MYSQL_ROOT_PASSWORD || 'example',
  });

  connection.connect();

  connection.query('select * from user', function(err, rows, fields) {
    if (err) throw err;
    res.send(rows);
  });

  connection.end();
});

//sequelize sample
router.get('/sequelize0', function(req, res) {
  models.User.create({
    username: 'test user'
  }).then(function() {
    res.redirect('sequelize1');
  });
});
router.get('/sequelize1', function(req, res) {
  models.User.findAll().then(function(users){
    res.send(users);    
  });
});

module.exports = router;
