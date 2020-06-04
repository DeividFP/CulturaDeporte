CREATE DATABASE c_d;
USE c_d;
CREATE TABLE carrera(
  carr_id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  carr_descr VARCHAR(20) NOT NULL
);
CREATE TABLE rol(
  rol_id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  rol_descr VARCHAR(20) NOT NULL
);
CREATE TABLE u_status(
  u_sta_id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  u_sta_descr VARCHAR(20) NOT NULL
);
CREATE TABLE registro(
  reg_id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  reg_mb VARCHAR(15) NOT NULL,
  reg_pri VARCHAR(20) NOT NULL,
  reg_seg VARCHAR(20) NOT NULL,
  reg_nom VARCHAR(20) NOT NULL,
  reg_f_nac date NOT NULL,
  reg_nss VARCHAR(15) NOT NULL,
  reg_calle VARCHAR(20) NOT NULL,
  reg_col VARCHAR(20) NOT NULL,
  reg_am VARCHAR(20) NOT NULL,
  reg_exte VARCHAR(8) NOT NULL,
  reg_inte VARCHAR(8) NULL,
  reg_email VARCHAR(50) NOT NULL,
  reg_tel VARCHAR(10) NOT NULL,
  reg_carrera int NOT NULL,
  reg_rol int NOT NULL,
  CONSTRAINT fk_reg_carrera FOREIGN KEY (reg_carrera) REFERENCES carrera(carr_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_reg_rol FOREIGN KEY (reg_rol) REFERENCES rol(rol_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT uk_reg_mb UNIQUE (reg_mb)
);
CREATE TABLE usr(
  usr_id int NOT NULL,
  usr_mb VARCHAR(15) PRIMARY KEY NOT NULL,
  usr_pass VARCHAR(60) NOT NULL,
  usr_hashh VARCHAR(60) NULL,
  usr_statuss int NOT NULL,
  CONSTRAINT fk_usr_mb FOREIGN KEY (usr_mb) REFERENCES registro(reg_mb) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_usr_stat FOREIGN KEY (usr_statuss) REFERENCES u_status(u_sta_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT uk_usr_id UNIQUE (usr_id)
);
CREATE TABLE tipo_act(
  t_act_id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  t_act_descr VARCHAR(20) NOT NULL
);
CREATE TABLE m_status(
  m_sta_id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  m_sta_descr VARCHAR(20) NOT NULL
);
CREATE TABLE actividad(
  act_cod VARCHAR(5) PRIMARY KEY NOT NULL,
  act_tipo int NOT NULL,
  act_descr VARCHAR(20) NOT NULL,
  act_prof VARCHAR(15) NOT NULL,
  act_lugar VARCHAR(20) NOT NULL,
  act_li VARCHAR(6) NULL,
  act_lf VARCHAR(6) NULL,
  act_mi VARCHAR(6) NULL,
  act_mf VARCHAR(6) NULL,
  act_mii VARCHAR(6) NULL,
  act_mif VARCHAR(6) NULL,
  act_ji VARCHAR(6) NULL,
  act_jf VARCHAR(6) NULL,
  act_vi VARCHAR(6) NULL,
  act_vf VARCHAR(6) NULL,
  CONSTRAINT fk_act_tipo FOREIGN KEY (act_tipo) REFERENCES tipo_act(t_act_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_act_prof FOREIGN KEY (act_prof) REFERENCES registro(reg_mb) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE inscritos(
  ins_id_mb VARCHAR(15) NOT NULL,
  ins_id_act VARCHAR(5) NOT NULL,
  ins_creditos INT CHECK(ins_creditos >= 0),
  CONSTRAINT fk_ins_mb FOREIGN KEY (ins_id_mb) REFERENCES registro(reg_mb) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ins_act FOREIGN KEY (ins_id_act) REFERENCES actividad(act_cod) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE material(
  mat_sku VARCHAR(12) NOT NULL PRIMARY KEY,
  mat_nombre VARCHAR(15) NOT NULL,
  mat_descr VARCHAR(30) NOT NULL,
  mat_costo VARCHAR(10) NOT NULL CHECK (mat_costo >= 0),
  mat_tipo_ingreso VARCHAR(12) NOT NULL CHECK (mat_tipo_ingreso = 'compra' or mat_tipo_ingreso = 'recuperacion' or mat_tipo_ingreso = 'donacion' or mat_tipo_ingreso = 'RECUPERACION' or mat_tipo_ingreso = 'COMPRA' or mat_tipo_ingreso = 'DONACION' or mat_tipo_ingreso = 'Recuperacion' or mat_tipo_ingreso = 'Donacion' or mat_tipo_ingreso = 'Compra'),
  mat_fecha_ingreso DATE NOT NULL,
  mat_statuss int NOT NULL,
  mat_estado int NOT NULL,
  CONSTRAINT fk_mat_stat FOREIGN KEY (mat_statuss) REFERENCES m_status(m_sta_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT uk_mat_sku UNIQUE (mat_sku)
);
CREATE TABLE en_pres(
  ep_mb VARCHAR(12) PRIMARY KEY NOT NULL,
  ep_sku VARCHAR(12) UNIQUE NOT NULL,
  ep_descr VARCHAR(30) NOT NULL,
  CONSTRAINT pk_ep_mb FOREIGN KEY (ep_mb) REFERENCES registro(reg_mb) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT pk_ep_sku FOREIGN KEY (ep_sku) REFERENCES material(mat_sku) ON DELETE CASCADE ON UPDATE CASCADE,
);
DELIMITER $$ 
CREATE TRIGGER cred_aU 
BEFORE UPDATE 
ON inscritos FOR EACH ROW 
BEGIN
  IF NEW.ins_creditos < 0 THEN
    SET NEW.ins_creditos=0;
  END IF;
END$$
DELIMITER ;

DELIMITER $$ 
CREATE TRIGGER cred_aI 
BEFORE INSERT 
ON inscritos FOR EACH ROW 
BEGIN
  SET NEW.ins_creditos=0;
END$$
DELIMITER ;

DELIMITER $$ 
CREATE TRIGGER costo_mat 
BEFORE INSERT 
ON material FOR EACH ROW 
BEGIN
  IF NEW.mat_costo < 0 THEN
    SET NEW.mat_costo=1;
  END IF;
END$$
DELIMITER ;

DELIMITER $$ 
CREATE TRIGGER Ncost_mat 
BEFORE UPDATE 
ON material FOR EACH ROW 
BEGIN
  IF NEW.mat_costo < 0 THEN
    SET NEW.mat_costo=0;
  END IF;
END$$
DELIMITER ;

DELIMITER $$ 
CREATE PROCEDURE DatReg (mabo VARCHAR(15))
BEGIN
  SELECT * FROM registro WHERE reg_mb = mabo;
END$$
DELIMITER ;


-- CALL DatReg(2014110374);

DELIMITER $$ 
CREATE PROCEDURE DescAct (des VARCHAR(20))
BEGIN
  SELECT * FROM actividad WHERE act_descr = des;
END$$
DELIMITER ;

-- CALL DescAct(BASKETBALL);

DELIMITER $$
CREATE PROCEDURE BusqUsr(busq varchar(20))
BEGIN
  SELECT reg_mb, reg_pri, reg_seg, reg_nom, usr_statuss FROM registro join usr on (usr_mb LIKE CONCAT('%', busq, '%') OR reg_pri LIKE CONCAT('%', busq, '%') OR reg_seg LIKE CONCAT('%', busq, '%') OR reg_nom LIKE CONCAT('%', busq, '%')) AND usr.usr_mb=registro.reg_mb;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE BusqAct(busq varchar(20))
BEGIN
  SELECT * FROM actividad WHERE (act_cod LIKE CONCAT('%', busq, '%') OR act_descr LIKE CONCAT('%', busq, '%') OR act_prof LIKE CONCAT('%', busq, '%'));
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE BusqMat(busq varchar(20))
BEGIN
  SELECT * FROM material WHERE (mat_sku LIKE CONCAT('%', busq, '%') OR mat_nombre LIKE CONCAT('%', busq, '%') OR mat_descr LIKE CONCAT('%', busq, '%'));
END$$
DELIMITER ;

INSERT INTO `registro` (`reg_mb`, `reg_pri`, `reg_seg`, `reg_nom`, `reg_f_nac`, `reg_nss`, `reg_calle`, `reg_col`, `reg_am`, `reg_exte`, `reg_inte`, `reg_email`, `reg_tel`, `reg_carrera`, `reg_rol`) VALUES
('2014110374', 'FARELAS', 'PERALTA', 'JESÚS DAVID', '1998-05-01', 'SAASFFSA', 'MOCTEZUMA II', 'ARENAL 4TA SECC', 'VENUSTIANO CARRANZA', '151', '', 'farelasdavid.98@gmail.com', '5549119712', 5, 3);

INSERT INTO `usr` (`usr_mb`, `usr_pass`, `usr_hashh`, `usr_statuss`) VALUES
('2014110374', '$2a$10$hPZxk.P.7NNFWtNxs/RL8eq6agCTZaljEfaA/i/ql4JmlD08yK3Nq', '', 2);