exports.showHomePage = (req, res, next) => {
  res.render('index', { pageTitle: 'Electronic Voting' });
};

exports.showLogin = (req, res, next) => {
  res.render('login', { pageTitle: 'Electronic Voting | Login' });
};

exports.showRegisterPage = (req, res, next) => {
  res.render('register', { pageTitle: 'Electronic Voting | Register' });
};

exports.showElectionResultPage = (req, res, next) => {
  res.render('election_result', {
    pageTitle: 'Electronic Voting | Election Result',
  });
};

exports.showAdminSetupPage = (req, res, next) => {
  res.render('admin_setup', {
    pageTitle: 'Electronic Voting | Setup Admin',
  });
};
