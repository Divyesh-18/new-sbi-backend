module.exports = {
  apps: [{
    name: 'pokerbaazi-backend',
    script: './bin/www',
    instances: 1, // Single instance since you have cron jobs
    exec_mode: 'fork', // Use fork mode for single instance
    autorestart: true,
    watch: false, // Disable watch in production
    max_memory_restart: '1G', // Restart if memory exceeds 1GB
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    
    // Restart configuration
    min_uptime: '10s', // Minimum uptime before considering the app stable
    max_restarts: 10, // Maximum restarts within 1 minute
    restart_delay: 4000, // Delay between restarts
    
    // Log configuration
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Advanced features
    // instance_var: 'INSTANCE_ID',
    
    // Monitoring
    // pmx: true,
    
    // Post-deployment hooks
    // post_update: ['npm install', 'echo Deployment successful'],
  }]
};
