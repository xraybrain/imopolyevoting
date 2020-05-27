const {
  showHomePage,
  showLogin,
  showRegisterPage,
  showElectionResultPage,
  showAdminSetupPage
} = require('../controllers/indexController');

module.exports = (app) => {
  app.get('/', showHomePage);

  app.get('/login/', showLogin);

  app.get('/register/', showRegisterPage);

  app.get('/electionresult/', showElectionResultPage);

  app.get('/adminsetup/', showAdminSetupPage);
};
