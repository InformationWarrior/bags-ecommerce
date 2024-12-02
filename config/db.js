require('dotenv').config();
const mongoose = require("mongoose");
const DB_URL = process.env.DB_URL;
const log = console.log;

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    log("Connected to database successfully");
  }
  catch (error) {
    log("Database Connection error >>> ", error);
  }
};

module.exports = connectDB;


/**
 await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    
1. **`useNewUrlParser: true`**:
   - This tells Mongoose to use the new MongoDB connection string parser, which handles certain connection string features differently and more robustly. This option ensures compatibility with newer versions of MongoDB.

2. **`useCreateIndex: true`**:
   - This enables Mongoose to use `createIndex()` instead of `ensureIndex()`. The latter is deprecated in MongoDB, so this option avoids deprecation warnings and ensures indexes are created properly in the background.

3. **`useUnifiedTopology: true`**:
   - This option opts into using the new MongoDB driver's unified topology engine, which simplifies connection management and improves reliability and performance. It fixes issues related to connection handling and deprecated features in the MongoDB driver.

### Summary:
These options are passed to ensure Mongoose works well with the latest MongoDB features and avoids deprecation warnings, improving the stability and performance of your database connection.
 */