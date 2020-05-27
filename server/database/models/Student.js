module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define(
    'Student',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      surname: { type: DataTypes.STRING },
      othernames: { type: DataTypes.STRING },
      emailAddress: { type: DataTypes.STRING },
      password: { type: DataTypes.STRING },
      matricNo: { type: DataTypes.STRING },
      levelId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'levels',
          key: 'id',
        },
      },
      departmentId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'departments',
          key: 'id',
        },
      },
      activated: { type: DataTypes.BOOLEAN },
      avatar: { type: DataTypes.STRING },
    },
    {
      paranoid: true,
    }
  );

  Student.associate = (models) => {
    models.Student.belongsTo(models.Department, { foreignKey: 'departmentId' });
    models.Student.belongsTo(models.Level, { foreignKey: 'levelId' });
  };

  return Student;
};
