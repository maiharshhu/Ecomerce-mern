import Product from "../models/Product.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// create new product
export const createProduct = async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        return res.status(201).json({
            message: "Product added successfully",
            product: newProduct,
        });
    } catch (error) {
        console.error("createProduct error:", error);
        return res.status(500).json({ message: 'Server Error' });
    }
}

//get all the products 
export const getProducts = async (req, res) => {
    try {
        console.log("\n========== getProducts CALLED ==========");
        console.log("req.query:", req.query);

        const { search, category } = req.query;
        console.log("search value:", search, "type:", typeof search);
        console.log("category value:", category, "type:", typeof category);

        const conditions = [];

        if (search?.trim()) {
            const trimmedSearch = search.trim();
            console.log("Building search filter for:", trimmedSearch);
            const searchRegex = new RegExp(escapeRegex(trimmedSearch), "i");
            console.log("Search regex pattern:", searchRegex);
            conditions.push({ title: searchRegex });
            console.log("Pushed search condition. Conditions now:", JSON.stringify(conditions));
        } else {
            console.log("No search filter - search is empty/falsy");
        }

        if (category?.trim()) {
            const trimmedCategory = category.trim();
            console.log("Building category filter for:", trimmedCategory);
            const categoryRegex = new RegExp(escapeRegex(trimmedCategory), "i");
            console.log("Category regex pattern:", categoryRegex);
            conditions.push({ category: categoryRegex });
            console.log("Pushed category condition. Conditions now:", JSON.stringify(conditions));
        } else {
            console.log("No category filter - category is empty/falsy");
        }

        const filter = conditions.length ? { $and: conditions } : {};
        console.log("Final filter object:", JSON.stringify(filter));
        console.log("Filter conditions length:", conditions.length);

        const allProducts = await Product.find({}).sort({ createdAt: -1 });
        console.log("Total products in DB (no filter):", allProducts.length);

        const products = await Product.find(filter).sort({ createdAt: -1 });
        console.log("Products after filter:", products.length);

        if (products.length > 0) {
            console.log("First product:", products[0]);
        }

        console.log("========== getProducts COMPLETE ==========\n");
        return res.json(products);
    } catch (error) {
        console.error("getProducts error:", error);
        return res.status(500).json({ message: 'Server Error' });
    }
}

// get a single product by id
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.json(product);
    } catch (error) {
        console.error("getProductById error:", error);
        return res.status(400).json({ message: 'Invalid product id' });
    }
}

// update a product
export const updateProduct = async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        return res.json({
            message: "Product updated successfully",
            updated,
        });
    } catch (error) {
        console.error("updateProduct error:", error);
        return res.status(500).json({ message: "Server Error" });
    }
}

// Delete a product
export const deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        return res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("deleteProduct error:", error);
        return res.status(500).json({ message: "Server Error" });
    }
}
