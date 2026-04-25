export default function (sequelize, DataTypes) {
	return sequelize.define(
		'cms_article',
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
			},
			category_id: {
				type: DataTypes.INTEGER(11).UNSIGNED,
				allowNull: false,
				defaultValue: '0',
			},
			status: {
				type: DataTypes.INTEGER(1),
				allowNull: false,
				defaultValue: '1',
			},
			sort: {
				type: DataTypes.INTEGER(11).UNSIGNED,
				allowNull: false,
				defaultValue: '0',
			},
			is_top: {
				type: DataTypes.INTEGER(1),
				allowNull: false,
				defaultValue: '0',
			},
			is_recommend: {
				type: DataTypes.INTEGER(1),
				allowNull: false,
				defaultValue: '0',
			},
			article_pic: {
				type: DataTypes.STRING(255),
				allowNull: false,
				defaultValue: '',
			},
			article_title: {
				type: DataTypes.STRING(120),
				allowNull: false,
				defaultValue: '',
			},
			article_cont: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			article_summary: {
				type: DataTypes.STRING(500),
				allowNull: false,
				defaultValue: '',
			},
			article_slug: {
				type: DataTypes.STRING(120),
				allowNull: false,
				defaultValue: '',
			},
			seo_title: {
				type: DataTypes.STRING(120),
				allowNull: false,
				defaultValue: '',
			},
			seo_keywords: {
				type: DataTypes.STRING(255),
				allowNull: false,
				defaultValue: '',
			},
			seo_description: {
				type: DataTypes.STRING(255),
				allowNull: false,
				defaultValue: '',
			},
			article_view: {
				type: DataTypes.INTEGER(11).UNSIGNED,
				allowNull: false,
				defaultValue: '0',
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
			tableName: 'cms_article',
			indexes: [
				{ fields: ['status', 'is_top', 'sort', 'id'] },
				{ fields: ['category_id', 'status'] },
				{ fields: ['article_slug'] },
				{ fields: ['user_id'] },
			],
		}
	);
};
