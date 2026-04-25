import { Sequelize } from 'sequelize';
import config from './config.js';

const { dbName, host, port, user, password, logging } = config.database;

export const sequelize = new Sequelize(dbName, user, password, {
	host,
	port,
	dialect: 'mysql',
	logging: logging ? console.log : false,
	dialectOptions: {
		charset: 'utf8mb4',
		supportBigNumbers: true,
		bigNumberStrings: true,
	},
	pool: {
		max: 10,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
	define: {
		freezeTableName: true,
		timestamps: false,
		paranoid: false,
		underscored: false,
		operatorsAliases: false,
		charset: 'utf8mb4',
		collate: 'utf8mb4_general_ci',
	},
});

export async function initDatabase() {
	await sequelize.authenticate();
	console.log('[db] connection established.');
	await sequelize.sync({ alter: config.database.syncAlter });
	console.log(`[db] schema synced. alter=${config.database.syncAlter}`);
}
