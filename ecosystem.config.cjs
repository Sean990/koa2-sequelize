module.exports = {
	apps: [
		{
			name: 'sean-blog-cms-service',
			script: 'bin/www',
			instances: 1,
			exec_mode: 'fork',
			env: {
				NODE_ENV: 'production',
				PORT: 3000,
			},
			error_file: 'logs/pm2-error.log',
			out_file: 'logs/pm2-out.log',
			log_date_format: 'YYYY-MM-DD HH:mm:ss',
			max_memory_restart: '300M',
		},
	],
};
