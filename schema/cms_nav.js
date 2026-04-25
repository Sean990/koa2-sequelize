export default function (sequelize, DataTypes) {
	return sequelize.define(
		'cms_nav',
		{
			id: {
				type: DataTypes.INTEGER(11).UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			nav_name: {
				type: DataTypes.STRING(10),
				allowNull: false,
				defaultValue: '',
			},
			nav_url: {
				type: DataTypes.STRING(30),
				allowNull: false,
				defaultValue: '',
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
			tableName: 'cms_nav',
		}
	);
};
