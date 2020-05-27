module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('admins', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      surname: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      othernames: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      emailAddress: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(60),
        allowNull: false,
      },
      avatar: {
        type: Sequelize.STRING(150),
        defaultValue: '/images/avatar.png',
      },
      userRole: {
        type: Sequelize.STRING(50),
        defaultValue: 'superuser'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('admins');
  },
};
