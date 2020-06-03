const funcs = {};

funcs.InDate = (inv) => {
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    for (let valor of inv) {
        let date = valor.mat_fecha_ingreso.toLocaleDateString("es-ES", options);
        var t = date.split(/[- :]/);
        let mesN;
        switch (t[1]) {
            case 'M01':
                mes = 'ENERO';
                mesN = '01';
                break;
            case 'M02':
                mes = 'FEBRERO';
                mesN = '02';
                break;
            case 'M03':
                mes = 'MARZO';
                mesN = '03';
                break;
            case 'M04':
                mes = 'ABRIL';
                mesN = '04';
                break;
            case 'M05':
                mes = 'MAYO';
                mesN = '05';
                break;
            case 'M06':
                mes = 'JUNIO';
                mesN = '06';
                break;
            case 'M07':
                mes = 'JULIO';
                mesN = '07';
                break;
            case 'M08':
                mes = 'AGOSTO';
                mesN = '08';
                break;
            case 'M09':
                mes = 'SEPTIEMBRE';
                mesN = '09';
                break;
            case 'M10':
                mes = 'OCTUBRE';
                mesN = '10';
                break;
            case 'M11':
                mes = 'NOVIEMBRE';
                mesN = '11';
                break;
            case 'M12':
                mes = 'DICIEMBRE';
                mesN = '12';
                break;

        }
        switch (t[2]) {
            case '1':
                t[2] = '01';
                break;
            case '2':
                t[2] = '02';
                break;
            case '3':
                t[2] = '03';
                break;
            case '4':
                t[2] = '05';
                break;
            case '5':
                t[2] = '05';
                break;
            case '6':
                t[2] = '06';
                break;
            case '7':
                t[2] = '07';
                break;
            case '8':
                t[2] = '08';
                break;
            case '9':
                t[2] = '09';
                break;

        }
        valor.fechaI = t[2] + ' DE ' + mes + ' DE ' + t[0];
        valor.fechaLe = `${t[0]}-${mesN}-${t[2]}`;
    }
    return inv;
}

funcs.datUsDate = (inv) => {
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    for (let valor of inv) {
        let date = valor.reg_f_nac.toLocaleDateString("es-ES", options);
        var t = date.split(/[- :]/);
        let mesN;
        switch (t[1]) {
            case 'M01':
                mes = 'ENERO';
                mesN = '01';
                break;
            case 'M02':
                mes = 'FEBRERO';
                mesN = '02';
                break;
            case 'M03':
                mes = 'MARZO';
                mesN = '03';
                break;
            case 'M04':
                mes = 'ABRIL';
                mesN = '04';
                break;
            case 'M05':
                mes = 'MAYO';
                mesN = '05';
                break;
            case 'M06':
                mes = 'JUNIO';
                mesN = '06';
                break;
            case 'M07':
                mes = 'JULIO';
                mesN = '07';
                break;
            case 'M08':
                mes = 'AGOSTO';
                mesN = '08';
                break;
            case 'M09':
                mes = 'SEPTIEMBRE';
                mesN = '09';
                break;
            case 'M10':
                mes = 'OCTUBRE';
                mesN = '10';
                break;
            case 'M11':
                mes = 'NOVIEMBRE';
                mesN = '11';
                break;
            case 'M12':
                mes = 'DICIEMBRE';
                mesN = '12';
                break;

        }
        switch (t[2]) {
            case '1':
                t[2] = '01';
                break;
            case '2':
                t[2] = '02';
                break;
            case '3':
                t[2] = '03';
                break;
            case '4':
                t[2] = '05';
                break;
            case '5':
                t[2] = '05';
                break;
            case '6':
                t[2] = '06';
                break;
            case '7':
                t[2] = '07';
                break;
            case '8':
                t[2] = '08';
                break;
            case '9':
                t[2] = '09';
                break;

        }
        valor.fechaI = t[2] + ' DE ' + mes + ' DE ' + t[0];
        valor.fechaLe = `${t[0]}-${mesN}-${t[2]}`;
    }
    return inv;
}

funcs.isUser = (rol) => {
    if (rol == 1 || rol == 2) {
        return true;
    } else {
        return false
    }
}

funcs.isAdmin = (rol) => {
    if (rol == 3) {
        return true;
    } else {
        return false;
    }
}

funcs.checkHor = (horaI, horaF) => {
    horaI = horaI.replace(/:/g, "");
    horaF = horaF.replace(/:/g, "");
    let i = parseInt(horaI, 10);
    let f = parseInt(horaF, 10);
    if(f > i){
        if( i != f){
            if(i >= 800 && i <= 1800 && f >= 800 && f <= 1800){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }else{
        return false;
    }
}

module.exports = funcs;