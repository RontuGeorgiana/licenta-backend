module.exports = {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: +process.env.DATABASE_PORT,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/migrations/*.js'],
    cli: {
      migrationsDir: 'src/migrations',
    },
    synchronize: process.env.NODE_ENV !== 'local',
    ssl:
      process.env.NODE_ENV === 'local'
        ? false
        : {
            rejectUnauthorized: false,
          },
  };