const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session');
const passport = require('passport');
const { database } = require('./keys');

const indexRouter = require('./routes/index');
const agregar = require('./routes/agregar');
const pass = require('./routes/pass');
const ver = require('./routes/ver');
const editar = require('./routes/editar');
const eliminar = require('./routes/eliminar');

//Inizialitation
const app = express();
require('./lib/passport');


//cookies
app.use(cookieParser());

//Settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
}));
app.set('view engine', '.hbs');

//Middelwares
app.use(session({
    secret: 'mysqlnodesession',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}));
app.use(flash());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

//Global Variables
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.error = req.flash('error');
    app.locals.warning = req.flash('warning');
    app.locals.user = req.user;
    next();
});

//Public
app.use(express.static(path.join(__dirname, 'public')));

//Routes
app.use('/', indexRouter);
app.use('/agregar', agregar);
app.use('/pass', pass);
app.use('/ver', ver);
app.use('/editar', editar);
app.use('/eliminar', eliminar);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    res.render('error');
});

//Servidor
app.listen(app.get('port'), () => {
    console.log('Server on port ', app.get('port'));
});

module.exports = app;