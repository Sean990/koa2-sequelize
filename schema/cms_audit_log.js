export default function (sequelize, DataTypes) {
	return sequelize.define(
		'cms_audit_log',
		{
			id: {
				type: DataTypes.INTEGER(11).UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			user_id: {
				type: DataTypes.INTEGER(11).UNSIGNED,
				allowNull: false,
				defaultValue: '0',
			},
			username: {
				type: DataTypes.STRING(32),
				allowNull: false,
				defaultValue: '',
			},
			method: {
				type: DataTypes.STRING(10),
				allowNull: false,
				defaultValue: '',
			},
			path: {
				type: DataTypes.STRING(255),
				allowNull: false,
				defaultValue: '',
			},
			status: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				defaultValue: '0',
			},
			ip: {
				type: DataTypes.STRING(64),
				allowNull: false,
				defaultValue: '',
			},
			user_agent: {
				type: DataTypes.STRING(255),
				allowNull: false,
				defaultValue: '',
			},
			request_body: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			response_code: {
				type: DataTypes.INTEGER(11),
				allowNull: false,
				defaultValue: '0',
			},
			cost_ms: {
				type: DataTypes.INTEGER(11).UNSIGNED,
				allowNull: false,
				defaultValue: '0',
			},
			create_time: {
				type: DataTypes.INTEGER(11).UNSIGNED,
				allowNull: false,
				defaultValue: '0',
			},
		},
		{
			tableName: 'cms_audit_log',
		}
	);
}
