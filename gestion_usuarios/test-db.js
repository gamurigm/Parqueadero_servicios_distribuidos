const { DataSource } = require('typeorm');

const ds = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5436,
  username: 'postgres',
  password: 'postgres',
  database: 'usuarios',
});

ds.initialize()
  .then(() => console.log('connected'))
  .catch(e => console.error(e.message))
  .finally(() => process.exit(0));