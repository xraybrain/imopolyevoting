module.exports = (sequelize, DataTypes) => {
  const Election = sequelize.define(
    'Election',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      title: { type: DataTypes.STRING },
      status: { type: DataTypes.STRING },
      startDateTime: { type: DataTypes.DATE },
      endDateTime: { type: DataTypes.DATE },
    },
    {
      paranoid: true,
    }
  );

  Election.associate = (models) => {
    models.Election.hasMany(models.ElectionPosition, {
      foreignKey: 'electionId',
    });
  };

  return Election;
};
