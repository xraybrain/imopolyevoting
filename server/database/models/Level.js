module.exports = (sequelize, DataTypes) => {
  const Level = sequelize.define('Level', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    name: { type: DataTypes.STRING },
  });

  return Level;
};
