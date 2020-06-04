const express = require('express');
const router = express.Router();
const pool = require('../database');
const funcs = require('../lib/funcs');
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

router.get('/', isLoggedIn, function(req, res, next) {
    let isA = funcs.isAdmin(req.user.reg_rol);
    let isU = funcs.isUser(req.user.reg_rol);
    res.render('index', { isA, isU });
});

router.post('/resultados', isLoggedIn, async(req, res) => {
    let isA = funcs.isAdmin(req.user.reg_rol);
    if (isA) {
        const { buscador } = req.body;
        console.log(buscador);
        let usr = await pool.query(`SELECT reg_mb, reg_pri, reg_seg, reg_nom, usr_statuss FROM registro join usr on (usr_mb LIKE '%${buscador}%' OR reg_pri LIKE '%${buscador}%' OR reg_seg LIKE '%${buscador}%' OR reg_nom LIKE '%${buscador}%') AND usr.usr_mb=registro.reg_mb`);
        let mat = await pool.query(`SELECT * FROM material WHERE (mat_sku LIKE '%${buscador}%' OR mat_nombre LIKE '%${buscador}%' OR mat_descr LIKE '%${buscador}%');`);
        let act = await pool.query(`SELECT * FROM actividad WHERE (act_cod LIKE '%${buscador}%' OR act_descr LIKE '%${buscador}%' OR act_prof LIKE '%${buscador}%');`);
        for (let value of act) {
            let rows = await pool.query('SELECT * FROM inscritos WHERE ins_id_act = ?', [value.act_cod]);
            value.in = rows.length;
        }
        mat = funcs.InDate(mat);
        var Susr = false;
        var Smat = false;
        var Sact = false;
        if (usr.length > 0) {
            Susr = true
        }
        if (mat.length > 0) {
            Smat = true
        }
        if (act.length > 0) {
            Sact = true
        }
        for (let value of usr) {
            if (value.statuss != 1) {
                value.estat = true;
            } else {
                value.estat = false;
            }

        }
        for (let value of mat) {
            if (value.mat_statuss == 2) {
                value.s = 'DISPONIBLE';
                value.statuss = true;
            } else {
                value.s = 'EN PRÉSTAMO';
                value.statuss = false;
            }
        }
        res.render('resultados', { usr, mat, Susr, Smat, act, Sact, isA });
    } else {
        res.redirect('/');
    }
});

router.get('/login', isNotLoggedIn, (req, res) => {
    res.render('auth/login');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local.signin', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next)
});

router.post('/logout', isLoggedIn, (req, res) => {
    req.logOut();
    res.redirect('/login');
});

module.exports = router;