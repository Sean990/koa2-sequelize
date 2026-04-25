export default function (sequelize, DataTypes) {
	return sequelize.define(
		'cms_category',
		{
			id: {
				type: DataTypes.INTEGER(11).UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			category_name: {
				type: DataTypes.STRING(30),
				allowNull: false,
				defaultValue: '',
			},
			category_slug: {
				type: DataTypes.STRING(80),
				allowNull: false,
				defaultValue: '',
			},
			description: {
				type: DataTypes.STRING(255),
				allowNull: false,
				defaultValue: '',
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
			tableName: 'cms_category',
			indexes: [
				{ fields: ['status', 'sort'] },
				{ fields: ['category_slug'] },
			],
		}
	);
}
