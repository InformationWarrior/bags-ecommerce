const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");

const session = require("express-session");
const connectMongo = require('connect-mongo');
var MongoStore = connectMongo(session);

const Category = require("./models/category");
const connectDB = require("./config/db");

const app = express();
require("./config/passport");

// mongodb configuration
connectDB();

const viewsPath = path.join(__dirname, 'views');
const publicPath = path.join(__dirname, 'public');

// view engine setup
app.set("views", viewsPath);
app.set("view engine", "ejs");

// admin route
const adminRouter = require("./routes/admin");
app.use("/admin", adminRouter);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(publicPath));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
    }),
    //session expires after 3 hours
    cookie: { maxAge: 60 * 1000 * 60 * 3 },
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// global variables across routes
app.use(async (req, res, nex t) => {
  try {  
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    res.locals.currentUser = req.user;
    const categories = await Category.find({}).sort({ title: 1 }).exec();
    res.locals.categories = categories;
    next();
  } 
  catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// add breadcrumbs
get_breadcrumbs = function (url) {
  var rtn = [{ name: "Home", url: "/" }],
    acc = "", // accumulative url
    arr = url.substring(1).split("/");

  for (i = 0; i < arr.length; i++) {
    acc = i != arr.length - 1 ? acc + "/" + arr[i] : null;
    rtn[i + 1] = {
      name: arr[i].charAt(0).toUpperCase() + arr[i].slice(1),
      url: acc,
    };
  }
  return rtn;
};

app.use(function (req, res, next) {
  req.breadcrumbs = get_breadcrumbs(req.originalUrl);
  next();
});

//routes config
const indexRouter = require("./routes/index");
const productsRouter = require("./routes/products");
const usersRouter = require("./routes/user");
const pagesRouter = require("./routes/pages");
app.use("/products", productsRouter);
app.use("/user", usersRouter);
app.use("/pages", pagesRouter);
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;


//****************************************************

/**Packages used

1. **`http-errors`**:
   - Used to create HTTP error objects for error handling in Express. It simplifies sending errors like 404 (Not Found) or 500 (Internal Server Error).

2. **`express`**:
   - A popular web framework for Node.js that simplifies the development of web applications and APIs. It provides powerful routing, middleware, and HTTP utilities.

3. **`path`**:
   - A Node.js core module used to handle and transform file and directory paths. It ensures that paths are handled consistently across different operating systems.

4. **`cookie-parser`**:
   - Middleware to parse cookies attached to client requests. It makes cookies easier to work with by exposing them as an object in `req.cookies`.

5. **`morgan`**:
   - A HTTP request logger middleware for Node.js. It logs details about incoming HTTP requests, such as method, URL, and response time, useful for debugging and monitoring.

6. **`mongoose`**:
   - An ODM (Object Data Modeling) library for MongoDB and Node.js. It provides a schema-based solution to model and interact with MongoDB databases in a structured way.

7. **`passport`**:
   - Authentication middleware for Node.js. It provides a simple, modular way to authenticate requests with different strategies 
   (e.g., local, OAuth, JWT).

8. **`connect-flash`**:
   - A middleware for storing temporary flash messages in session, which can be displayed on the next request. Often used to show success, error, or information messages after form submissions or redirects.

9. **`express-session`**:
   - Middleware for handling session management in Express. It allows storing user data across requests by saving session data on the server and associating it with a client via a cookie.

10. **`connect-mongo`**:
    - A MongoDB-based session store for Express and Connect. It allows sessions to be stored in a MongoDB database, providing persistent session data across server restarts.
*/

//****************************************************

/**
const session = require("express-session");
const connectMongo = require('connect-mongo');
var MongoStore = connectMongo(session);

Here’s a breakdown of the code:

1. **`express-session`**:
   - This package is used to handle session management in your Express application. Sessions allow you to store data on the server for individual users, which can persist across multiple requests. The session data is associated with a client via a session ID stored in a cookie.

2. **`connect-mongo`**:
   - This package is used to store session data in a MongoDB database. By default, session data is stored in memory, but `connect-mongo` allows sessions to be saved in MongoDB, making them persistent and scalable.

3. **`MongoStore = connectMongo(session)`**:
   - This line creates a new instance of `MongoStore`, which links `connect-mongo` to `express-session`. The `session` object is passed as an argument to `connect-mongo` to enable session data to be stored in MongoDB using the `MongoStore` storage engine.

### How it works:
When a session is created in your Express app, instead of storing the session data in memory, it is stored in a MongoDB collection via `connect-mongo`. This ensures that session data is persistent across server restarts and can scale effectively with MongoDB.
 */

//****************************************************

/** Q. app.use(logger("dev"));
 The line `app.use(logger("dev"));` uses the **`morgan`** logging middleware to log details of incoming HTTP requests in **development mode**.

- **`logger("dev")`**: The `"dev"` argument specifies the logging format. In this case, the "dev" format provides **concise, colored output** that includes:
  - HTTP method (e.g., `GET`, `POST`)
  - URL (e.g., `/api/products`)
  - Status code (e.g., `200`, `404`)
  - Response time in milliseconds

This is useful for monitoring requests and debugging during development. For example, it helps track what requests are being made and their outcomes, like if a request is taking too long or resulting in an error.
 */

//****************************************************

/** 
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
    }),
    //session expires after 3 hours
    cookie: { maxAge: 60 * 1000 * 60 * 3 },
  })
);

This code sets up **session management** using the `express-session` middleware, configuring sessions to be stored in a MongoDB database. Here's a breakdown:

### 1. **`secret: process.env.SESSION_SECRET`**
   - Defines a **secret key** used to sign the session ID cookie. It's stored in the `.env` file for security.
   
### 2. **`resave: false`**
   - Ensures that sessions are **not resaved** to the store if they haven't been modified. This helps optimize performance.

### 3. **`saveUninitialized: false`**
   - Prevents saving **uninitialized sessions** to the store. A session won't be saved until it is modified, which can help reduce unnecessary storage.

### 4. **`store: new MongoStore({ mongooseConnection: mongoose.connection })`**
   - Stores session data in MongoDB using `connect-mongo`. It connects to an existing **Mongoose** connection (provided by `mongoose.connection`).

### 5. **`cookie: { maxAge: 60 * 1000 * 60 * 3 }`**
   - Sets the session **cookie's expiration** to 3 hours (`60 minutes * 1000 milliseconds * 60 * 3`).

### Summary:
- This code configures secure, MongoDB-backed session management for the app.
- Sessions expire after 3 hours, ensuring that users will be logged out after inactivity.
*/

//****************************************************

/**
app.use(passport.initialize());
app.use(passport.session()); 

These lines are configuring **Passport.js** to handle authentication in your Express application:

### 1. **`app.use(passport.initialize());`**
   - Initializes **Passport** middleware. This is required to set up Passport in your application and enables it to intercept and handle authentication requests.
   - It prepares Passport to manage authentication-related operations, such as logging in users.

### 2. **`app.use(passport.session());`**
   - Middleware to handle **persistent login sessions**.
   - When users authenticate (e.g., through a login form), Passport saves the user’s session to the server, so they remain logged in between different requests.
   - This is crucial when you're using sessions to store user login data (like in the previous `session` setup).

### Summary:
- `passport.initialize()` is used to set up Passport for use in the application.
- `passport.session()` ensures that authenticated users remain logged in across different pages and requests via session management.
*/

//****************************************************

/** app.use(flash());
 * The line `app.use(flash());` integrates the **connect-flash** middleware into your Express application. Here's a brief explanation:

### **Purpose:**
- **`flash()`** is used to store and display temporary messages (called "flash messages") between different requests. These messages are typically used to display notifications, such as success or error messages, after a form submission or user action (e.g., login success or failure).

### **How It Works:**
1. **Temporary Storage:** Flash messages are stored in the session and are available for the next request. Once they are displayed, they are removed.
2. **Use Case:** You can set a flash message in a route (e.g., after a login attempt) and access it in a view to notify the user of success, failure, etc.

### Example:
- After a failed login, you could set a flash message:
  ```js
  req.flash('error', 'Invalid username or password');
  ```

- In your template (e.g., EJS or Pug), you could then display the message:
  ```html
  <%= message.error %>
  ```

This makes `connect-flash` a common tool for displaying user-friendly notifications across page redirects or reloads.
*/