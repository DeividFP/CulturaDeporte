const express = require('express');
const router = express.Router();
const pool = require('../database');
const helpers = require('../lib/helpers');
const { isLoggedIn } = require('../lib/auth');


router.post('/material', isLoggedIn, async(req, res) => {
    const { sku } = req.body;
    if (await pool.query('DELETE FROM material where mat_sku = ?', [sku])) {
        req.flash('success', 'Se eliminó del inventario');
    } else {
        req.flash('error', 'Ocurrió un error');
    }

    res.redirect('/ver/inventario');
});

router.post('/usuario', isLoggedIn, async(req, res) => {
    const { mb } = req.body;
    if (await pool.query('DELETE FROM registro where reg_mb = ?', [mb])) {
        req.flash('success', 'Se eliminó al usuario');
    } else {
        req.flash('error', 'Ocurrió un error');
    }

    res.redirect('/ver/usuarios');
});

router.post('/actividad', isLoggedIn, async(req, res) => {
    const { cod } = req.body;
    if (await pool.query('DELETE FROM actividad WHERE act_cod = ?', [cod])) {
        req.flash('success', 'Se eliminó la actividad');
    } else {
        req.flash('error', 'Ocurrió un error');
    }

    res.redirect('/ver/actividades');
});

router.post('/eliminar_deA', isLoggedIn, async(req, res) => {
    const { u, c } = req.body;
    if (await pool.query('DELETE FROM inscritos WHERE ins_id_mb = ? AND ins_id_act = ?', [u, c])) {
        req.flash('success', 'Se eliminó al alumno de la actividad');
    } else {
        req.flash('error', 'Ocurrió un error');
    }

    res.redirect(`/ver/inscritos/?s=${c}`);
});

module.exports = router;