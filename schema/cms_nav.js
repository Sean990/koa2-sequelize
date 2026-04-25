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
				type: DataTypes.STRING(30),
				allowNull: false,
				defaultValue: '',
			},
			nav_url: {
				type: DataTypes.STRING(255),
				allowNull: false,
				defaultValue: '',
			},
			target: {
				type: DataTypes.STRING(20),
				allowNull: false,
				defaultValue: '_self',
			},
			sort: {
				type: DataTypes.INTEGER(11).UNSIGNED,
				allowNull: false,
				defaultValue: '0',
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
			tableName: 'cms_nav',
		}
	);
};
