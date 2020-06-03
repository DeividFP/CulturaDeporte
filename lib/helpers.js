const bcrypt = require('bcryptjs')
const helpers = {};

helpers.encryptPassword = async(password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

helpers.matchPassword = async(password, savedPassword) => {
    return await bcrypt.compare(password, savedPassword);
};

helpers.generateToken = async() => {
    let value = (new Date()).valueOf().toString();
    let salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(value, salt);
}

module.exports = helpers;