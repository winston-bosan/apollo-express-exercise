import Sequelize from "sequelize";

let sequelize;

console.log(process.env.RDS_DB_NAME, process.env.RDS_USERNAME, process.env.RDS_PASSWORD, process.env.RDS_HOSTNAME, process.env.RDS_PORT)

if (process.env.REMOTE) {
  console.log('We are doing this remotely')
  sequelize = new Sequelize(
    process.env.RDS_DB_NAME,
    process.env.RDS_USERNAME,
    process.env.RDS_PASSWORD,
    {
      host: process.env.RDS_HOSTNAME,
      port: process.env.RDS_PORT,
      maxConcurrentQueries: 100,
      dialect: "postgres",
      dialectOptions: {
        ssl: "Amazon RDS"
      },
      pool: { maxConnections: 1, maxIdleTime: 30 },
      language: "en"
    }
  );
} else {
  console.log('We are doing this locally')
  sequelize = new Sequelize(
    process.env.TEST_DATABASE || process.env.DATABASE,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
      dialect: "postgres"
    }
  );
}

const models = {
  User: sequelize.import("./user"),
  Act: sequelize.import("./act"),
  Movement: sequelize.import("./movement"),
  List: sequelize.import("./list")
};

Object.keys(models).forEach(key => {
  if ("associate" in models[key]) {
    models[key].associate(models);
  }
});

export { sequelize };

export default models;
