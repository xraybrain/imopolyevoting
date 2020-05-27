const express = require('express');
const app = express();
const http = require('http').createServer(app);
const exphbs = require('express-handlebars');
const method = require('method-override');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const io = require('socket.io')(http);
const BaseModel = require('./server/database/models/index');
const { voteCounter } = require('./server/src/helpers');

app.use(express.static(path.join(__dirname, `public`)));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    resave: true,
    saveUninitialized: false,
    secret: '$#x1r2a3y4b5r6a7i8n$#',
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// overrides http methods
app.use(method('_METHOD'));

const adminExists = async () => {
  let admin = await BaseModel.Admin.findOne({
    where: { userRole: 'superuser' },
  });
  if (admin) {
    return true;
  }
  return false;
};

app.use(async (req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.msgError = req.flash('msgError');
  res.locals.msgSuccess = req.flash('msgSuccess');

  if (
    !(await adminExists()) &&
    req.originalUrl !== '/adminsetup/' &&
    req.method !== 'POST'
  )
    return res.redirect('/adminsetup/');

  next();
});

const viewsDir = `${__dirname}/server/views/`;
app.engine(
  'hbs',
  exphbs({
    extname: 'hbs',
    helpers: { isEqual: (val1, val2) => val1 === val2 },
  })
);
app.set('view engine', 'hbs');
app.set('views', viewsDir);

require('./server/routes/index')(app);
require('./server/routes/student')(app);
require('./server/routes/admin')(app);
require('./server/routes/api')(app);

app.get('/logout/', (req, res, next) => {
  req.logOut();
  res.redirect('/');
});
app.all('*', (req, res, next) => {
  res.render('404', { pageTitle: 'Page Not Found' });
});

const saveVote = async (options) => {
  const { electionId, candidateId, electionPositionId, studentId } = options;
  const newVote = { electionPositionId, electionId, candidateId, studentId };

  try {
    const hasVoted = await BaseModel.Vote.findOne({
      where: { electionId, studentId, electionPositionId },
    });
    let id;

    if (hasVoted) {
      id = hasVoted.dataValues.id;
      await BaseModel.Vote.update({ candidateId }, { where: { id } });
    } else {
      id = await BaseModel.Vote.create(newVote);
    }

    var totalVotes = {};

    (
      await BaseModel.Candidate.findAll({
        where: { electionId, electionPositionId },
      })
    ).map((candidate) => {
      totalVotes[candidate.id] = 0;
    });

    const votes = await BaseModel.Vote.findAll({
      where: { electionId, electionPositionId },
      include: [
        { model: BaseModel.Candidate, include: { model: BaseModel.Student } },
      ],
      order: [['candidateId', 'ASC']],
    });

    totalVotes = voteCounter(votes, totalVotes);
    return totalVotes;
  } catch (error) {
    console.log(error);
    return {};
  }
};

//-- SOCKET.IO connection
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('vote', async (voteData) => {
    const totalVotes = await saveVote(voteData);
    io.emit('newVote', { message: 'success', totalVotes });
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is up on PORT::${PORT}`);
});


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";