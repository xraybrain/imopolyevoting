const { ensureIsAuthenticated } = require('../config/auth');
const {
  showDashboard,
  showPositions,
  showElections,
  showCandidates,
  showStudents,
  showDepartments,
  showPayments,
  showLogin,
  showProfile,
} = require('../controllers/adminController');

module.exports = (app) => {
  app.get('/admin/', ensureIsAuthenticated, showDashboard);
  app.get('/admin/profile/', ensureIsAuthenticated, showProfile);
  app.get('/admin/positions', ensureIsAuthenticated, showPositions);
  app.get('/admin/elections', ensureIsAuthenticated, showElections);
  app.get('/admin/candidates', ensureIsAuthenticated, showCandidates);
  app.get('/admin/students', ensureIsAuthenticated, showStudents);
  app.get('/admin/departments', ensureIsAuthenticated, showDepartments);
  app.get('/admin/payments', ensureIsAuthenticated, showPayments);
  app.get('/admin/login/', showLogin);
};
