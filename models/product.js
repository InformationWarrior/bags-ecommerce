const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  manufacturer: {
    type: String,
  },
  available: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);

//*****************************************************

/** 
category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

- **`type: mongoose.Schema.Types.ObjectId`**: Specifies that the `category` field will store an ObjectId, referring to a document in another collection.
- **`ref: "Category"`**: Indicates that this field is a reference to the `Category` model, enabling population.

### Example of Population:
```javascript
Product.find().populate('category').exec((err, products) => {
  console.log(products);
});
```

This will replace the ObjectId with the actual `Category` document.

### Usage Scenario:
- **Category Schema**:
  ```javascript
  const categorySchema = new mongoose.Schema({ title: String });
  const Category = mongoose.model("Category", categorySchema);
  ```
  
- **Product Schema**:
  ```javascript
  const productSchema = new mongoose.Schema({
    title: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  });
  const Product = mongoose.model("Product", productSchema);
  ```

By using `.populate()`, you can fetch the related category document based on the ObjectId.
  */
