export default function (sequelize, DataTypes) {
	return sequelize.define(
		'cms_setting',
		{
			id: {
				type: DataTypes.INTEGER(11).UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			setting_key: {
				type: DataTypes.STRING(80),
				allowNull: false,
				defaultValue: '',
				unique: true,
			},
			setting_value: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			value_type: {
				type: DataTypes.STRING(20),
				allowNull: false,
				defaultValue: 'string',
			},
			remark: {
				type: DataTypes.STRING(255),
				allowNull: false,
				defaultValue: '',
			},
			is_public: {
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
			tableName: 'cms_setting',
			indexes: [
				{ unique: true, fields: ['setting_key'] },
				{ fields: ['is_public'] },
			],
		}
	);
}
