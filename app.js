var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var request = require('request');
var passport = require('passport');
var Auth0Strategy = require('passport-auth0');
var Promise = require('bluebird');
var mongoose = Promise.promisifyAll(require('mongoose'));

var routes = require('./routes/index');

var app = express();
app.set('port', process.env.PORT || 8000);

/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tcohacks');
mongoose.connection.on('error', function () {
    console.error('MongoDB Connection Error. Make sure MongoDB is running.');
});

var strategy = new Auth0Strategy({
    domain:       process.env['AUTH0_DOMAIN'],
    clientID:     process.env['AUTH0_CLIENT_ID'],
    clientSecret: process.env['AUTH0_CLIENT_SECRET'],
    callbackURL:  process.env['AUTH0_CALLBACK_URL'] || 'http://localhost:8000/callback'
}, function(accessToken, refreshToken, extraParams, profile, done) {
    // add the jwt to their profile for stashing
    profile.jwt = extraParams.id_token;

    /* We'll eventually make a call to the topcoder api but for right now
     just hard code a 'member' object so we don't have wait for it. Add
     any handle you would like
     */
    var member = {
        uid: 22918949,
        handle: 'jeffdonthemic',
        country: 'United States',
        memberSince: '2011-01-26T17:43:00.000-0500',
        quote: 'Any sufficiently advanced technology is indistinguishable from magic.',
        photoLink: '/i/m/jeffdonthemic.jpeg',
        name: 'Jeff Douglas',
        gender: 'Male',
        shirtSize: 'Large'
    };

    profile.member = member;
    return done(null, profile);
});

passport.use(strategy);

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'iamsosecret' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;