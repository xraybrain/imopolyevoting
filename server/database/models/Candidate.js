module.exports = (sequelize, DataTypes) => {
  const Candidate = sequelize.define(
    'Candidate',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      studentId: { type: DataTypes.INTEGER },
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
      paymentId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Payments',
          key: 'id',
        },
      },
      canContest: { type: DataTypes.BOOLEAN },
      activated: { type: DataTypes.BOOLEAN },
      manifesto: { type: DataTypes.STRING },
      campaignName: { type: DataTypes.STRING },
    },
    {
      paranoid: true,
    }
  );

  Candidate.associate = (models) => {
    models.Candidate.belongsTo(models.Student, { foreignKey: 'studentId' });
    models.Candidate.belongsTo(models.Election, { foreignKey: 'electionId' });
    models.Candidate.belongsTo(models.ElectionPosition, {
      foreignKey: 'electionPositionId',
    });
    models.Candidate.belongsTo(models.Payment, { foreignKey: 'paymentId' });
    models.Candidate.hasMany(models.Vote, { foreignKey: 'candidateId' });
  };

  return Candidate;
};
