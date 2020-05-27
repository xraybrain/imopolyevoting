const path = require('path');
const {
  savePosition,
  getPositions,
  updatePosition,
  deletePosition,
  saveDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  saveElection,
  getElections,
  updateElection,
  deleteElection,
  saveElectionPosition,
  deleteElectionPosition,
  getLevels,
  saveStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  loginStudent,
  changeStudentPassword,
  changeStudentAvatar,
  getCurrentUser,
  getElectionPositions,
  makePayment,
  getPayments,
  updatePayment,
  getCandidates,
  updateCandidate,
  getElectionCandidates,
  adminDashboardSummary,
  saveAdmin,
  updateAdmin,
  loginAdmin,
  changeAdminAvatar,
  changeAdminPassword,
  getElectionResult,
  mailer,
} = require('../controllers/apiController');

const fileUploader = require('../services/formidable')({
  uploadDir: path.join(__dirname, '../../', 'public/images/uploads/'),
});

module.exports = (app) => {
  app.post('/api/positions/', savePosition);
  app.get('/api/positions/', getPositions);
  app.put('/api/positions/', updatePosition);
  app.delete('/api/positions/', deletePosition);

  app.post('/api/departments/', saveDepartment);
  app.get('/api/departments/', getDepartments);
  app.put('/api/departments/', updateDepartment);
  app.delete('/api/departments/', deleteDepartment);

  app.post('/api/elections/', saveElection);
  app.get('/api/elections/', getElections);
  app.put('/api/elections/', updateElection);
  app.delete('/api/elections/', deleteElection);

  app.post('/api/electionpositions/', saveElectionPosition);
  app.delete('/api/electionpositions/', deleteElectionPosition);

  app.get('/api/levels/', getLevels);

  app.post('/api/students/', saveStudent);
  app.get('/api/students/', getStudents);
  app.put('/api/students/', updateStudent);
  app.delete('/api/students/', deleteStudent);
  app.put('/api/student/changepassword/', changeStudentPassword);
  app.post('/api/student/changeavatar/', fileUploader, changeStudentAvatar);

  app.post('/api/student/login/', loginStudent);

  app.get('/api/currentuser/', getCurrentUser);

  app.get('/api/electionpositions/', getElectionPositions);

  app.post('/api/makepayment/', makePayment);

  app.get('/api/payments/', getPayments);
  app.put('/api/payments/', updatePayment);

  app.get('/api/candidates/', getCandidates);
  app.put('/api/candidates/', updateCandidate);

  app.get('/api/electioncandidates/', getElectionCandidates);

  app.get('/api/admin/dashboard/summary', adminDashboardSummary);

  app.post('/api/admins/', saveAdmin);
  app.put('/api/admins/', updateAdmin);

  app.post('/api/admin/login/', loginAdmin);

  app.post('/api/admin/changeavatar/', fileUploader, changeAdminAvatar);

  app.put('/api/admin/changepassword/', changeAdminPassword);

  app.get('/api/electionresult/', getElectionResult);

  app.post('/api/mailer/contactus/', mailer);
};
