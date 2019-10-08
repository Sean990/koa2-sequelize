/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('z_user', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    nickname: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: ''
    },
    realname: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: ''
    },
    github_nickname: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
    github_link: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
    qq_nickname: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
    qq_link: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
    music_nickname: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
    music_link: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
    passwrod: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: ''
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
    sex: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    birthday: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: '0'
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
    tableName: 'z_user'
  });
};
