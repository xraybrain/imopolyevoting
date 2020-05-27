module.exports = (sequelize, DataTypes) => {
  const ElectionPosition = sequelize.define(
    'ElectionPosition',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      positionId: {
        type: DataTypes.INTEGER,
        references: { model: 'Position', key: 'id' },
      },
      electionId: { type: DataTypes.INTEGER },
      formPrice: { type: DataTypes.DOUBLE },
    },
    {
      paranoid: true,
    }
  );

  ElectionPosition.associate = (models) => {
    models.ElectionPosition.belongsTo(models.Election, {
      foreignKey: 'electionId',
    });

    models.ElectionPosition.belongsTo(models.Position, {
      foreignKey: 'positionId',
    });

    models.ElectionPosition.hasMany(models.Candidate, {
      foreignKey: 'electionPositionId',
    });
  };

  return ElectionPosition;
};
