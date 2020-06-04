const express = require('express');
const router = express.Router();
const pool = require('../database');
const helpers = require('../lib/helpers');
const nodemailer = require('nodemailer');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const funcs = require('../lib/funcs');
const url = 'http://localhost:3000';

router.get('/activar', isNotLoggedIn, async(req, res) => {
    const hashh = req.query.h;
    const mb = req.query.s;
    if (hashh.length == 0) {
        res.redirect('/');
    } else {
        let datos = await pool.query('SELECT * FROM usr WHERE usr_mb = ?', [mb]);
        if (datos[0].usr_hashh != 0) {
            if (hashh.localeCompare(datos[0].usr_hashh) == 0) {
                let role = datos[0].usr_rol;
                const a_datos = Array.from(datos);
                var value = new Boolean(true);
                if (role == 1) {
                    value = true;
                } else {
                    value = false;
                }
                res.render('pass/activar', { a_datos, value });
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/');
        }

    }

});

router.post('/activar', async(req, res) => {
    const { mat_bol, pass1, pass2, ide, hash } = req.body;
    if ((pass1.length && pass2.length) > 0) {
        if (pass1.localeCompare(pass2) == 0) {
            let newPass = await helpers.encryptPassword(pass1);
            let newLink = {
                usr_pass: newPass,
                usr_hashh: '',
                usr_statuss: 2
            }
            await pool.query('UPDATE usr set ? WHERE usr_id = ? AND usr_mb = ?', [newLink, ide, mat_bol]);
            req.flash('success', 'Por favor inicia sesión');
            res.redirect('/login');
        } else {
            req.flash('error', 'Las contraseñas no coinciden');
            res.redirect(`/pass/activar/?h=${hash}&s=${mat_bol}`);
        }
    } else {
        req.flash('error', 'Todos los campos son requeridos');
        res.redirect(`/pass/activar/?h=${hash}&s=${mat_bol}`);
    }

})

router.get('/actualizar', isLoggedIn, (req, res) => {
    let isA = funcs.isAdmin(req.user.reg_rol);
    let isU = funcs.isUser(req.user.reg_rol);
    res.render('pass/actualizar', { isA, isU });
});

router.post('/actualizar', isLoggedIn, async(req, res) => {
    const { pass1, pass2, pass3 } = req.body;
    if (pass1.length > 0 && pass2.length > 0 && pass3.length > 0) {
        if (pass1.localeCompare(pass2) == 0) {
            let rows = await pool.query('SELECT * FROM usr WHERE usr_mb = ?', [req.user.reg_mb]);
            let consulta = rows[0];
            let validatePassword = await helpers.matchPassword(pass3, consulta.usr_pass);
            if (validatePassword) {
                let nPass = await helpers.encryptPassword(pass1);
                let newLink = {
                    usr_pass: nPass
                }
                if (await pool.query('UPDATE usr SET ? WHERE usr_mb = ?', [newLink, req.user.reg_mb])) {
                    req.flash('success', 'Cambios guardados');
                    res.redirect('/');
                } else {
                    req.flash('success', 'Ocurrió un error');
                    res.redirect('/');
                }
            } else {
                req.flash('error', 'Contraseña incorrecta');
                res.redirect('/pass/actualizar');
            }
        } else {
            req.flash('error', 'Las contraseñas no coinciden');
            res.redirect('/pass/actualizar');
        }
    } else {
        req.flash('error', 'Todos los campos son obligatorios');
        res.redirect('/pass/actualizar');
    }
});

router.get('/recuperar', isNotLoggedIn, (req, res) => {
    res.render('pass/recuperar');
});

router.post('/recuperar', async(req, res) => {
    const { email } = req.body;
    let consulta = await pool.query('SELECT reg_mb FROM registro WHERE reg_email = ?', [email]);
    if (consulta.length > 0) {
        let token = helpers.generateToken();
    let PR = Math.floor(Math.random() * ((10000000) - 10000) + 10000).toString();
    contentHTML = `
            <h2>Hola Tu contraseña temporal es: </h2>
            <h1> ${PR} </h1>
            <h2>Por favor actualízala lo antes posible <h2>
            `
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'pjdpf.ipn@gmail.com',
            pass: '$passw@648'
        }
    });

    let mailOptions = {
        from: 'Sistema de administración Cultural y Deportiva UPIITA - IPN',
        to: `${email}`,
        subject: 'Recuperación de contraseña',
        html: contentHTML
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        }
    });
        let nPa = await helpers.encryptPassword(PR);
        if (await pool.query('UPDATE usr SET usr_pass = ? WHERE usr_mb = ?', [nPa, consulta[0].reg_mb])) {
            req.flash('success', 'Se envió un correo electrónico');
            res.redirect('/login');
        } else {
            req.flash('error', 'Ocurrió un error');
            res.redirect('/login');
        }
    } else {
        req.flash('error', 'No está registrado ese correo electrónico');
        res.redirect('/login');
    }


});

module.exports = router;