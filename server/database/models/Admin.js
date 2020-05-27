module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define(
    'Admin',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      surname: { type: DataTypes.STRING },
      othernames: { type: DataTypes.STRING },
      emailAddress: { type: DataTypes.STRING },
      password: { type: DataTypes.STRING },
      avatar: { type: DataTypes.STRING },
      userRole: { type: DataTypes.STRING, defaultValue: 'superuser' },
    },
    {
      paranoid: true,
    }
  );

  return Admin;
};
