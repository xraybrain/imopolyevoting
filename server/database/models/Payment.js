module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    'Payment',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      studentId: { type: DataTypes.INTEGER },
      electionId: { type: DataTypes.INTEGER },
      electionPositionId: { type: DataTypes.INTEGER },
      amount: { type: DataTypes.DOUBLE(8, 2) },
      reference: { type: DataTypes.STRING },
      status: { type: DataTypes.STRING },
    },
    {
      paranoid: true,
    }
  );

  Payment.associate = (models) => {
    models.Payment.belongsTo(models.Student, { foreignKey: 'studentId' });
    models.Payment.belongsTo(models.Election, { foreignKey: 'electionId' });
    models.Payment.belongsTo(models.ElectionPosition, {
      foreignKey: 'electionPositionId',
    });
  };

  return Payment;
};
