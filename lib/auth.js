module.exports = {

    isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            return res.redirect('/login');
        }
    },

    isNotLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return res.redirect('/');
        } else {
            return next();
        }
    }

};