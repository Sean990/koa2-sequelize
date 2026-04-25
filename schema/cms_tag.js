export default function (sequelize, DataTypes) {
	return sequelize.define(
		'cms_tag',
		{
			id: {
				type: DataTypes.INTEGER(11).UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			tag_title: {
				type: DataTypes.STRING(30),
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
			tableName: 'cms_tag',
		}
	);
};
