/**
 * RESTFUL API
 */
const {
  sanitize,
  formatDateFromNow,
  formatDateTime,
  splitDateTime,
  timeDiff,
  voteCounter,
} = require('../src/helpers');
const BaseModel = require('../database/models');
const sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { sendMail } = require('../services/mailer');
exports.getDepartments = async (req, res, next) => {
  const filter = { where: {} };
  let { searchquery } = req.query;

  if (searchquery) {
    searchquery = `%${searchquery}%`;
    filter.where['name'] = {
      [sequelize.Op.like]: searchquery,
    };
  }

  try {
    let departments = await BaseModel.Department.findAll(filter);
    departments = departments.map((department, index) => {
      department.dataValues.sn = index + 1;
      department.dataValues.createdAt = formatDateFromNow(
        department.dataValues.createdAt
      );
      department.dataValues.updatedAt = formatDateFromNow(
        department.dataValues.updatedAt
      );
      return department;
    });
    res.status(200);
    res.json({ error: null, message: 'success', departments });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};
exports.updateDepartment = async (req, res, next) => {
  let updateData = sanitize(req.body);
  let id = updateData.id;
  delete updateData.id;
  try {
    const result = await BaseModel.Department.update(updateData, {
      where: { id },
    });
    res.status(200);
    res.json({ error: null, message: 'success', result });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};
exports.deleteDepartment = async (req, res, next) => {
  let { id } = req.body;
  try {
    let result = await BaseModel.Department.destroy({ where: { id } });
    res.status(200);
    res.json({ error: null, message: 'success', result });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};
exports.saveDepartment = async (req, res, next) => {
  let newDepartment = sanitize(req.body);

  try {
    const departmentExist = await BaseModel.Department.findOne({
      where: { name: newDepartment.name },
    });
    if (departmentExist) {
      res.status(200);
      return res.json({
        error: { name: 'department already exists' },
        message: 'Operation Failed.',
      });
    }
    let department = await BaseModel.Department.findOne({
      where: { name: newDepartment.name },
      paranoid: false,
    });

    if (department) {
      department.restore();
    } else {
      department = await BaseModel.Department.create(newDepartment);
    }

    res.status(200);
    res.json({ error: null, message: 'success', department });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

exports.getLevels = async (req, res, next) => {
  try {
    const levels = await BaseModel.Level.findAll({});
    res.status(200);
    res.json({ error: null, levels });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json({ error: { message: 'operation failed' } });
  }
};

exports.getElections = async (req, res, next) => {
  let { searchquery, title, status } = req.query;
  const filter = {
    where: {},
    include: [
      {
        model: BaseModel.ElectionPosition,
        include: [{ model: BaseModel.Position }],
      },
    ],
  };

  if (searchquery) {
    searchquery = `%${searchquery}%`;
    filter.where['title'] = {
      [sequelize.Op.like]: searchquery,
    };
  }

  if (title) {
    title = `%${title}%`;
    filter.where['title'] = {
      [sequelize.Op.like]: title,
    };
  }

  if (status === 'active') {
    const dateNow = new Date();
    //filter.where['startDateTime'] = { [sequelize.Op.lte]: dateNow };
    filter.where['endDateTime'] = { [sequelize.Op.gte]: dateNow };
  }

  try {
    let elections = await BaseModel.Election.findAll(filter);
    elections = elections.map((election, index) => {
      const { startDateTime, endDateTime } = election;

      let startdate = splitDateTime(startDateTime);
      election.dataValues.startDateTime = `${startdate.datetime}`;
      election.dataValues.startdate = startdate.date;
      election.dataValues.starttime = startdate.time;

      let enddate = splitDateTime(endDateTime);
      election.dataValues.endDateTime = `${enddate.datetime}`;
      election.dataValues.enddate = enddate.date;
      election.dataValues.endtime = enddate.time;

      election.dataValues.sn = index + 1;

      election.dataValues.startDateTimeFormatted = formatDateTime(
        startDateTime
      );

      election.dataValues.time = timeDiff(startDateTime, new Date());
      console.log(election.dataValues.time);
      election.dataValues.endDateTimeFormatted = formatDateTime(endDateTime);
      return election;
    });

    res.status(200);
    res.json({ error: null, elections, message: 'success' });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};
exports.updateElection = async (req, res, next) => {
  const { title, startDateTime, endDateTime, id } = req.body;
  const updateData = { title, startDateTime, endDateTime };
  try {
    const result = await BaseModel.Election.update(updateData, {
      where: { id },
    });
    res.status(200);
    res.json({ error: null, result, message: 'success' });
  } catch (error) {
    console.log(error);
    res.status(200);
    res.json({ error: { editForm: 'Operation failed.' } });
  }
};
exports.deleteElection = async (req, res, next) => {
  const { id } = req.body;
  try {
    const result = await BaseModel.Election.destroy({ where: { id } });
    res.status(200);
    res.json({ error: null, message: 'success', result });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.send({ error: { message: 'operation failed.' } });
  }
};
exports.saveElection = async (req, res, next) => {
  const { title, startDateTime, endDateTime, positionId, formPrice } = req.body;
  const transaction = await BaseModel.sequelize.transaction();

  try {
    const electionExists = await BaseModel.Election.findOne({
      where: { title },
    });

    if (electionExists) {
      res.status(200);
      return res.json({
        error: { title: 'title already exists' },
        message: 'operation failed',
      });
    }

    const newElection = sanitize({ title, startDateTime, endDateTime });
    election = await BaseModel.Election.findOne({
      where: { title },
      paranoid: false,
    });

    let electionId;

    if (election) {
      console.log(election);
      election.dataValues.startDateTime = startDateTime;
      election.dataValues.endDateTime = endDateTime;
      electionId = election.id;
      await election.restore();
    } else {
      election = await BaseModel.Election.create(newElection, {
        transaction,
      });
      console.log(election);
      electionId = election.null;
    }

    let newElectionPositions;

    if (Array.isArray(positionId)) {
      newElectionPositions = positionId.map((id, index) => {
        return {
          positionId: id,
          electionId,
          formPrice: formPrice[index],
        };
      });
    } else {
      newElectionPositions = [
        {
          positionId,
          electionId,
          formPrice,
        },
      ];
    }

    const electionPositions = await BaseModel.ElectionPosition.bulkCreate(
      newElectionPositions,
      { transaction }
    );

    transaction.commit();

    res.status(200);
    res.json({ error: null, message: 'success', election, electionPositions });
  } catch (error) {
    console.log(error);
    transaction.rollback();
    res.status(500);
    res.send({ error: { message: 'operation failed' } });
  }
};

exports.getPositions = async (req, res, next) => {
  let { searchquery } = req.query;
  let filter = { where: {} };

  if (searchquery) {
    searchquery = `%${searchquery}%`;
    filter.where.title = {
      [sequelize.Op.like]: searchquery,
    };
  }

  try {
    let positions = await BaseModel.Position.findAll(filter);

    positions = positions.map((position, index) => {
      position.dataValues.sn = index + 1;
      position.dataValues.createdAt = formatDateFromNow(
        position.dataValues.createdAt
      );
      position.dataValues.updatedAt = formatDateFromNow(
        position.dataValues.updatedAt
      );
      return position;
    });

    res.status(200);
    res.json({ error: null, positions });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};
exports.updatePosition = async (req, res, next) => {
  const updateData = sanitize(req.body);
  id = updateData.id;
  delete updateData.id;

  try {
    let result = await BaseModel.Position.update(updateData, { where: { id } });
    res.status(200);
    res.json({
      error: null,
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

exports.deletePosition = async (req, res, next) => {
  const { id } = req.body;
  console.log(req.body);
  try {
    let result = await BaseModel.Position.destroy({ where: { id } });
    res.json({ error: null, message: 'success', result });
  } catch (error) {
    res.status(500);
    console.log(error);
  }
};
exports.savePosition = async (req, res, next) => {
  const newPosition = sanitize(req.body);

  try {
    const positionExists = await BaseModel.Position.findOne({
      where: { title: newPosition.title },
    });
    if (positionExists) {
      res.status(200);
      return res.json({
        error: { title: 'Title already exists.' },
      });
    }
    let position = await BaseModel.Position.findOne({
      where: { title: newPosition.title },
      paranoid: false,
    });

    if (position) {
      position.restore();
    } else {
      //-- save new position
      await BaseModel.Position.create(newPosition);
    }

    res.status(200);
    return res.json({ error: null, message: 'success.' });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

// const voteCounter = (votes, totalVotes = {}) => {
//   for (vote of votes) {
//     let cid = vote.Candidate.id;

//     if (totalVotes.hasOwnProperty(cid)) {
//       totalVotes[cid]++;
//     } else {
//       totalVotes[cid] = 1;
//     }
//   }
//   return totalVotes;
// };

// exports.getVotes = (req, res, next) => {};
// exports.updateVote = (req, res, next) => {};
// exports.deleteVote = (req, res, next) => {};
// exports.saveVote = async (req, res, next) => {
//   const { electionId, candidateId, electionPositionId } = sanitize(req.body);
//   const studentId = req.user.id;
//   const newVote = { electionPositionId, electionId, candidateId, studentId };

//   try {
//     const hasVoted = await BaseModel.Vote.findOne({
//       where: { electionId, studentId, electionPositionId },
//     });
//     let id;

//     if (hasVoted) {
//       id = hasVoted.dataValues.id;
//       await BaseModel.Vote.update({ candidateId }, { where: { id } });
//     } else {
//       id = await BaseModel.Vote.create(newVote);
//     }

//     var totalVotes = {};

//     (
//       await BaseModel.Candidate.findAll({
//         where: { electionId, electionPositionId },
//       })
//     ).map((candidate) => {
//       totalVotes[candidate.id] = 0;
//     });

//     const votes = await BaseModel.Vote.findAll({
//       where: { electionId, electionPositionId },
//       include: [
//         { model: BaseModel.Candidate, include: { model: BaseModel.Student } },
//       ],
//       order: [['candidateId', 'ASC']],
//     });

//     totalVotes = voteCounter(votes, totalVotes);

//     res.status(200);
//     res.json({ error: null, totalVotes });

//     console.log(totalVotes);
//   } catch (error) {
//     console.log(error);
//     res.status(500);
//     res.json({ error: { message: 'operation failed' } });
//   }
// };

exports.saveElectionPosition = async (req, res, next) => {
  const { electionId, positionId, formPrice } = req.body;
  const newElectionPosition = { electionId, positionId, formPrice };

  try {
    const positionExists = await BaseModel.ElectionPosition.findOne({
      where: { electionId, positionId },
    });
    if (positionExists) {
      res.status(200);
      return res.json({
        error: { electionPosition: 'Position already exists.' },
        message: 'success',
      });
    }

    let electionPosition = await BaseModel.ElectionPosition.create(
      newElectionPosition
    );
    electionPosition = await BaseModel.ElectionPosition.findOne({
      include: [{ model: BaseModel.Position }],
      where: { id: electionPosition.null },
    });
    res.status(200);
    res.json({ error: null, electionPosition, message: 'success' });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json({ error: { message: 'failed' } });
  }
};

exports.deleteElectionPosition = async (req, res, next) => {
  const { id } = req.body;
  try {
    const result = await BaseModel.ElectionPosition.destroy({ where: { id } });
    res.status(200);
    res.json({ error: null, message: 'success', result });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.send({ error: { message: 'operation failed.' } });
  }
};
exports.getElectionPositions = async (req, res, next) => {
  const { id, electionid } = req.query;
  const filter = {
    where: {},
    include: [{ model: BaseModel.Election }, { model: BaseModel.Position }],
  };

  if (id) {
    filter.where['id'] = { [sequelize.Op.eq]: id };
  }

  if (electionid) {
    filter.where['electionId'] = { [sequelize.Op.eq]: electionid };
  }

  try {
    let electionPositions = await BaseModel.ElectionPosition.findAll(filter);
    res.json({ error: null, message: 'success', electionPositions });
  } catch (error) {
    res.status(500);
    res.json({ error: { message: 'operation failed' } });
  }
};

exports.getStudents = async (req, res, next) => {
  let { activated, searchquery, disabled } = req.query;
  const filter = {
    where: {},
    include: [{ model: BaseModel.Department }, { model: BaseModel.Level }],
  };

  if (activated) {
    filter.where['activated'] = { [sequelize.Op.eq]: Number(activated) };
  }

  if (searchquery) {
    filter.where[sequelize.Op.or] = [
      { surname: searchquery },
      { matricNo: searchquery },
      { emailAddress: searchquery },
    ];
  }

  try {
    let students;

    if (disabled) {
      filter['paranoid'] = false;
      students = (await BaseModel.Student.findAll(filter)).map(
        (student, index) => {
          student.dataValues.sn = index + 1;
          return student;
        }
      );
    } else {
      students = (await BaseModel.Student.findAll(filter)).map(
        (student, index) => {
          student.dataValues.sn = index + 1;
          return student;
        }
      );
    }

    res.status(200);
    res.json({ error: null, message: 'success', students });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json();
  }
};
exports.updateStudent = async (req, res, next) => {
  const { id, deletedAt } = req.body;
  delete req.body.id;
  const updateData = sanitize(req.body);

  try {
    let result;

    if (deletedAt) {
      const student = await BaseModel.Student.findByPk(id, { paranoid: false });
      if (student) {
        await student.restore();
        result = await BaseModel.Student.update(
          { activated: 1 },
          {
            where: { id },
          }
        );
      }
    } else {
      result = await BaseModel.Student.update(updateData, {
        where: { id },
      });
    }

    res.status(200);
    res.json({ error: null, message: 'success' });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json();
  }
};
exports.deleteStudent = async (req, res, next) => {
  const { id } = req.body;

  try {
    const result = await BaseModel.Student.destroy({ where: { id } });
    res.status(200);
    res.json({ error: null, message: 'success', result });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json();
  }
};
exports.saveStudent = async (req, res, next) => {
  const {
    surname,
    othernames,
    department,
    level,
    password,
    matricno,
    emailAddress,
  } = req.body;
  const newStudent = sanitize({
    surname,
    othernames,
    departmentId: department,
    levelId: level,
    matricNo: matricno,
    emailAddress,
  });
  try {
    const emailExists = await BaseModel.Student.findOne({
      where: { emailAddress },
    });
    if (emailExists) {
      res.status(200);
      return res.json({
        error: { emailAddress: 'email already exists' },
        message: 'operation failed',
      });
    }

    const matricNoExists = await BaseModel.Student.findOne({
      where: { matricNo: matricno },
    });
    if (matricNoExists) {
      res.status(200);
      return res.json({
        error: { matricno: 'matric no already exists' },
        message: 'operation failed',
      });
    }

    const salt = bcrypt.genSaltSync(12);
    const hashPwd = bcrypt.hashSync(password, salt);

    newStudent.password = hashPwd;

    let student = await BaseModel.Student.create(newStudent);

    // let student = await BaseModel.Student.findOne({
    //   where: { [sequelize.or]: [{ emailAddress }, { matricNo: matricno }] },
    //   paranoid: false,
    // });

    // if (student) {
    //   student.dataValues.surname = surname;
    //   student.dataValues.othernames = othernames;
    //   student.dataValues.departmentId = department;
    //   student.dataValues.levelId = level;
    //   student.dataValues.matricNo = matricno;
    //   student.dataValues.password = hashPwd;

    //   student.restore();
    // } else {
    //   student = await BaseModel.Student.create(newStudent);
    // }

    res.status(200);
    res.json({ error: null, message: 'success', student });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json({
      error: { formError: 'failed to save student data' },
      message: 'operation failed',
    });
  }
};

const login = (model, req, res, next) => {
  require('../services/passport')(passport, model);
  passport.authenticate('local', (error, user, info) => {
    if (!user) {
      res.status(200);
      return res.json({ error: true, ...info });
    }

    req.login(user, (error) => {
      if (error) return next(error);

      res.status(200);
      res.json({ error: null, message: 'login success' });
    });
  })(req, res, next);
};

exports.loginStudent = (req, res, next) => {
  login('Student', req, res, next);
};
exports.loginAdmin = (req, res, next) => {
  login('Admin', req, res, next);
};

exports.getCandidates = async (req, res, next) => {
  const { id, studentId, electionid, cancontest, activated } = req.query;
  const filter = {
    where: {},
    include: [
      { model: BaseModel.Student },
      { model: BaseModel.Election },
      {
        model: BaseModel.ElectionPosition,
        include: { model: BaseModel.Position },
      },
    ],
  };
  if (id) {
    filter.where.id = { [sequelize.Op.eq]: id };
  }

  if (activated) {
    filter.where.activated = { [sequelize.Op.eq]: activated };
  }

  if (studentId) {
    filter.where.studentId = { [sequelize.Op.eq]: studentId };
  }

  if (electionid) {
    filter.where.electionId = { [sequelize.Op.eq]: electionid };
  }

  if (cancontest) {
    filter.where.canContest = { [sequelize.Op.eq]: Number(cancontest) };
  }

  try {
    const candidates = (await BaseModel.Candidate.findAll(filter)).map(
      (candidate, index) => {
        candidate.dataValues.sn = index + 1;

        candidate.dataValues.applicationDate = formatDateTime(
          candidate.createdAt
        );

        return candidate;
      }
    );
    res.status(200);
    res.json({ error: null, candidates, message: 'success' });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json({ error: { message: 'operation failed' } });
  }
};

exports.updateCandidate = async (req, res, next) => {
  const { id } = req.body;
  delete req.body.id;
  const updateData = sanitize(req.body);

  try {
    const result = await BaseModel.Candidate.update(updateData, {
      where: { id },
    });
    res.status(200);
    res.json({ error: null, message: 'success', result });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json({ error: { message: 'operation failed' } });
  }
};
exports.deleteCandidate = (req, res, next) => {};

exports.getPayments = async (req, res, next) => {
  let { id, searchquery, status } = req.query;
  const filter = {
    where: {},
    include: [
      { model: BaseModel.Student, include: { model: BaseModel.Department } },
      { model: BaseModel.Election },
      {
        model: BaseModel.ElectionPosition,
        include: { model: BaseModel.Position },
      },
    ],
  };

  if (id) {
    filter.where.id = { [sequelize.Op.eq]: id };
  }

  if (status) {
    filter.where.status = { [sequelize.Op.eq]: status };
  }

  if (searchquery) {
    searchquery = `%${searchquery}%`;
    filter.where[sequelize.Op.or] = [
      { reference: { [sequelize.Op.like]: searchquery } },
    ];
  }

  try {
    let payments = (await BaseModel.Payment.findAll(filter)).map(
      (payment, index) => {
        payment.dataValues.sn = index + 1;
        payment.dataValues.paymentDate = formatDateTime(payment.createdAt);

        return payment;
      }
    );

    res.json({ error: null, payments });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json({ error: { message: 'operation failed' } });
  }
};
exports.updatePayment = async (req, res, next) => {
  const { id } = req.body;
  delete req.body.id;
  const updateData = sanitize(req.body);

  try {
    const result = await BaseModel.Payment.update(updateData, {
      where: { id },
    });
    res.status(200);
    res.json({ error: null, message: 'success', result });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json();
  }
};
exports.deletePayment = (req, res, next) => {};
exports.savePayment = (req, res, next) => {};

exports.getCurrentUser = (req, res, next) => {
  try {
    res.status(200);
    res.json({ error: null, message: 'success', user: req.user || null });
  } catch (error) {
    console.log(error);
    res.status(200);
    res.json({
      error: { message: 'operation failed' },
      user: null,
    });
  }
};

exports.makePayment = async (req, res, next) => {
  const transaction = await BaseModel.sequelize.transaction();

  try {
    const {
      reference,
      studentId,
      electionId,
      electionPositionId,
      amount,
    } = sanitize(req.body);
    const newPayment = {
      reference,
      studentId,
      electionId,
      electionPositionId,
      amount,
    };

    const payment = await BaseModel.Payment.create(newPayment, { transaction });

    const newCandidate = {
      studentId,
      electionId,
      electionPositionId,
      paymentId: payment.null,
      canContest: false,
    };

    const candidate = await BaseModel.Candidate.create(newCandidate, {
      transaction,
    });
    transaction.commit();
    res.status(200);
    res.json({ error: null, status: 'success', candidate });
  } catch (error) {
    console.log(error);
    transaction.rollback();
    res.status(500);
    res.json({ error: { message: 'operation failed' } });
  }
};

exports.getElectionCandidates = async (req, res, next) => {
  const { electionid, cancontest } = req.query;
  try {
    const filter = {
      where: { electionId: electionid },
      include: [
        {
          model: BaseModel.Candidate,
          where: {
            electionId: electionid,
            canContest: cancontest,
          },
          order: [['candidateId', 'ASC']],
          include: { model: BaseModel.Student },
        },
        {
          model: BaseModel.Position,
        },
      ],
      order: [['positionId', 'ASC']],
    };

    let totalVotes = {};
    (
      await BaseModel.Candidate.findAll({ where: { electionId: electionid } })
    ).map((candidate) => {
      totalVotes[candidate.id] = 0;
    });

    const votes = await BaseModel.Vote.findAll({
      where: { electionId: electionid },
      include: [{ model: BaseModel.Candidate }],
    });

    totalVotes = voteCounter(votes, totalVotes);

    console.log(totalVotes);

    const electionCandidates = await BaseModel.ElectionPosition.findAll(filter);
    res.status(200);
    res.json({
      error: null,
      message: 'success',
      electionCandidates,
      totalVotes,
    });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json({});
  }
};

exports.adminDashboardSummary = async (req, res, next) => {
  try {
    const totalPayment = (await BaseModel.Payment.findAll()).reduce(
      (total, payment) => {
        total += payment.amount;
        return total;
      },
      0
    );
    const totalStudents = (await BaseModel.Student.findAndCountAll()).count;
    const totalElections = (await BaseModel.Election.findAndCountAll()).count;
    const totalPositions = (await BaseModel.Position.findAndCountAll()).count;

    res.status(200);
    res.json({
      error: null,
      totalStudents,
      totalElections,
      totalPositions,
      totalPayment,
    });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json();
  }
};

exports.getElectionResult = async (req, res, next) => {
  const { electionid } = req.query;

  try {
    // const totalVotes = {};
    // const candidates = (
    //   await BaseModel.Candidate.findAll({ where: { electionId: electionid } })
    // ).map((candidate, index) => {
    //   candidate.dataValues.sn = index + 1;
    //   totalVotes[candidate.dataValues.id] = 0;
    //   return candidate;
    // });
    // const votes = BaseModel.Vote.findAll({ where: { electionId: electionid } });
    // voteCounter(votes, totalVotes);
    const electionResults = (
      await BaseModel.Candidate.findAll({
        where: { electionId: electionid },

        include: [
          { model: BaseModel.Vote },
          {
            model: BaseModel.Student,
            include: { model: BaseModel.Department },
          },
          {
            model: BaseModel.ElectionPosition,
            include: { model: BaseModel.Position },
          },
        ],
      })
    ).map((result, index) => {
      result.dataValues.sn = index + 1;
      result.dataValues.count = result.dataValues.Votes.length;

      return result;
    });

    res.status(200),
      res.json({ error: null, message: 'success', electionResults });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json({});
  }
};

const changePassword = async (model, data = {}) => {
  const { password, id } = data;
  try {
    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(password);
    const updateData = { password: hash };

    const result = await BaseModel[model].update(updateData, { where: { id } });
    return result;
  } catch (error) {
    console.log(error);
    throw new Error('failed to reset password');
  }
};

exports.changeStudentPassword = (req, res, next) => {
  try {
    const result = changePassword('Student', req.body);
    res.status(200);
    res.json({ error: null, message: 'success', result });
  } catch (error) {
    res.status(200);
    res.json({
      error: { resetPasswordMsg: 'operation failed' },
      message: 'failed',
    });
  }
};

const changeAvatar = async (model, uploadStatus) => {
  try {
    const { err, uploadDir, fields, fileName } = uploadStatus;
    const updateData = {
      avatar: `/images/uploads/${fileName}`,
    };
    const result = await BaseModel[model].update(updateData, {
      where: { id: fields.id },
    });
    return `/images/uploads/${fileName}`;
  } catch (error) {
    console.log(error);
    throw new Error('Operation failed');
  }
};

exports.changeStudentAvatar = async (req, res, next) => {
  try {
    if (req.uploadStatus.err == null) {
      let uploadDir = await changeAvatar('Student', req.uploadStatus);

      res.status(200);
      res.json({ error: null, message: 'success', avatar: uploadDir });
    } else {
      res.status(200);
      res.json({
        error: { uploadAvatar: req.uploadStatus.err },
        message: 'success',
        avatar: uploadDir,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json({ errror: { message: 'operation failed' } });
  }
};

exports.saveAdmin = async (req, res, next) => {
  let { surname, othernames, emailAddress, password, userRole } = sanitize(
    req.body
  );
  const newAdmin = { surname, othernames, emailAddress, userRole };

  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(password, salt);

  newAdmin['password'] = hash;

  try {
    const emailExists = await BaseModel.Admin.findOne({
      where: { emailAddress },
    });
    if (emailExists) {
      res.status(200);
      return res.json({
        error: { emailAddress: 'email address already exists' },
      });
    }
    const admin = await BaseModel.Admin.create(newAdmin);
    res.status(200);
    res.json({ error: null, admin, message: 'success' });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json({ error: { message: 'operation failed' } });
  }
};

exports.changeAdminAvatar = async (req, res, next) => {
  try {
    if (req.uploadStatus.err == null) {
      let uploadDir = await changeAvatar('Admin', req.uploadStatus);

      res.status(200);
      res.json({ error: null, message: 'success', avatar: uploadDir });
    } else {
      res.status(200);
      res.json({
        error: { uploadAvatar: req.uploadStatus.err },
        message: 'success',
        avatar: uploadDir,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json({ errror: { message: 'operation failed' } });
  }
};
exports.changeAdminPassword = (req, res, next) => {
  try {
    const result = changePassword('Admin', req.body);
    res.status(200);
    res.json({ error: null, message: 'success', result });
  } catch (error) {
    res.status(200);
    res.json({
      error: { resetPasswordMsg: 'operation failed' },
      message: 'failed',
    });
  }
};

exports.updateAdmin = async (req, res, next) => {
  const { id, surname, othernames, emailAddress } = sanitize(req.body);
  try {
    const updateData = { surname, othernames, emailAddress };
    const result = await BaseModel.Admin.update(updateData, { where: { id } });

    res.status(200);
    res.json({ error: null, message: 'success', result });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json({ error: { updateMsg: 'operation failed' }, message: 'failed' });
  }
};

exports.mailer = async (req, res, next) => {
  let { firstName, lastName, emailAddress, message } = sanitize(req.body);

  try {
    const admin = await BaseModel.Admin.findOne({
      where: { userRole: 'superuser' },
    });
    if (!admin) {
      res.status(200);
      return res.json({ error: { message: 'message sending failed' } });
    }

    message = `
      <b>from: ${emailAddress}</b> <br /> <br />
      <strong>Full Name: ${lastName} ${firstName}</strong>
      <br/><br/>
     <b>Message: </b><br />${message}`;

    const info = await sendMail({
      to: emailAddress,
      from: 'myproject2019@aol.com',
      html: message,
      subject: 'Contact from Evoting.',
    });
    console.log(info);
    res.status(200);
    res.json({ error: null, message: 'success' });
  } catch (error) {
    console.log(error);
    res.status(200);
    res.json({ error: { message: 'operation failed' } });
  }
};
