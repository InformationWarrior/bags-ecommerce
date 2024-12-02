const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");

passport.serializeUser((user, done) => {
  done(null, user.id);
  //error, object -> user id
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
    //error, object
  });
});

passport.use(
  "local.signup",
  new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },
    async (req, email, password, done) => {
      try {
        const user = await User.findOne({ email: email });
        if (user) {
          return done(null, false, { message: "Email already exists" });
          //error, object  as bool, custom error message
        }
        if (password != req.body.password2) {
          return done(null, false, { message: "Passwords must match" });
        }

        const newUser = await new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.username = req.body.name;

        await newUser.save();
        return done(null, newUser);
        //error, object
      }
      catch (error) {
        console.log(error);
        return done(error);
      }
    }
  )
);

passport.use(
  "local.signin",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: false,
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          return done(null, false, { message: "User doesn't exist" });
          //error, object, message
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: "Wrong password" });
        }
        return done(null, user);
      }
      catch (error) {
        console.log(error);
        return done(error);
      }
    }
  )
);

//******************************************************** 

/** Q1. File Flow

This code defines how Passport.js handles **user authentication** using the **local strategy** for signup and signin in a Node.js application.

### 1. **Serialize and Deserialize User:**
   - **`passport.serializeUser`**: This function defines how the user object is stored in the session. It stores the user's `id` in the session after authentication.
     ```javascript
     passport.serializeUser((user, done) => {
       done(null, user.id);
     });
     ```
     - After a user is authenticated, Passport saves only the user’s `id` in the session, minimizing session storage.

   - **`passport.deserializeUser`**: This function defines how to retrieve the user object from the session based on the stored `id`.
     ```javascript
     passport.deserializeUser((id, done) => {
       User.findById(id, (err, user) => {
         done(err, user);
       });
     });
     ```
     - When a request comes in, Passport retrieves the user details by the `id` stored in the session.

### 2. **Local Strategy for Signup (`local.signup`)**:
   - This strategy handles **user registration**.

   - **Steps**:
     1. Checks if the email already exists. If it does, returns an error.
     2. Verifies that the password matches the `password2` confirmation field.
     3. Creates a new user with encrypted password.
     4. Saves the new user and passes it to `done()`, indicating successful signup.

### 3. **Local Strategy for Signin (`local.signin`)**:
   - This strategy handles **user login**.

   - **Steps**:
     1. Finds the user by email.
     2. If the user is not found, returns an error (`"User doesn't exist"`).
     3. Validates the password using the `validPassword` method. If it doesn’t match, returns an error (`"Wrong password"`).
     4. If the login is successful, returns the user.

### Key Points:
- **`LocalStrategy`**: This is a Passport.js strategy for authenticating users using a username and password.
  - In this case, it’s configured to use `email` as the username and `password` as the password.

- **`serializeUser` and `deserializeUser`**: These are required by Passport to manage user sessions. Only the `id` is stored in the session, and the user details are fetched from the database when necessary.

- **Error Handling**: If an error occurs (like user not found or incorrect password), the strategy calls `done()` with `false` and an error message.

- **Password Encryption**: Passwords are encrypted using a method (`encryptPassword`) before saving and validated using `validPassword` when logging in.

This structure is useful for managing user authentication securely in Node.js apps with Passport.js.
*/

//******************************************************** 

/** Q2.
passport.serializeUser((user, done) => {
  done(null, user.id);
});
is part of Passport.js's session management.

### What is `serializeUser`?

`passport.serializeUser` defines how Passport.js will store user information in the session after successful authentication.

- When a user successfully logs in (or signs up), Passport needs to save some information about the user in the session so that it can identify the user in subsequent requests without requiring them to log in again.

- Instead of storing the whole user object (which could be large and contain sensitive information), Passport stores only a **unique identifier**, typically the user’s `id`. This makes session storage more efficient and secure.

### Parameters:
- **`user`**: This is the user object returned after successful authentication. Typically, it contains all user details, like `username`, `email`, `id`, etc.
- **`done`**: A callback function that is called once serialization is complete.

### How It Works:
- **`user.id`**: The unique identifier (like MongoDB's `_id` field) is passed to `done(null, user.id)`. This `id` is what gets stored in the session.
- When the user makes subsequent requests, Passport will use this `id` to retrieve the full user object from the database (through `deserializeUser`).

### Example Flow:

1. **User logs in**:
   - After a successful login, the full `user` object is returned from the database.

2. **Passport stores the `id` in the session**:
   - The `serializeUser` function is called, and only the user's `id` is stored in the session cookie, e.g., `user.id = "601d1b8e1c9c9f12f423b456"`.

3. **On subsequent requests**:
   - Passport uses this `id` from the session to look up the full user object using `deserializeUser`.

### Why It’s Important:
- This approach is **efficient** because only the user’s `id` is stored in the session, not the entire user object.
- It’s **secure** because the user object (with sensitive data like the password hash) is not directly exposed or stored in the session, only the unique identifier.

In summary, `serializeUser` tells Passport how to save user information in the session after successful authentication by storing only the user's `id`.
*/

//******************************************************** 

/** Q3. Where these serializeUser and deserializeUser methods are called
 *
 * The `serializeUser` method is called by Passport.js during the authentication process to handle session management. Here’s when and how it's typically called:

### 1. **After Successful Authentication**:
   - **Login or Signup**: When a user successfully logs in or signs up, Passport needs to establish a session for the user. After Passport validates the user's credentials (email and password), it calls `serializeUser` to determine what information to store in the session.

   - **In the Context of a Request**:
     - When a user submits login credentials, Passport.js processes the request using the `LocalStrategy` (or any other strategy you have configured).
     - If the credentials are valid and the user is authenticated, Passport calls `serializeUser` to store a unique identifier (such as `user.id`) in the session.

   Example:
   ```javascript
   passport.authenticate('local.signin', (err, user, info) => {
     if (err) return next(err);
     if (!user) return res.redirect('/login');
     req.logIn(user, (err) => {
       if (err) return next(err);
       return res.redirect('/');
     });
   })(req, res, next);
   ```
   - **`req.logIn(user, callback)`**:
     - This method is called after successful authentication. It triggers Passport to call `serializeUser` and store the user ID in the session.

### 2. **Middleware Setup**:
   - **Initialization**: In your Express.js app setup, you initialize Passport with `passport.initialize()` and `passport.session()`. This setup allows Passport to handle user sessions.
     ```javascript
     app.use(passport.initialize());
     app.use(passport.session());
     ```
   - These middleware functions are used to initialize Passport and handle the session. When `passport.session()` is used, Passport will automatically call `deserializeUser` on every request to load the user object based on the stored `id`.

### Example Flow:

1. **User submits login form**:
   - The `passport.authenticate('local.signin')` method is called with the user’s email and password.

2. **Passport verifies credentials**:
   - If authentication is successful, Passport calls the `serializeUser` method to store the user’s `id` in the session.

3. **User is logged in**:
   - The `req.logIn(user, callback)` method is called, which internally triggers `serializeUser`.

4. **Session management**:
   - For subsequent requests, Passport uses `deserializeUser` to retrieve the full user object from the database using the `id` stored in the session.

### In Summary:
- `serializeUser` is called automatically by Passport.js after successful authentication to store user-specific information in the session.
- It is not directly called in your application code but rather managed by Passport’s internal mechanisms as part of the login/signup process and session handling.
 */

//******************************************************* 

/**
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

The `passport.deserializeUser` method is crucial for retrieving user information from the session on subsequent requests. Here's a breakdown of its role and how it works:

### Purpose of `deserializeUser`

- **Retrieve User Information**: When a user makes a request to the server after logging in, Passport uses the `id` stored in the session to fetch the full user object from the database. This process is handled by the `deserializeUser` function.

### How It Works

1. **Session Storage**: After successful authentication, Passport stores only the user’s `id` in the session using `serializeUser`.

2. **Request Handling**: On every subsequent request, Passport needs to reconstruct the user object to make it available in `req.user`. This is done using `deserializeUser`.

3. **Fetching User**: `deserializeUser` is called with the `id` stored in the session. It queries the database to retrieve the user with that `id`.

4. **Callback**: Once the user object is fetched from the database, Passport calls the `done` callback function with the user object. This makes the user available as `req.user` in the request handlers.

### Code Explanation

```javascript
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
```

- **Parameters**:
  - **`id`**: The unique identifier (e.g., `_id` from MongoDB) that was stored in the session during the `serializeUser` phase.
  - **`done`**: A callback function provided by Passport. It should be called with two arguments:
    - **`err`**: If an error occurs while retrieving the user, this will contain the error information.
    - **`user`**: The user object retrieved from the database.

- **`User.findById(id, (err, user) => { ... })`**:
  - This line uses Mongoose to find the user by their `id`. The `findById` method queries the database for the user with the given `id`.

- **`done(err, user)`**:
  - This calls the `done` callback function with the results of the database query.
  - If there is an error (e.g., user not found), `err` will contain the error information.
  - If successful, `user` will contain the user object retrieved from the database.

### Example Flow

1. **User Logs In**:
   - `serializeUser` stores the user’s `id` in the session.

2. **Subsequent Request**:
   - When the user makes a new request, Passport reads the `id` from the session.

3. **Deserialization**:
   - `deserializeUser` is called with the `id` from the session.
   - It fetches the user from the database and calls `done()` with the user object.

4. **Accessing User Data**:
   - The user object is now available in `req.user` throughout the request lifecycle, allowing your application to access user-specific data.

### Summary

`passport.deserializeUser` is called by Passport.js automatically on every request to rehydrate the user object from the session’s `id`. It’s essential for making sure the user information is available in `req.user` and for maintaining the user's session across multiple requests.
 */

//******************************************************* 

/**
 * The provided code snippet is a `LocalStrategy` used by Passport.js for handling user sign-up, which processes form submissions during registration.

1. **Defining the Strategy**:
   - A new `LocalStrategy` is created with custom fields for `username` and `password` (`usernameField` is set to `email`, and `passwordField` to `password`).
   - `passReqToCallback: true` ensures that the entire request (`req`) is passed to the callback, allowing access to other fields such as `req.body.password2` for password confirmation and `req.body.name` for the username.

2. **Handling Signup**:
   - **User Existence Check**: The system checks if a user already exists with the provided email (`User.findOne({ email: email })`). If a user is found, it returns a failure message (`"Email already exists"`).
   - **Password Match Check**: It checks if the two password fields (`password` and `req.body.password2`) match. If they don't match, it returns a failure message (`"Passwords must match"`).
   
3. **Creating and Saving the New User**:
   - If the email is unique and the passwords match, a new `User` instance is created.
   - **Password Encryption**: The password is encrypted using `newUser.encryptPassword(password)`.
   - The user's `email` and `username` are also assigned from the form data.
   - The user is saved to the database using `await newUser.save()`.

4. **Successful Signup**:
   - If everything goes well, the new user object is passed to the `done` callback (`return done(null, newUser)`), which Passport uses to complete the registration process.

5. **Error Handling**:
   - Any errors during the process (such as database issues) are caught in the `catch` block and passed to `done(error)`.

### Flow Summary:

- **Form Submission**: The user submits a registration form with fields for email, password, confirm password, and username.
- **User Validation**: The system checks if a user already exists with that email and if the passwords match.
- **New User Creation**: If validation passes, a new user is created, their password is encrypted, and they are saved to the database.
- **Completion**: If successful, the new user is passed to Passport's `done` function for session management.

This approach ensures that registration is handled securely by checking for unique emails, encrypting passwords, and properly managing user sessions via Passport.
 */

//******************************************************* 

/**
 * This code snippet defines a `local.signin` strategy using Passport.js and the `LocalStrategy` module to handle user login (sign-in). 

### Code Flow and Explanation:

1. **Defining the Strategy**:
   - A new `LocalStrategy` is created with custom fields for `username` and `password`:
     - `usernameField` is set to `email`, meaning the user will log in using their email.
     - `passwordField` is set to `password`, meaning the password field in the request body is checked.
   - `passReqToCallback: false` indicates that the `req` object is not passed to the callback (since it's not needed in this case).

2. **Sign-in Logic**:
   - The callback function is asynchronous, allowing the use of `async/await` for database operations.
   
3. **Finding the User by Email**:
   - **User Check**: It attempts to find a user in the database by their email (`User.findOne({ email: email })`).
   - **User Doesn't Exist**: If no user is found with that email, the function returns an error message (`"User doesn't exist"`) and fails the authentication (`return done(null, false)`).

4. **Password Validation**:
   - If the user is found, the password entered by the user (`password`) is compared with the hashed password stored in the database (`user.validPassword(password)`).
   - **Invalid Password**: If the password is incorrect, it returns a failure message (`"Wrong password"`).

5. **Successful Login**:
   - If both the email exists and the password matches, the user object is passed to the `done` callback (`return done(null, user)`), which Passport uses to complete the login process.

6. **Error Handling**:
   - If an error occurs during the process (e.g., database issues), it's caught in the `catch` block and passed to `done(error)`.

### Flow Summary:

- **Form Submission**: The user submits a login form with an email and password.
- **User Lookup**: The system searches for the user in the database by their email.
- **Validation**:
  - If the user doesn't exist, the process returns a failure with a message.
  - If the password is incorrect, it also returns a failure with a different message.
- **Success**: If the email exists and the password is correct, the user is successfully logged in, and their session is managed by Passport.
  
This logic ensures that only valid users with correct credentials can log in.
 */

//************************************ 

/** done() syntax pattern
 * From the examples provided, we can deduce that the syntax of the `done` method follows this pattern:

```javascript
done(error, user, options);
```

### Breakdown:
1. **`error` (First Argument)**:
   - Represents any error that occurs during the authentication process.
   - Typically `null` when no error has occurred.
   - If an error does occur (e.g., database lookup failure), the error object or message is passed here.

2. **`user` (Second Argument)**:
   - Represents the authenticated user or the newly created user (in case of signup).
   - If authentication or signup is successful, a `user` object (or `newUser`) is passed here.
   - If authentication fails (e.g., wrong password, user doesn't exist), `false` is passed instead.

3. **`options` (Third Argument) [Optional]**:
   - This is an optional argument, usually passed as an object.
   - It can contain additional information like custom error messages (e.g., `{ message: "Email already exists" }`).
   - This is useful for providing feedback to the user during the authentication process.

### Common `done` Patterns:
- **Successful Operation**:
  ```javascript
  done(null, user);  // No error, user is authenticated
  ```

- **Failed Operation (no user, wrong password, etc.)**:
  ```javascript
  done(null, false, { message: "Custom error message" });  // No error, but authentication failed
  ```

- **Error Occurred**:
  ```javascript
  done(error);  // Error during authentication process
  ```

### Examples from your code:
- **Successful Signup/Login**:
  ```javascript
  done(null, newUser);  // User successfully signed up or signed in
  ```

- **Authentication Failure (Email exists, wrong password, etc.)**:
  ```javascript
  done(null, false, { message: "Error message" });  // No internal error, but authentication failed
  ```

- **Error Handling (e.g., database failure)**:
  ```javascript
  done(error);  // Some internal error occurred, e.g., during database access
  ``` 

This shows that `done` handles different scenarios by signaling success, failure, or errors in the authentication flow.
 */

//******************************************************** 

/** What is LocalStrategy?
 * 
 * `LocalStrategy` is a part of the **Passport.js** library that is used for handling authentication in Node.js applications. It allows you to authenticate users based on a locally defined method, such as verifying a username and password against a database. Unlike other strategies (e.g., OAuth, OpenID), it doesn't involve external services like Google or Facebook but instead relies on credentials stored in your own application.

### Key Components of `LocalStrategy`:
- **`usernameField` and `passwordField`**: 
  - These define which fields in the request (like `email` and `password`) should be used for authentication.
  - By default, they are set to `"username"` and `"password"`, but you can customize them to use fields like `email`.

- **`passReqToCallback`**:
  - When set to `true`, it passes the entire `req` (request) object to the callback function. This is useful if you need access to other fields, like `name` or `password2`, in the request body during signup.

- **Callback Function**:
  - The function that contains the logic for authenticating the user. This is where you validate the credentials (e.g., check the password, find the user in the database, etc.).
  - The callback takes the following arguments:
    1. `req` (if `passReqToCallback` is true) – the request object.
    2. `email` – the email/username field from the form.
    3. `password` – the password field from the form.
    4. `done` – a callback function that indicates whether the authentication was successful or not.

### How `LocalStrategy` Works:
1. **User provides credentials** (email and password) through a form.
2. **Passport's `LocalStrategy`** receives the credentials and the logic in the callback verifies them (e.g., checking if the user exists and if the password is correct).
3. If credentials are valid, **`done(null, user)`** is called to signal successful authentication.
4. If credentials are invalid, **`done(null, false, { message: 'error message' })`** is called to signal a failure.
5. If there's an internal error, **`done(error)`** is called to propagate the error. 

This strategy is mainly used for basic form-based authentication in web applications.
 */

//******************************************************** 

/** 
 * passport.use(
  "local.signup",
  new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },
    async (req, email, password, done) => {
      try {
        const user = await User.findOne({ email: email });
        if (user) {
          return done(null, false, { message: "Email already exists" });
          //error, object  as bool, custom error message
        }
        if (password != req.body.password2) {
          return done(null, false, { message: "Passwords must match" });
        }

        const newUser = await new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.username = req.body.name;

        await newUser.save();
        return done(null, newUser);
        //error, object
      }
      catch (error) {
        console.log(error);
        return done(error);
      }
    }
  )
);

In this method, when user sign up, we check if user already exist. If user already exist we return from the method. But if user does not exist that means user is unique, then why are we checking password?

Answer:

Great question! You're correct in observing that checking the password is not related to the user's uniqueness in the database. However, the reason for checking the password in this case is to ensure that the user entered a valid and consistent password during the signup process.

The specific check:

```javascript
if (password != req.body.password2) {
  return done(null, false, { message: "Passwords must match" });
}
```

is verifying that the user typed the same password twice (for example, in a "password" and "confirm password" field). This is a common practice during signup to avoid users accidentally entering a wrong password due to a typo. 

So, even though the uniqueness of the email is checked to ensure the user doesn't already exist, the password check ensures that the user provides consistent input before creating a new account. It enhances the user experience and reduces potential frustration caused by typos in the password.
 */