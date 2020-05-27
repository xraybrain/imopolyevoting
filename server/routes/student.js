const {
  showVotePage,
  showElectionsPage,
  showElectionFormsPage,
  showMakePaymentPage,
  showCampaignsPage,
  showElectionFormReceipt,
  showProfilePage,
} = require('../controllers/studentController');
const {
  ensureIsAuthenticated,
  ensureAccountIsActivated,
} = require('../config/auth');

module.exports = (app) => {
  app.post(
    '/student/vote/',
    ensureIsAuthenticated,
    ensureAccountIsActivated,
    showVotePage
  );
  app.get(
    '/student/elections/',
    ensureIsAuthenticated,
    ensureAccountIsActivated,
    showElectionsPage
  );
  app.get(
    '/student/electionforms/',
    ensureIsAuthenticated,
    ensureAccountIsActivated,
    showElectionFormsPage
  );
  app.post(
    '/student/makepayment/',
    ensureIsAuthenticated,
    ensureAccountIsActivated,
    showMakePaymentPage
  );
  app.get(
    '/student/campaigns/',
    ensureIsAuthenticated,
    ensureAccountIsActivated,
    showCampaignsPage
  );

  app.post(
    '/student/electionformreceipt/',
    ensureIsAuthenticated,
    ensureAccountIsActivated,
    showElectionFormReceipt
  );

  app.get(
    '/student/profile',
    ensureIsAuthenticated,
    ensureAccountIsActivated,
    showProfilePage
  );
};
