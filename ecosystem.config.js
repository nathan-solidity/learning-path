module.exports = {
  apps: [
    {
      name: "learning-path",
      script: "server.py",
      interpreter: "python3",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      env: {
        FLASK_ENV: "production",
        PORT: "5032",
      },
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
