const AdminBro = require("admin-bro");
const AdminBroExpress = require("admin-bro-expressjs");
const AdminBroMongoose = require("admin-bro-mongoose");
const mongoose = require("mongoose");

const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const Category = require("../models/category");

AdminBro.registerAdapter(AdminBroMongoose);

const adminBro = new AdminBro({
  databases: [mongoose],
  rootPath: "/admin",
  branding: {
    companyName: "BestBags",
    logo: "/images/shop-icon.png",
    softwareBrothers: false,
  },
  resources: [
    {
      resource: Product,
      options: {
        parent: {
          name: "Admin Content",
          icon: "InventoryManagement",
        },
        properties: {
          description: {
            type: "richtext",
            isVisible: { list: false, filter: true, show: true, edit: true },
          },
          _id: {
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
          title: {
            isTitle: true,
          },
          price: {
            type: "number",
          },
          imagePath: {
            isVisible: { list: false, filter: false, show: true, edit: true },
            components: {
              show: AdminBro.bundle(
                "../components/admin-imgPath-component.jsx"
              ),
            },
          },
        },
      },
    },
    {
      resource: User,
      options: {
        parent: {
          name: "User Content",
          icon: "User",
        },
        properties: {
          _id: {
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
          username: {
            isTitle: true,
          },
        },
      },
    },
    {
      resource: Order,
      options: {
        parent: {
          name: "User Content",
          icon: "User",
        },
        properties: {
          user: {
            isTitle: true,
          },
          _id: {
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
          paymentId: {
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
          address: {
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
          createdAt: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
          cart: {
            isVisible: { list: false, filter: false, show: true, edit: false },
            components: {
              show: AdminBro.bundle("../components/admin-order-component.jsx"),
            },
          },
          "cart.items": {
            isVisible: {
              list: false,
              filter: false,
              show: false,
              edit: false,
            },
          },
          "cart.totalQty": {
            isVisible: {
              list: false,
              filter: false,
              show: false,
              edit: false,
            },
          },
          "cart.totalCost": {
            isVisible: {
              list: false,
              filter: false,
              show: false,
              edit: false,
            },
          },
        },
      },
    },
    {
      resource: Category,
      options: {
        parent: {
          name: "Admin Content",
          icon: "User",
        },
        properties: {
          _id: {
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
          slug: {
            isVisible: { list: false, filter: false, show: false, edit: false },
          },
          title: {
            isTitle: true,
          },
        },
      },
    },
  ],
  locale: {
    translations: {
      labels: {
        loginWelcome: "Admin Panel Login",
      },
      messages: {
        loginWelcome:
          "Please enter your credentials to log in and manage your website contents",
      },
    },
  },
  dashboard: {
    component: AdminBro.bundle("../components/admin-dashboard-component.jsx"),
  },
});

const ADMIN = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
};

const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    if (ADMIN.password === password && ADMIN.email === email) {
      return ADMIN;
    }
    return null;
  },
  cookieName: process.env.ADMIN_COOKIE_NAME,
  cookiePassword: process.env.ADMIN_COOKIE_PASSWORD,
});

module.exports = router;

//****************************************************************

/** This code sets up an admin panel for the **BestBags** project using the AdminBro (now AdminJS) library, which is integrated with MongoDB and Mongoose for database management.

### Key Components:

1. **AdminBro Setup**:
   - `AdminBro.registerAdapter(AdminBroMongoose)` integrates AdminBro with Mongoose, allowing you to manage MongoDB collections via the admin interface.
   - `AdminBro` is configured with custom branding (logo and company name), and resources (`Product`, `User`, `Order`, and `Category`) are defined to be managed through the admin panel.

2. **Resources**:
   - For each resource (e.g., `Product`, `User`, `Order`, `Category`), specific fields (`properties`) are configured to be visible or hidden in different views (list, show, edit).
   - Components such as rich text for descriptions and custom components for image paths and orders are integrated.

3. **Authentication**:
   - Admin panel access is restricted via authentication using credentials stored in environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).
   - The router uses cookies (`cookieName` and `cookiePassword`) for session management.

4. **Custom Dashboard**:
   - The dashboard of the admin panel uses a custom React component located in `../components/admin-dashboard-component.jsx`.

### Usage:
- This setup provides an intuitive admin interface for managing the eCommerce store's data (products, users, orders, categories).
- To secure the panel, you need to define the admin's email and password in your `.env` file:

```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=yourpassword
ADMIN_COOKIE_NAME=admin-session
ADMIN_COOKIE_PASSWORD=secure-cookie-password
```

### Next Steps:
- Ensure your models (`Product`, `User`, `Order`, `Category`) are properly defined in Mongoose.
- Customize the AdminBro resources and components as needed to fit your project's specific needs.*/

//****************************************************************

/** 
const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    if (ADMIN.password === password && ADMIN.email === email) {
      return ADMIN;
    }
    return null;
  },
  cookieName: process.env.ADMIN_COOKIE_NAME,
  cookiePassword: process.env.ADMIN_COOKIE_PASSWORD,
});
```

### Breakdown of the Code:

1. **`buildAuthenticatedRouter(adminBro, { ... })`**:
   - This method from `AdminBroExpress` creates an authenticated router to protect access to the Admin panel.
   - It ensures only authenticated users can access the `/admin` path.

2. **`authenticate: async (email, password) => { ... }`**:
   - **Purpose**: This is the authentication function that checks the email and password provided during login.
   - **Logic**: 
     - It compares the `email` and `password` entered by the user against the admin credentials stored in the `ADMIN` object (coming from environment variables).
     - If the credentials match, the `ADMIN` object is returned, granting access.
     - If they don't match, it returns `null`, denying access.

3. **`cookieName` and `cookiePassword`**:
   - These values are read from environment variables (`process.env.ADMIN_COOKIE_NAME` and `process.env.ADMIN_COOKIE_PASSWORD`).
   - **cookieName**: This is the name of the cookie that will store the session information.
   - **cookiePassword**: This is the password used to sign and secure the cookie.

### Environment Variables:

- **`process.env.ADMIN_EMAIL` and `process.env.ADMIN_PASSWORD`**: These environment variables store the admin's email and password for authentication.
- **`process.env.ADMIN_COOKIE_NAME` and `process.env.ADMIN_COOKIE_PASSWORD`**: These environment variables are used to handle session cookies.

### Why This is Important:
- **Authentication**: This setup ensures that only users with valid credentials can access the Admin panel.
- **Security**: Cookies are used to maintain a session after the admin logs in, secured by `cookiePassword`.

### Example for `.env` file:

```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=supersecurepassword
ADMIN_COOKIE_NAME=admin-session
ADMIN_COOKIE_PASSWORD=strongcookiepassword
```

This would be your environment setup for secure login management in the Admin panel.*/

//****************************************************************

/**
The code you shared is part of the setup for integrating **AdminBro** (now **AdminJS**) with a Mongoose-based application for managing the backend data of your **BestBags** project.

### Key Components Breakdown:

1. **`AdminBro.registerAdapter(AdminBroMongoose)`**:
   - This links **AdminBro** with **Mongoose**, allowing AdminBro to manage the data stored in MongoDB via Mongoose schemas.

2. **`const adminBro = new AdminBro({...})`**:
   - **`databases: [mongoose]`**: This tells AdminBro to manage the MongoDB database through Mongoose.
   - **`rootPath: "/admin"`**: This defines where the admin panel will be accessible in the URL (`/admin` in this case).
   - **Branding**: Allows you to customize the admin panel interface with company branding (e.g., `companyName: "BestBags"`, `logo`).

3. **Resources**:
   - AdminBro lets you define which collections (models) from MongoDB will be manageable through the admin panel, e.g., `Product`, `User`, `Order`, `Category`.
   - Each resource has specific properties that are configured for visibility and accessibility, such as `description`, `_id`, `title`, etc.
     - **`isVisible`**: Controls whether a field is visible in the list, filter, show, or edit views.
     - **`isTitle`**: Marks a field as the title to be displayed in the admin panel list.
     - **Custom Components**: You can link to custom React components, such as `admin-imgPath-component.jsx` for displaying images and `admin-order-component.jsx` for cart details.

4. **Locale Configuration**:
   - You can customize the text for different labels and messages (e.g., the login screen's welcome message and instructions) to create a more tailored experience for your admin users.

5. **Dashboard**:
   - A custom React component (`admin-dashboard-component.jsx`) is used to create a personalized admin dashboard.

6. **Admin Credentials**:
   - Admin login details (`ADMIN.email` and `ADMIN.password`) are fetched from environment variables (`process.env.ADMIN_EMAIL`, `process.env.ADMIN_PASSWORD`) to secure access to the admin panel.

### Next Steps for Setup:

- Make sure the **environment variables** for `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_COOKIE_NAME`, and `ADMIN_COOKIE_PASSWORD` are set in your `.env` file to secure access to the admin panel.
  
### Example of `.env` file:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=supersecretpassword
ADMIN_COOKIE_NAME=admin-session
ADMIN_COOKIE_PASSWORD=securecookiepassword
```

### Admin Panel Access:
- Once this is set up, you can access the admin panel by visiting the `/admin` path of your application and logging in with the email and password you’ve configured in the environment variables.
*/ 