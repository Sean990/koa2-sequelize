import mysql from 'mysql2/promise';
import config from './config/config.js';

const { dbName, host, port, user, password } = config.database;

async function cleanDatabase() {
	const connection = await mysql.createConnection({
		host,
		port,
		user,
		password,
		database: dbName,
	});

	try {
		// 禁用外键检查
		await connection.execute('SET FOREIGN_KEY_CHECKS=0');

		// 删除所有表
		const [tables] = await connection.execute(
			`SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
			[dbName]
		);

		for (const { TABLE_NAME } of tables) {
			console.log(`删除表: ${TABLE_NAME}`);
			await connection.execute(`DROP TABLE IF EXISTS ${TABLE_NAME}`);
		}

		// 重新启用外键检查
		await connection.execute('SET FOREIGN_KEY_CHECKS=1');

		console.log('✅ 数据库清理完成');
	} catch (error) {
		console.error('❌ 错误:', error.message);
	} finally {
		await connection.end();
	}
}

cleanDatabase();
