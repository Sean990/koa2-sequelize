/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('z_nav', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    nav_name: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: ''
    },
    nav_url: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: ''
    },
    create_time: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: '0'
    },
    update_time: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'z_nav'
  });
};
