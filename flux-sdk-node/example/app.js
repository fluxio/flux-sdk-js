'use strict';

var path = require('path');
var express = require('express');
var logger = require('morgan');
var session = require('express-session');
var errorhandler = require('errorhandler');
var bodyParser = require('body-parser');

var FluxSdk = require('flux-sdk-node');

var config = {
  debug: process.env.NODE_ENV !== 'production',
  fluxUrl: process.env.FLUX_URL,
  port: process.env.EXAMPLE_PORT || 4567
};

var app = express();
app.set('port', config.port);

var clientId = process.env.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET;

var sdk = new FluxSdk(clientId, {
  fluxUrl: config.fluxUrl,
  clientSecret: clientSecret,
  redirectUri: 'http://localhost:' + config.port + '/auth_callback'
});

if (config.debug) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // TODO
}

app.set('x-powered-by', false);
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}

app.use(bodyParser.json());
app.use(session({
  secret: 'keyboard cat',
  saveUninitialized: true,
  resave: true
}));

app.use('/auth_callback', function(req, res, next) {
  var userSession = req.session;

  // TODO(daishi): Consider mapping this example app logic to the
  // documented steps of correctly authorizing against Flux.
  if (!req.query.code) {
    userSession.nonce = '12345abcde';
    userSession.state = 'abcde67890';
    var authorizeUrl = sdk.getAuthorizeUrl(
      userSession.state, userSession.nonce
    );
    res.redirect(authorizeUrl);
  } else {
    sdk.exchangeCredentials(userSession.state, userSession.nonce, req.query)
      .then(function(credentials) {
        userSession.fluxCredentials = credentials;
        res.redirect('/');
      })
      .catch(next);
  }
});

app.use('/login', function(req, res) {
  res.render('login');
});

app.use('/', function(req, res, next) {
  var credentials = req.session.fluxCredentials;
  if (!credentials) {
    res.redirect('/login');
  } else {
    req.credentials = credentials;
    next();
  }
});

app.use('/api/projects/:id', function(req, res, next) {
  req.project = sdk.getUser(req.credentials)
    .getProject(req.params.id);
  next();
});

app.delete('/api/projects/:id', function(req, res, next) {
  req.project.delete()
    .then(function(response) {
      res.status(202).json(response);
    })
    .catch(next);
});

app.get('/api/projects', function(req, res, next) {
  if (req.query.name) {
    sdk.getUser(req.credentials)
      .createProject(req.query.name)
      .then(function(project) {
        res.json(project);
      })
      .catch(next);
  } else {
    sdk.getUser(req.credentials)
      .listProjects()
      .then(function(projects) {
        res.json(projects);
      })
      .catch(next);
  }
});

app.post('/api/projects', function(req, res, next) {
  sdk.getUser(req.credentials)
    .createProject(req.body.name)
    .then(function(project) {
      res.json(project);
    })
    .catch(next);
});

app.use('/api/datatables/:id', function(req, res, next) {
  req.dataTable = new sdk.DataTable(req.credentials, req.params.id);
  next();
});

app.get('/api/datatables/:id/capability', function(req, res, next) {
  req.dataTable.fetchCapability()
    .then(function(capability) {
      res.json(capability);
    })
    .catch(next);
});

app.get('/api/datatables/:id/history', function(req, res, next) {
  var query = req.query;

  req.dataTable.fetchHistory({
    cellIds: query.cellIds,
    limit: Number(query.limit || 0),
    page: query.page
  })
    .then(function(capability) {
      res.json(capability);
    })
    .catch(next);
});

app.use('/api/datatables/:data_table_id/cells/:id', function(req, res, next) {
  req.cell = req.dataTable.getCell(req.params.id);
  next();
});

app.get('/api/datatables/:data_table_id/cells/:id/history', function(req, res, next) {
  var query = req.query;

  req.cell.fetchHistory({
    limit: Number(query.limit || 0),
    page: query.page
  })
    .then(function(response) {
      res.json(response);
    })
    .catch(next);
});

app.get('/api/datatables/:data_table_id/cells/:id', function(req, res, next) {
  req.cell.fetch()
    .then(function(response) {
      res.json(response);
    })
    .catch(next);
});

app.post('/api/datatables/:data_table_id/cells/:id', function(req, res, next) {
  req.cell.update(req.body)
    .then(function(response) {
      res.json(response);
    })
    .catch(next);
});

app.delete('/api/datatables/:data_table_id/cells/:id', function(req, res, next) {
  req.cell.delete()
    .then(function(response) {
      res.status(202).json(response);
    })
    .catch(next);
});

app.get('/api/datatables/:id/cells', function(req, res, next) {
  req.dataTable.listCells()
    .then(function(cells) {
      res.json(cells);
    })
    .catch(next);
});

app.post('/api/datatables/:id/cells', function(req, res, next) {
  req.dataTable.createCell(req.body.label, {
    description: req.body.description,
    value: req.body.value
  })
    .then(function(cell) {
      res.json(cell);
    })
    .catch(next);
});

app.get('/api/profile', function(req, res, next) {
  sdk.getUser(req.credentials)
    .fetchProfile()
    .then(function(profile) {
      res.json(profile);
    })
    .catch(next);
});

app.use('/', function(req, res) {
  res.render('index');
});

if (config.debug) {
  app.use(errorhandler());
}

module.exports = app;
