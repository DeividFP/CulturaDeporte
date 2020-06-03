const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');
const helpers = require('../lib/helpers');

passport.use("local.signin", new LocalStrategy({
    usernameField: "mat_bol",
    passwordField: "password",
    passReqToCallback: true
}, async(req, mat_bol, password, done) => {
    const rows = await pool.query("SELECT * FROM usr WHERE usr_mb = ?", [mat_bol]);
    if (rows.length > 0) {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(password, user.usr_pass);
        if (validPassword) {
            return done(null, user, req.flash('success', 'Bienvenido'));
        } else {
            return done(null, false, req.flash('error', 'Contraseña incorrecta'));
        }
    } else {
        return done(null, false, req.flash("error", "Usuario incorrecto"));
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.usr_mb)
});

passport.deserializeUser(async(mb, done) => {
    const rows = await pool.query('SELECT * FROM registro WHERE reg_mb =?', [mb]);
    done(null, rows[0]);
})