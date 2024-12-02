const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
});

// encrypt the password before storing
UserSchema.methods.encryptPassword = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

UserSchema.methods.validPassword = function (candidatePassword) {
  if (this.password != null) {
    return bcrypt.compareSync(candidatePassword, this.password);
  } 
  else return false;
};

module.exports = new mongoose.model("users", UserSchema);


//********************************************************* */

/**  Q1
### Explanation:

1. **Mongoose Schema**:
   - A schema defines the structure of the document in MongoDB. Here, the `UserSchema` represents users, with fields for `username`, `email`, and `password`.
   
2. **Fields**:
   - **`username`**: A required string field to store the user's chosen name.
   - **`email`**: A required string field for the user's email.
   - **`password`**: A required string field where the user's hashed password will be stored.

3. **Methods**:
   Mongoose allows you to define instance methods on schemas. In this case, two methods are defined:

   - **`encryptPassword`**:
     - This method takes a plain text password as an argument and returns an encrypted version of the password using `bcrypt.hashSync`. It generates a salt with a factor of `5` for added security.
     - This is usually called when creating or updating a user's password before saving it to the database.
   
   - **`validPassword`**:
     - This method is used to compare a candidate password (input during login) with the hashed password stored in the database.
     - It uses `bcrypt.compareSync` to check if the provided password matches the stored hash. If the password matches, it returns `true`, otherwise `false`.
     - It also checks if `this.password` exists to avoid any issues with null passwords.

4. **Password Encryption**:
   - **`bcrypt-nodejs`** is used to securely hash passwords. It uses the following steps:
     - **Salt Generation**: A random salt is generated (with `bcrypt.genSaltSync(5)`) to make the hash more secure.
     - **Hashing**: The password is hashed with this salt.
     - **Comparison**: During login, the hashed password is compared with the stored hash using `bcrypt.compareSync`.

### Example Use Case:

1. **Sign-Up**:
   - When a new user signs up, their password is passed through the `encryptPassword` method before saving. This ensures that only the hashed version of the password is stored in the database.

2. **Login**:
   - During login, the `validPassword` method is used to compare the entered password with the stored hashed password. If they match, the user is authenticated.

### Example:

```javascript
const user = new User({
  username: "johndoe",
  email: "johndoe@example.com",
  password: user.encryptPassword("secret123")
});

// Save user to the database
user.save();
```

In this way, passwords are never stored as plain text, ensuring better security.
 */

//********************************************************* */


/** Q2
 UserSchema.methods.encryptPassword = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

This method is used to **encrypt (hash)** a password before storing it in the database. Here's a breakdown of the code:

### Explanation:

1. **`bcrypt.hashSync()`**:
   - This function is from the `bcrypt-nodejs` library and is used to **hash a password** in a synchronous manner. It takes three parameters:
     - **The plain password**: The password that you want to encrypt.
     - **Salt**: A randomly generated string used to make the hash more secure. It is generated using `bcrypt.genSaltSync(5)`.
     - **Callback (optional)**: Since this is a synchronous function, `null` is passed as the callback.

2. **`bcrypt.genSaltSync(5)`**:
   - This generates a **salt**, which is a random string that is combined with the plain password to add an extra layer of security to the hashing process. The `5` is the **salt rounds**, which defines how complex the salt generation will be. A higher value makes the hash more secure but slower to generate.

3. **`return`**:
   - The function returns the **hashed version** of the password. This hashed password can then be stored in the database instead of the plain password.

### Example Flow:

1. A plain password is passed to the `encryptPassword` method (e.g., `"mySecretPassword"`).
2. A salt is generated using `bcrypt.genSaltSync(5)`.
3. The password is hashed with the generated salt using `bcrypt.hashSync()`.
4. The hashed password is returned, which you can then store securely in the database.

### Why Use This Method?

- **Security**: Storing plain text passwords is dangerous. If your database is ever compromised, hackers will have access to all user passwords.
- **Salting**: Adding a salt ensures that even if two users have the same password, their hashes will be different.
- **Hashing**: The hashing process is irreversible, meaning you cannot directly retrieve the original password from the hash, making it much safer.

### Example Usage:
```javascript
const hashedPassword = user.encryptPassword("mySecretPassword");
console.log(hashedPassword); // Outputs the hashed password
```

The hashed password can now be safely stored in the database.
 */

//********************************************************* */


/** Q3
UserSchema.methods.validPassword = function (candidatePassword) {
  if (this.password != null) {
    return bcrypt.compareSync(candidatePassword, this.password);
  } 
  else return false;
};

This method, `validPassword`, is used to **validate a user's password** by comparing a **plain text password** (entered by the user, `candidatePassword`) with the **hashed password** stored in the database (`this.password`). 

Here's a breakdown of how it works:

### Explanation:

1. **Check if password is not `null`**:
   - `if (this.password != null)`: 
     - This ensures that the stored password is not `null`. If for some reason the password is missing or hasn't been set, the method will return `false` and avoid an error.

2. **`bcrypt.compareSync(candidatePassword, this.password)`**:
   - This uses `bcrypt.compareSync` to compare the plain text password (`candidatePassword`) with the hashed password (`this.password`).
   - **How it works**:
     - `bcrypt.compareSync` takes two parameters: 
       1. **Plain text password** (`candidatePassword`)
       2. **Hashed password** (`this.password`)
     - It hashes the plain text password using the same salt that was used to hash the stored password, and then it compares the two hashes.
     - If they match, the function returns `true`, meaning the password is correct.
     - If they don't match, the function returns `false`.

3. **Return `false` if the password is `null`**:
   - If `this.password` is `null`, the method immediately returns `false`. This is a safeguard to ensure that the comparison isn't attempted when no password exists.

### Usage Example:

1. **During Login**:
   - When a user attempts to log in, they provide a password. The system retrieves the hashed password from the database and compares it with the entered password using this `validPassword` method.

   ```javascript
   const user = await User.findOne({ email: req.body.email });
   if (user && user.validPassword(req.body.password)) {
     // Password is correct, authenticate user
   } else {
     // Invalid password, reject login
   }
   ```

### Example Flow:

1. User enters password `"mySecretPassword"`.
2. The method `validPassword` is called with `"mySecretPassword"` as `candidatePassword`.
3. The method compares the hash of `"mySecretPassword"` with the stored hash.
4. If the hashes match, the method returns `true`; otherwise, it returns `false`.

### Why use this method:
- It ensures that user passwords are validated securely, without ever needing to store or compare plain text passwords. The hashing and comparison are done internally using the same salt and hash algorithm.
 */

//********************************************************* */

/* Q4. What if two users have same password, then how it differentiates?

Even if two users have the same password, `bcrypt` will still generate **different hashes** for each password due to the use of a **salt**.

### Here's how it works:

1. **Salting**:
   - When a password is hashed using `bcrypt`, a unique salt (random string) is generated for each password. This salt is combined with the password before hashing.
   - Even if two users have the same password, the salt will be different, leading to different hashes.

2. **Example**:
   - Let's say two users both have the password `"mySecretPassword"`.
   - For **User 1**, `bcrypt` might generate a salt like `"salt123"` and hash the password, resulting in:
     ```
     $2a$10$u4H3b9sp2g.K1d9E0zA5sOj5wDOo8YaEzCQx/oZbwnN1Ao1F5Gp.e
     ```
   - For **User 2**, `bcrypt` might generate a different salt like `"salt456"` and hash the same password, resulting in:
     ```
     $2a$10$7R29b3Gd2j54oX8y.O7pld1vKmgHtCmE30yA5R9FMe4oA/ZmkDgrC
     ```

   Even though the passwords are identical, the resulting hashes are completely different because of the unique salt used in each case.

3. **Hash Comparison**:
   - When a user logs in, the `bcrypt.compareSync()` method takes the entered password, retrieves the salt stored in the hash, and re-hashes the entered password using that salt.
   - It then compares the newly hashed password with the stored hash. If they match, the password is considered valid.

4. **Why This Matters**:
   - **Security**: Even if someone steals the hashed passwords, they can't determine whether two users have the same password. The different hashes for the same password make it much harder for attackers to perform brute-force or rainbow table attacks.
   - **Uniqueness**: Each user has a unique hash in the database, even if their passwords are identical, thanks to the salt.

### Summary:
- Two users with the same password will have **different password hashes** because `bcrypt` generates a unique salt for each user.
- When verifying a password, `bcrypt` uses the stored salt to hash the entered password and compares it with the stored hash.
*/

//********************************************************* */

/* Q5. How server decides two users?

The server differentiates between users using **unique identifiers**, typically the **username** or **email** associated with each account. When users sign up or log in, the server identifies them based on this unique information.

Here’s how the process works:

### 1. **During Registration**:
   - Each user provides a **unique piece of information** when registering, usually an **email address** or **username**.
   - The server stores this information in a database along with other details (password, profile info, etc.).
   - The email or username must be **unique** in the database to ensure that no two users share the same identifier.

   Example database entry for a user:
   ```json
   {
     "_id": "601d1b8e1c9c9f12f423b456",
     "username": "john_doe",
     "email": "john@example.com",
     "password": "$2a$10$7R29b3Gd2j54oX8y.O7pld1vKmgHtCmE30yA5R9FMe4oA/ZmkDgrC"
   }
   ```

### 2. **During Login**:
   - When a user logs in, they provide their **email or username** and **password**.
   - The server queries the database for a user with the provided **email** or **username**.
   - Once the user is found, the server uses the hashed password stored in the database and compares it with the password the user provided by hashing it using `bcrypt`.

   Example of the server-side process:
   ```javascript
   const user = await User.findOne({ email: req.body.email });
   if (user && user.validPassword(req.body.password)) {
     // Successfully authenticated user
   } else {
     // Invalid email or password
   }
   ```

### 3. **Session Management**:
   - After a successful login, the server typically creates a **session** or issues a **token** (like a JSON Web Token or session ID). This token or session ID is unique to the logged-in user and is stored either on the client side (in cookies or local storage) or on the server.
   - For the duration of the session, the server identifies the user using this **session token** or **ID**.
   
   Example of session creation:
   ```javascript
   req.session.userId = user._id;
   ```

### 4. **Database and Unique Identifiers**:
   - In a database like MongoDB, each user has a unique **ObjectId** (the `_id` field) which is used internally to differentiate between users.
   - The email or username is also unique and ensures that no two users have the same identifier.

### Example Flow:
1. **User Registration**:
   - User provides email: `"john@example.com"` and password: `"mySecretPassword"`.
   - Server stores the email and the **hashed** password in the database.
   - The email is used to ensure uniqueness (e.g., no other user can register with `"john@example.com"`).

2. **User Login**:
   - User provides the email `"john@example.com"` and password `"mySecretPassword"`.
   - The server looks up the user by email, finds the associated hashed password, and compares the provided password with the stored hash.
   - If they match, the user is authenticated, and a session is created.

### Conclusion:
The server uses **unique identifiers** such as email or username to differentiate users. Even if users have the same password, the server can still identify them uniquely by querying based on email, username, or another identifier stored in the database.
 */