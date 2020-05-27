module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Levels', [
      {
        name: 'ND1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ND2',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'HND1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'HND2',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Levels', null, {});
  }
};
