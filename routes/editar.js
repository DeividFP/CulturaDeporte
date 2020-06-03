const express = require('express');
const router = express.Router();
const pool = require('../database');
const helpers = require('../lib/helpers');
const nodemailer = require('nodemailer');
const funcs = require('../lib/funcs');
const { isLoggedIn } = require('../lib/auth');

router.get('/material', isLoggedIn, async(req, res) => {
    let isA = funcs.isAdmin(req.user.reg_rol);
    if (isA) {
        const sku = req.query.s;
        let consulta = await pool.query('SELECT * FROM material WHERE mat_sku = ?', [sku]);
        consulta = funcs.InDate(consulta);
        for (let value of consulta){
            value.sku = sku;
        }
        res.render('editar/material.hbs', { consulta, isA });
    } else {
        res.redirect('/');
    }
});

router.post('/material', isLoggedIn, async(req, res) => {
    const { nombre, desc, precio, ingreso, fecha, sku } = req.body;
    console.log(req.body);
    if ((nombre.length && desc.length && precio.length && ingreso.length) > 0) {
        if (!isNaN(precio)) {
            const newLink = {
                mat_nombre: nombre,
                mat_descr: desc,
                mat_costo: precio,
                mat_tipo_ingreso: ingreso,
                mat_fecha_ingreso: fecha
            }
            await pool.query('UPDATE material SET ? WHERE mat_sku = ?', [newLink, sku]);
            req.flash('success', 'Se editó correctamente');
            res.redirect('/ver/inventario');
        }
    } else {
        req.flash('error', 'Todos los campos son requeridos')
        res.redirect(`/editar/material/?s=${sku}`);
    }
});


router.get('/horario', isLoggedIn, async(req, res) => {
    let isA = funcs.isAdmin(req.user.reg_rol);
    if (isA) {
        const cod = req.query.s;
        let consulta = await pool.query('SELECT * FROM actividad WHERE act_cod = ?', [cod]);
        for (let value of consulta) {
            if (value.act_tipo == 1) {
                value.t = 'DEPORTIVA';
            } else {
                value.t = 'CULTURAL';
            }
        }
        res.render('editar/horario', { consulta, isA });
    } else {
        res.redirect('/');
    }
});

router.post('/horario', isLoggedIn, async(req, res) => {
    const { lu, luF, ma, maF, mi, miF, ju, juF, vi, viF, act } = req.body;
    const newLink = {
        act_li: lu,
        act_lf: luF,
        act_mi: ma,
        act_mf: maF,
        act_mii: mi,
        act_mif: miF,
        act_ji: ju,
        act_jf: juF,
        act_vi: vi,
        act_vf: viF
    }
    let consulta = await pool.query('UPDATE actividad SET ? WHERE act_cod = ?', [newLink, act]);
    if (consulta) {
        req.flash('success', 'Se modicó el horario');
        res.redirect('/ver/actividades');
    } else {
        req.flash('error', 'Ocurrió un error');
        res.redirect('/ver/actividades');
    }
});

router.get('/usuario', isLoggedIn, async(req,res)=>{
    const mb = req.query.s;
    let consulta = await pool.query('SELECT reg_nom, reg_pri, reg_seg, reg_mb, reg_tel, reg_email FROM registro WHERE reg_mb = ?',[mb]);
    let isA = funcs.isAdmin(req.user.reg_rol);
    if(isA){
        res.render('editar/usuario', {isA, consulta})
    }else{
        res.redirect('/')
    }
    
});

router.post('/usuario', isLoggedIn, async(req,res)=>{
    const {tel, email, mat_bol} = req.body
    let newLink = {
        reg_tel: tel,
        reg_email: email
    }
    await pool.query('UPDATE registro SET ? WHERE reg_mb = ?', [newLink, mat_bol] );
    req.flash('success', 'Se modificaron los datos correctamente')
    res.redirect('/ver/usuarios');
});

module.exports = router