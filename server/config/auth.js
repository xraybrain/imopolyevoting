exports.ensureIsAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  req.flash('msgError', 'You must login to view this page.');
  if (req.method === 'GET') {
    res.redirect('/login/?redirecturl=' + encodeURI(req.url));
  } else {
    res.redirect('/login/');
  }
};

exports.ensureAccountIsActivated = (req, res, next) => {
  let user = req.user;
  if (user.activated) {
    return next();
  }

  req.flash('msgError', 'Your account has not been activated, contact admin.');
  res.redirect('/');
};
