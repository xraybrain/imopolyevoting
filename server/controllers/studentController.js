const BaseModel = require('../database/models/index');

exports.showVotePage = (req, res, next) => {
  res.render('student/vote', {
    pageTitle: 'Electronic Voting | vote',
    electionId: req.body.electionId,
    electionTitle: req.body.electionTitle
  });
};

exports.showElectionsPage = (req, res, next) => {
  res.render('student/elections', {
    pageTitle: 'Electronic Voting | Elections',
  });
};

exports.showElectionFormsPage = (req, res, next) => {
  res.render('student/election_forms', {
    pageTitle: 'Electronic Voting | Election Forms',
  });
};

exports.showMakePaymentPage = async (req, res, next) => {
  try {
    const { electionId, electionPositionId } = req.body;
    const studentId = req.user.id;

    console.log(electionId, req.body);

    const hasPurchasedForm = await BaseModel.Candidate.findOne({
      where: { electionId, studentId },
    });

    if (hasPurchasedForm) {
      req.flash(
        'msgError',
        'You can only purchase form for this election once'
      );
      return res.redirect('/student/electionforms/');
    }

    res.render('student/make_payment', {
      pageTitle: 'Electronic Voting | Make Payment',
      electionPosition: electionPositionId,
    });
  } catch (error) {
    console.log(error);
    req.flash('msgError', 'Failed to load page.');
    return res.redirect('/');
  }
};

exports.showCampaignsPage = (req, res, next) => {
  res.render('student/campaigns', {
    pageTitle: 'Electronic Voting | Campaigns',
  });
};

exports.showElectionFormReceipt = (req, res, next) => {
  const { paymentId } = req.body;
  res.render('student/form_receipt', {
    pageTitle: 'Electronic Voting | Election Form Receipt',
    paymentId,
  });
};

exports.showProfilePage = (req, res, next) => {
  res.render('student/profile', {
    pageTitle: 'Electronic Voting | Profile',
  });
};
