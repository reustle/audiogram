// Import Sequelize, DataTypes, and Model from the sequelize package
import { Sequelize, DataTypes, Model } from 'sequelize';
import cuid from 'cuid';
import dotenv from 'dotenv';

// Import environment variables from .env file
dotenv.config();

// Initialize Sequelize with database credentials from .env file
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // <-- required for self-signed certificates
    }
  }
});

// Initialize ReadingPoints model with fields: id, createdAt, lat, lon, and decibels
class ReadingPoints extends Model {}
ReadingPoints.init({
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: () => cuid()
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  lat: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  lon: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  decibels: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'ReadingPoints',
  timestamps: false // We're handling the createdAt field manually
});


// Sync database, alter tables if they exist and differ from the model
sequelize.sync({ alter: true });

// Export Message model for use in other files
export { ReadingPoints };

