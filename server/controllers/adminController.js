exports.showDashboard = (req, res, next) => {
  res.render('admin/dashboard', {
    pageTitle: 'Electronic Voting | dashboard',
  });
};

exports.showPositions = (req, res, next) => {
  res.render('admin/positions', {
    pageTitle: 'Electronic Voting | positions',
  });
};

exports.showElections = (req, res, next) => {
  res.render('admin/elections', {
    pageTitle: 'Electronic Voting | Elections',
  });
};

exports.showCandidates = (req, res, next) => {
  res.render('admin/candidates', {
    pageTitle: 'Electronic Voting | Candidates',
  });
};

exports.showStudents = (req, res, next) => {
  res.render('admin/students', {
    pageTitle: 'Electronic Voting | Students',
  });
};

exports.showDepartments = (req, res, next) => {
  res.render('admin/departments', {
    pageTitle: 'Electronic Voting | Departments',
  });
};

exports.showPayments = (req, res, next) => {
  res.render('admin/payments', {
    pageTitle: 'Electronic Voting | Payments',
  });
};

exports.showLogin = (req, res, next) => {
  res.render('admin/login', {
    pageTitle: 'Electronic Voting | Admin Login',
  });
};

exports.showProfile = (req, res, next) => {
  res.render('admin/profile', {
    pageTitle: 'Electronic Voting | Profile',
  });
};
