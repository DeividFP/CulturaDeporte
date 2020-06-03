const express = require('express');
const router = express.Router();
const pool = require('../database');
const helpers = require('../lib/helpers');
const nodemailer = require('nodemailer');
const funcs = require('../lib/funcs');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const url = 'http://localhost:3000';

router.get('/usuario', isLoggedIn, async(req, res) => {
    let isA = funcs.isAdmin(req.user.reg_rol);
    if (isA) {
        let rol = await pool.query('SELECT * FROM rol');
        let carreer = await pool.query('SELECT * FROM carrera');
        let a_rol = Array.from(rol);
        let a_carreer = Array.from(carreer);
        res.render('agregar/usuario', { a_carreer, a_rol, isA });
    } else {
        res.redirect('/');
    }
});

router.post('/usuario', isLoggedIn, async(req, res) => {
    const { mat_bol, pape, sape, nombre, nac, nss, calle, next, nint, col, alc_mun, email, tel, usert, carrera } = req.body;
    const newLink = {
        reg_mb: mat_bol,
        reg_pri: pape,
        reg_seg: sape,
        reg_nom: nombre,
        reg_f_nac: nac,
        reg_nss: nss,
        reg_calle: calle,
        reg_exte: next,
        reg_inte: nint,
        reg_col: col,
        reg_am: alc_mun,
        reg_email: email,
        reg_tel: tel,
        reg_rol: usert,
        reg_carrera: carrera
    };
    if ((mat_bol.length && pape.length && sape.length && nombre.length && nac.length && nss.length && calle.length && next.length && col.length && alc_mun.length && email.length && tel.length) > 0) {
        const mabo = await pool.query('SELECT * FROM registro WHERE reg_mb = ?', [mat_bol]);
        const corr = await pool.query('SELECT * FROM registro WHERE reg_email = ?', [email]);
        const nuss = await pool.query('SELECT * FROM registro WHERE reg_nss = ?', [nss]);
        if (mabo.length > 0) {
            req.flash('error', 'Ya existe esa matrícula/boleta en el sistema');
            res.redirect('/agregar/usuario');
        } else if (corr.length > 0) {
            req.flash('error', 'Ya existe ese email en el sistema');
            res.redirect('/agregar/usuario');
        } else if (nuss.length > 0) {
            req.flash('error', 'Ya existe ese NSS en el sistema');
            res.redirect('/agregar/usuario');
        } else {

            let token = await helpers.generateToken();
            contentHTML = `
            <h2>Hola ${nombre}. Bienvenido a Cultura y Deporte UPIITA. </h2>
            <h2>Ingresa al siguiente <a href="${url}/pass/activar/?h=${token}&s=${mat_bol}">enlace</a> para activar tu cuenta. </h2>
            <h2>Si el enlace no funciona, accede al enlace que aparece en la parte posterior de este correo en la barra de busqueda de tu navegador>/h2>
            <h2>${url}/pass/activar/?h=${token}&s=${mat_bol}</h2>
            `
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'pruebas.dfp.ipn@gmail.com',
                    pass: '$passw@648'
                }
            });

            let mailOptions = {
                from: 'Sistema de administración Cultural y Deportiva UPIITA - IPN',
                to: `${email}`,
                subject: 'Cultura y Deporte UPIITA',
                html: contentHTML
            };

            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                }
            });
            await pool.query('INSERT INTO registro SET ?', [newLink]);
            let id_user = await pool.query('SELECT reg_id FROM registro WHERE reg_mb = ?', [mat_bol]);
            let id_usr = id_user[0].reg_id;
            const usr = {
                usr_id: id_usr,
                usr_mb: mat_bol,
                usr_pass: '',
                usr_hashh: token,
                usr_statuss: 1
            };
            await pool.query('INSERT INTO usr SET ?', [usr])
            req.flash('success', 'Usuario agregado correctamente');
            res.redirect('/agregar/usuario');
        }
    } else {
        req.flash('error', 'LLene todos los campos solicitados');
        res.redirect('/agregar/usuario');
    }
});

router.get('/material', isLoggedIn, (req, res) => {
    let isA = funcs.isAdmin(req.user.reg_rol);
    if (isA) {
        res.render('agregar/material', { isA });
    } else {
        res.redirect('/');
    }
});

router.post('/material', isLoggedIn, async(req, res) => {
    const { sku, nombre, desc, precio, ingreso, fecha } = req.body;
    if (sku.length > 0 && nombre.length > 0 && desc.length > 0 && precio.length > 0 && ingreso.length > 0 && fecha.length > 0) {
        if (!isNaN(precio)) {
            newSku = sku.replace(/ /g, "");
            const newLink = {
                mat_sku: newSku,
                mat_nombre: nombre,
                mat_descr: desc,
                mat_costo: precio,
                mat_tipo_ingreso: ingreso,
                mat_fecha_ingreso: fecha,
                mat_statuss: 2
            }
            await pool.query('INSERT INTO material SET ?', [newLink]);
            if (precio > 1) {
                req.flash('warning', 'Se agregó el material pero debe tener un precio válido');
            } else {
                req.flash('success', 'Se agregó el material correctamente');
            }
            res.redirect('/agregar/material');
        } else {
            req.flash('warning', 'Ingrese un precio válido');
            res.redirect('/agregar/material');
        }
    } else {
        req.flash('error', 'Todos los campos son requeridos')
        res.redirect('/agregar/material');
    }

});

router.get('/actividad', isLoggedIn, async(req, res) => {
    let isA = funcs.isAdmin(req.user.reg_rol)
    if (isA) {
        let consulta = await pool.query('SELECT reg_mb, reg_pri, reg_seg, reg_nom, reg_rol FROM registro');
        let act = await pool.query('SELECT * FROM tipo_act');
        res.render('agregar/actividad', { consulta, act, isA });
    } else {
        res.redirect('/');
    }
});

router.post('/actividad', isLoggedIn, async(req, res) => {
    const { name, pla, ins, sku, cat, lu, luF, ma, maF, mi, miF, ju, juF, vi, viF } = req.body;
    if(lu.length > 0 && luF.length > 0){
        if(!funcs.checkHor(lu,luF)){
            req.flash('error', 'Hubo un problema con el horario');
            res.redirect('/agregar/actividad');
        }
    }else if(ma.length > 0 && maF.length > 0){
        if(!funcs.checkHor(ma,maF)){
            req.flash('error', 'Hubo un problema con el horario');
            res.redirect('/agregar/actividad');
        }
    }
    if(mi.length > 0 && miF.length > 0){
        if(!funcs.checkHor(ma,maF)){
            req.flash('error', 'Hubo un problema con el horario');
            res.redirect('/agregar/actividad');
        }
    }
    if(ju.length > 0 && juF.length > 0){
        if(!funcs.checkHor(ju,juF)){
            req.flash('error', 'Hubo un problema con el horario');
            res.redirect('/agregar/actividad');
        }
    }
    if(vi.length > 0 && viF.length > 0){
        if(!funcs.checkHor(vi,viF)){
            req.flash('error', 'Hubo un problema con el horario');
            res.redirect('/agregar/actividad');
        }
    }
    let rows = await pool.query('SELECT * FROM actividad WHERE act_cod = ?', [sku]);
    if(rows.length > 0){
        req.flash('error', 'Ese SKU ya existe');
            res.redirect('/agregar/actividad');
    }else{
        let newAct = {
            act_cod: sku,
            act_descr: name,
            act_li: lu,
            act_lF: luF,
            act_mi: ma,
            act_mf: maF,
            act_mii: mi,
            act_mif: miF,
            act_ji: ju,
            act_jf: juF,
            act_vi: vi,
            act_vf: viF,
            act_tipo: cat,
            act_prof: ins,
            act_lugar: pla
        }
        await pool.query('INSERT INTO actividad SET ?', [newAct]);
        req.flash('success', 'Actividad agregada');
        res.redirect('/agregar/actividad');
    }
});

router.get('/A_actividad', isLoggedIn, async(req, res) => {
    let isA = funcs.isAdmin(req.user.reg_rol);
    if (isA) {
        let s = req.query.s;
        let u = req.query.u;
        let consulta = [];
        if (typeof u == 'undefined') {
            consulta = await pool.query('SELECT reg_mb, reg_pri, reg_seg, reg_nom, reg_rol FROM registro');
        } else {
            consu = await pool.query(`BusqAct(${u})`);
            consulta = consu[0];
        }
        for (let value of consulta) {
            value.s = s;
            let rows = await pool.query('SELECT * FROM inscritos WHERE ins_id_mb = ? AND ins_id_act = ?', [value.reg_mb, s]);
            if (rows.length > 0) {
                value.insc = false;
            } else {
                value.insc = true;
            }
        }
        for (let value of consulta){
            if(value.reg_rol == 1){
                value.check = true;
            }else{
                value.check = false;

            }
        }
        console.log(consulta);
        res.render('agregar/A_act', { consulta, s, isA });
    } else {
        res.redirect('/');
    }
});

router.post('/A_actividad', isLoggedIn, (req, res) => {
    const { u, s } = req.body;
    res.redirect(`/agregar/A_actividad/?s=${s}&u=${u}`);
});

router.post('/AA', isLoggedIn, async(req, res) => {
    const { cod, mb, cr } = req.body;
    let newLink = {
        ins_id_mb: mb,
        ins_id_act: cod
    }
    await pool.query('INSERT INTO inscritos SET ?', [newLink]);
    res.redirect(`/agregar/A_actividad/?s=${cod}`);
});

router.post('/creditos', isLoggedIn, async(req, res) => {
    const { c, m, cred } = req.body;
    credi = cred/50;
    console.log(credi);
    await pool.query('UPDATE inscritos SET ins_creditos = ? WHERE ins_id_mb = ? AND ins_id_act = ?', [credi, m, c]);
    res.redirect(`/ver/inscritos/?s=${c}`);
});

router.get('/prestamo', isLoggedIn, async(req, res) => {
    let isA = funcs.isAdmin(req.user.reg_rol);
    if (isA) {
        const sku = req.query.s;
        const u = req.query.u;

        if (typeof sku == 'undefined') {
            res.redirect('/');
        } else {
            if (typeof u == 'undefined') {
                let consulta = await pool.query('SELECT reg_pri, reg_seg, reg_nom, reg_mb FROM registro');
                for (let value of consulta) {
                    let stat = await pool.query('SELECT mat_statuss FROM material WHERE mat_sku = ?', [sku]);
                    value.sku = sku;
                    if (stat[0].mat_statuss == 2) {
                        value.stat = true;
                    } else {
                        value.stat = false;
                    }
                }
                res.render('agregar/prestamo', { consulta, sku, isA });
            } else {
                let consulta = await pool.query(`SELECT reg_pri, reg_seg, reg_nom, reg_mb FROM registro WHERE reg_mb LIKE '%${u}%'`);
                for (let value of consulta) {
                    let stat = await pool.query('SELECT mat_statuss FROM material WHERE mat_sku = ?', [sku]);
                    value.sku = sku;
                    if (stat[0].statuss == 2) {
                        value.stat = true;
                    } else {
                        value.stat = false;
                    }
                }
                res.render('agregar/prestamo', { consulta, sku, isA });
            }

        }
    } else {
        res.redirect('/');
    }

});

router.post('/prest', isLoggedIn, async(req, res) => {
    const { s, mb } = req.body;
    if (await pool.query('UPDATE material SET mat_statuss = 1 WHERE mat_sku = ?', [s])) {
        let pres = await pool.query('SELECT mat_descr FROM material WHERE mat_sku = ? ', [s]);
        let newLink = {
            ep_mb: mb,
            ep_sku: s,
            ep_descr: pres[0].mat_descr
        }
        await pool.query('INSERT INTO en_pres SET ?', [newLink]);
        req.flash('success', 'Artículo prestado');

    } else {
        req.flash('error', 'Ocurrió un error');
    }

    res.redirect('/ver/inventario');
});

router.post('/busq', isLoggedIn, async(req, res) => {
    let { s, u } = req.body;
    res.redirect(`/agregar/prestamo/?s=${s}&u=${u}`);
});

router.post('/devolver', isLoggedIn, async(req, res) => {
    const { id } = req.body;
    if (await pool.query('UPDATE material SET mat_statuss = 2 WHERE mat_sku = ?', [id])) {
        await pool.query('DELETE FROM en_pres WHERE ep_sku = ?', [id]);
        req.flash('success', 'Artículo devuelto');

    } else {
        req.flash('error', 'Ocurrió un error');
    }
    res.redirect('/ver/inventario');
});

router.get('/aviso', isLoggedIn, (req,res) =>{
    isA = funcs.isAdmin(req.user.reg_rol);
    res.render('agregar/avisos', { isA });
});

module.exports = router;