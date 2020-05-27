module.exports = (sequelize, DataTypes) => {
  const Vote = sequelize.define(
    'Vote',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      studentId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Students',
          key: 'id',
        },
      },
      electionId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Elections',
          key: 'id',
        },
      },
      electionPositionId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'ElectionPositions',
          key: 'id',
        },
      },
      candidateId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Candidates',
          key: 'id',
        },
      },
    },
    {
      paranoid: true,
    }
  );

  Vote.associate = (models) => {
    models.Vote.belongsTo(models.Student, { foreignKey: 'studentId' });
    models.Vote.belongsTo(models.Election, { foreignKey: 'electionId' });
    models.Vote.belongsTo(models.ElectionPosition, {
      foreignKey: 'electionPositionId',
    });
    models.Vote.belongsTo(models.Candidate, { foreignKey: 'candidateId' });
  };

  return Vote;
};
