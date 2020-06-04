const express = require('express');
const router = express.Router();
const pool = require('../database');
const helpers = require('../lib/helpers');
const funcs = require('../lib/funcs');
const nodemailer = require('nodemailer');
const { isLoggedIn } = require('../lib/auth');

router.get('/inventario', isLoggedIn, async (req, res) => {
    let isA = funcs.isAdmin(req.user.reg_rol);
    if (isA) {
        const u = req.query.u;
        const v = req.query.v;
        if (typeof u == 'undefined' && typeof v == 'undefined') {
            let inv = await pool.query('SELECT * FROM material');
            inv = funcs.InDate(inv);
            for (let value of inv) {
                if (value.mat_statuss == 2) {
                    value.s = 'DISPONIBLE';
                    value.stat = true;
                } else {
                    value.s = 'EN PRÉSTAMO';
                    value.stat = false;
                }
            }

            res.render('ver/inventario', { inv, isA });
        } else {
            if (typeof v == 'undefined') {

                let inv = await pool.query(`SELECT * FROM material WHERE (mat_sku LIKE '%${u}%' OR mat_nombre LIKE '%${u}%' OR mat_descr LIKE '%${u}%')`);

                inv = funcs.InDate(inv);
                for (let value of inv) {
                    if (value.mat_statuss == 2) {
                        value.s = 'DISPONIBLE';
                        value.stat = true;
                    } else {
                        value.s = 'EN PRÉSTAMO';
                        value.stat = false;
                    }
                }
                res.render('ver/inventario', { inv, isA });


            } else {
                let inv = await pool.query('SELECT * FROM material WHERE mat_statuss = ?', [v]);
                inv = funcs.InDate(inv);
                for (let value of inv) {
                    if (value.mat_statuss == 2) {
                        value.s = 'DISPONIBLE';
                        value.stat = true;
                    } else {
                        value.s = 'EN PRÉSTAMO';
                        value.stat = false;
                    }
                }
                res.render('ver/inventario', { inv, isA });
            }
        }

    } else {
        res.redirect('/');
    }

});

router.post('/busq', isLoggedIn, (req, res) => {
    const { v, b } = req.body;
    if (typeof v == 'undefined') {
        if (b.length < 1) {
            res.redirect('/ver/inventario');
        } else {
            res.redirect(`/ver/inventario/?u=${b}`);
        }
    } else {
        res.redirect(`/ver/inventario/?v=${v}`);
    }


});

router.post('/a_busq', isLoggedIn, (req, res) => {
    const { v, b } = req.body;
    if (typeof v == 'undefined') {
        if (b.length < 1) {
            res.redirect('/ver/actividades');
        } else {
            res.redirect(`/ver/actividades/?b=${b}`);
        }
    } else {
        res.redirect(`/ver/actividades/?v=${v}`);
    }


});

router.get('/usuarios', isLoggedIn, async (req, res) => {
    let isA = funcs.isAdmin(req.user.reg_rol);
    if (isA) {

        let consulta = await pool.query('SELECT usr_mb, usr_statuss, reg_nom, reg_pri, reg_seg FROM usr join registro on usr.usr_mb = registro.reg_mb');
        let stat = [];
        for (let value of consulta) {
            if (value.usr_statuss == 2) {
                value.statuss = true;
            } else {
                value.statuss = false;
            }

        }
        res.render('ver/usuarios', { consulta, isA });
    } else {
        res.redirect('/');
    }
});

router.get('/datos/usuario', isLoggedIn, async (req, res) => {
    let isA = funcs.isAdmin(req.user.reg_rol);
    let isU = funcs.isUser(req.user.reg_rol);
    let mb = req.query.s;
    let crd = 0;
    if (typeof mb == 'undefined') {
        let consulta = await pool.query('SELECT * FROM registro WHERE reg_mb = ?', [req.user.reg_mb]);
        let email = consulta[0].reg_email;
        let cred = await pool.query('SELECT ins_creditos FROM inscritos WHERE ins_id_mb = ?', [req.user.reg_mb]);
        for (let value of cred) {
            crd = crd + value.ins_creditos;
        }
        res.render('ver/datUsers', { consulta, crd, isU, isA, mb, email });
    } else {
        let consulta = await pool.query('SELECT * FROM registro WHERE reg_mb = ?', [mb]);
        let cred = await pool.query('SELECT ins_creditos FROM inscritos WHERE ins_id_mb = ?', [mb]);
        for (let value of cred) {
            crd = crd + value.ins_creditos;
        }
        res.render('ver/datUsers', { consulta, crd, isU, isA, mb });
    }

});

router.get('/actividades', isLoggedIn, async (req, res) => {
    let isA = funcs.isAdmin(req.user.reg_rol);
    if (isA) {
        const v = req.query.v,
            b = req.query.b;
        if (typeof v == 'undefined' && typeof b == 'undefined') {
            let consulta = await pool.query('SELECT * FROM actividad');
            for (let value of consulta) {
                let ins = await pool.query('SELECT * FROM inscritos WHERE ins_id_act = ?', [value.act_cod]);
                value.in = ins.length;
            }
            res.render('ver/act', { consulta, isA });
        } else {
            if (typeof v == 'undefined') {
                let consulta = await pool.query(`SELECT * FROM actividad WHERE (act_cod LIKE '%${b}%' OR act_descr LIKE '%${b}%' OR act_prof LIKE '%${b}%')`);
                for (let value of consulta) {
                    let ins = await pool.query('SELECT * FROM inscritos WHERE ins_id_act = ?', [value.act_cod]);
                    value.in = ins.length;
                }
                res.render('ver/act', { consulta, isA });
            } else {
                let consulta = await pool.query('SELECT * FROM actividad WHERE act_tipo = ?', [v]);
                for (let value of consulta) {
                    let ins = await pool.query('SELECT * FROM inscritos WHERE ins_id_act = ?', [value.act_cod]);
                    value.in = ins.length;
                }
                res.render('ver/act', { consulta, isA });

            }
        }
    } else {
        res.redirect('/');
    }

});

router.get('/inscritos', isLoggedIn, async (req, res) => {
    let isA = funcs.isAdmin(req.user.reg_rol);
    let consulta = [];
    if (isA) {
        let cod = req.query.s;
        let b = req.query.b;
        console.log(b);
        if (typeof b == 'undefined') {
            consulta = await pool.query('SELECT ins_id_mb, reg_pri, reg_seg, reg_nom, ins_creditos FROM inscritos join registro ON ins_id_act = ? AND inscritos.ins_id_mb = registro.reg_mb', [cod]);
        } else {
            consulta = await pool.query(`SELECT ins_id_mb, reg_pri, reg_seg, reg_nom, ins_creditos FROM inscritos join registro ON reg_mb LIKE '%${b}%' AND ins_id_act = '${cod}' AND reg_mb=ins_id_mb`);
        }
        for (let value of consulta) {
            value.cod = cod;
            value.horas = value.ins_creditos * 50;
        }
        res.render('ver/inscritos', { consulta, cod, isA });
    } else {
        res.redirect('/');
    }
});

router.get('/in_cursos', isLoggedIn, async (req, res) => {
    let aux = [];
    let isU = funcs.isUser(req.user.reg_rol)
    if (isU) {
        let consulta = await pool.query('SELECT act_descr, act_lugar, act_li, act_lf, act_mi, act_mf, act_mii, act_mif, act_ji, act_jf, act_vi, act_vf, ins_creditos FROM inscritos join actividad ON inscritos.ins_id_act = actividad.act_cod AND inscritos.ins_id_mb = ?', [req.user.reg_mb]);
        res.render('ver/in_cursos', { isU, consulta });
    } else {
        res.redirect('/');
    }
});

router.get('/im_cursos', isLoggedIn, async (req, res) => {
    let isU = funcs.isUser(req.user.reg_rol)
    if (isU) {
        let consulta = await pool.query('SELECT act_cod, act_descr, act_lugar, act_li, act_lf, act_mi, act_mf, act_mii, act_mif, act_ji, act_jf, act_vi, act_vf FROM actividad WHERE act_prof = ?', [req.user.reg_mb]);
        for (let value of consulta) {
            let ins = await pool.query('SELECT * FROM inscritos WHERE ins_id_act = ?', [value.act_cod]);
            value.inscritos = ins.length;
        }
        res.render('ver/im_cursos', { isU, consulta });
    } else {
        res.redirect('/');
    }
});

router.get('/ins', isLoggedIn, async (req, res) => {
    let s = req.query.s;
    let isU = funcs.isUser(req.user.reg_rol);
    if (isU) {
        let consulta = await pool.query('SELECT reg_nom, reg_pri, reg_seg, ins_id_mb FROM inscritos join registro ON inscritos.ins_id_mb = registro.reg_mb AND ins_id_act = ?', [s])
        console.log(consulta);
        res.render('ver/ins', { consulta, isU });
    } else {
        res.redirect('/');
    }

});

router.post('/busq_usr', isLoggedIn, async (req, res) => {
    const { b, s } = req.body;
    res.redirect(`/ver/inscritos/?s=${s}&b=${b}`)
});

router.post('/sol_cons', isLoggedIn, async(req, res) => {

    contentHTML = `
            <h2>El alumno ${req.user.reg_pri} ${req.user.reg_seg} ${req.user.reg_nom} con boleta ${req.user.reg_mb} </h2>
            <h2>Ha solicitado una constancia</h2>
            <h2>Favor de validar los créditos</h2>
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
        to: 'marcos_andres20@live.com.mx',
        subject: `Solicitud de constancia ${req.user.reg_mb}`,
        html: contentHTML
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
    });
    req.flash('success', 'Solicitud enviada, acude a las oficinas a validar tus créditos a partir del siguiente día hábil');
    res.redirect('/');


});

router.get('/prestamos', isLoggedIn, async(req,res)=>{
    let isA = funcs.isAdmin(req.user.reg_rol);
    if(isA){
        let consulta = await pool.query('SELECT * FROM en_pres');
        res.render('ver/prest', {consulta, isA});
    }else{
        res.redirect('/');
    }
});

module.exports = router;