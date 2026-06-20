const { spawn } = require('child_process');

const child = spawn('node', ['dist/src/main.js'], {
  env: {
    ...process.env,
    DB_HOST: 'localhost',
    DB_PORT: '5436',
    DB_USER: 'postgres',
    DB_PASSWORD: 'postgres',
    DB_NAME: 'usuarios'
  },
  cwd: __dirname,
  stdio: 'inherit'
});

child.on('close', (code) => {
  console.log(`App exited with code ${code}`);
});

console.log('App started, PID:', child.pid);

// Keep the script running
process.on('SIGINT', () => {
  child.kill();
  process.exit(0);
});