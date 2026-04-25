export default function (sequelize, DataTypes) {
	return sequelize.define(
		'cms_friendlink',
		{
			id: {
				type: DataTypes.INTEGER(11).UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			friendlink_url: {
				type: DataTypes.STRING(255),
				allowNull: false,
				defaultValue: '',
			},
			friendlink_title: {
				type: DataTypes.STRING(60),
				allowNull: false,
				defaultValue: '',
			},
			status: {
				type: DataTypes.INTEGER(1),
				allowNull: false,
				defaultValue: '1',
			},
			create_time: {
				type: DataTypes.INTEGER(11).UNSIGNED,
				allowNull: false,
				defaultValue: '0',
			},
			update_time: {
				type: DataTypes.INTEGER(11).UNSIGNED,
				allowNull: false,
				defaultValue: '0',
			},
		},
		{
			tableName: 'cms_friendlink',
		}
	);
};
