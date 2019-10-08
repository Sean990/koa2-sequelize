/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('z_friendlink', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    friendlink_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
    friendlink_title: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: ''
    },
    status: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1'
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
    tableName: 'z_friendlink'
  });
};
