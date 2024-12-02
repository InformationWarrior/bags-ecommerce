const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const CategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      slug: "title",
    },
  });

// CategorySchema.methods.toJSON(function () {
//   const { __v, _id, ...object } = this.toObject();
//   object.id = _id;
//   return object;
// })

module.exports = mongoose.model("categories", CategorySchema);

//********************************************************************** */

/** Q1. What is slug?
 A **slug** is a URL-friendly version of a string, typically used to create clean, readable URLs. It is often generated from titles or names by converting them into lowercase and replacing spaces or special characters with hyphens (`-`). For example, a blog post title like `"How to Cook a Perfect Pizza!"` could have a slug `"how-to-cook-a-perfect-pizza"`.

In MongoDB with Mongoose, the `mongoose-slug-updater` package is a plugin that helps generate slugs automatically from a specified field (like a title). This is particularly useful for creating human-readable and SEO-friendly URLs in applications like blogs, ecommerce sites, or CMS platforms.

Here's a simple example of how slugs work:

```javascript
const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, slug: "title" }, // Generates a slug from the title
});

const Blog = mongoose.model("Blog", blogSchema);

// When a new blog is created with the title "How to Cook a Perfect Pizza!"
// the slug will automatically be set to "how-to-cook-a-perfect-pizza"
```

This helps ensure the URLs are more user-friendly and easier to remember or share.
 */

//********************************************************************** */

/**
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const CategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      slug: "title",
    },
  });

  This snippet is defining a schema for a `Category` model using Mongoose, with automatic slug generation for each category title.

1. **`mongoose-slug-updater`**:
   - This is a Mongoose plugin that generates URL-friendly "slugs" for specific fields in the schema, typically used in place of more complex identifiers like MongoDB’s `_id`. A slug is a human-readable, SEO-friendly string created from the `title` field, usually in lowercase and with spaces replaced by hyphens.

2. **`mongoose.plugin(slug)`**:
   - This applies the `mongoose-slug-updater` plugin globally to Mongoose, enabling slug generation for any schema where the slug field is defined.

3. **`CategorySchema`**:
   - This is the schema for the `Category` model, which will represent documents in the `categories` collection.

   - **Fields**:
     - **`title`**: 
       - This field is required and must be a string. It represents the name of the category.
     - **`slug`**: 
       - This field is automatically generated using the `mongoose-slug-updater` plugin. It creates a unique slug based on the `title` field. For example, if a category's title is "Best Bags", the slug will be "best-bags".
       - The `unique: true` constraint ensures that no two categories can have the same slug, which is important for unique URLs.

### Example:

- **Input**: 
  - Category Title: `"Best Bags"`
  
- **Output**:
  - Slug: `"best-bags"`

### Purpose of the Slug:
- Slugs are often used in URLs instead of IDs or titles, making the URLs more readable and SEO-friendly.
- Example URL: `www.yoursite.com/categories/best-bags` instead of `www.yoursite.com/categories/123456789`.

This setup simplifies creating clean and unique URLs for each category based on their titles.
 */