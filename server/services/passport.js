const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const BaseModel = require('../database/models/index');

module.exports = (passport, model) => {
  passport.use(
    new LocalStrategy(
      { usernameField: 'emailAddress' },
      async (emailAddress, password, done) => {
        let user = await BaseModel[model].findOne({
          where: { emailAddress },
        });

        if (!user) {
          // check if account was declined
          user = await BaseModel[model].findOne({
            where: { emailAddress },
            paranoid: false,
          });
          if (user) {
            return done(null, false, {
              message:
                'You account is currently disabled please contact admin.',
            });
          }

          return done(null, false, {
            message: 'wrong email and password combination.',
          });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (isMatch) {
            user['role'] = model;
            return done(null, user);
          } else {
            return done(null, false, {
              message: 'Wrong email address and password combination.',
            });
          }
        });
      }
    )
  );

  passport.serializeUser(function (user, done) {
    done(null, {
      _id: user.id,
      role: user.role,
    });
  });

  passport.deserializeUser(async (hash, done) => {
    model = hash.role;

    let user = null;
    if (model === 'Student') {
      user = await BaseModel[model].findOne({
        where: { id: hash._id },
        include: [{ model: BaseModel.Department }, { model: BaseModel.Level }],
      });
      user = {
        ...user.dataValues,
      };
      user.role = 'Student';
    } else if (model === 'Admin') {
      user = await BaseModel[model].findOne({
        where: { id: hash._id },
      });
      user = { ...user.dataValues };
      user.role = 'Admin';
    }

    if (user) done(null, user);
    else done(null, false);
  });
};
