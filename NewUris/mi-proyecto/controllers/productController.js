const Product = require('../models/product');
const Category = require('../models/category');

exports.getAllProducts = async (req, res) => {
    const products = await Product.find().populate('categoryId');
    res.json(products);
};

exports.getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id).populate('categoryId');
    if (!product) return res.status(404).send('Producto no encontrado');
    res.json(product);
};

exports.createProduct = async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
};

exports.updateProduct = async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).send('Producto no encontrado');
    res.json(product);
};

exports.deleteProduct = async (req, res) => {
    const product = await Product.findByIdAndRemove(req.params.id);
    if (!product) return res.status(404).send('Producto no encontrado');
    res.status(204).send();
};

exports.updateProductStock = async (req, res) => {
    const { stock } = req.body;
    if (stock < 0) return res.status(400).send('El inventario no puede ser negativo');
    const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
    if (!product) return res.status(404).send('Producto no encontrado');
    res.json(product);
};

exports.getLowStockProducts = async (req, res) => {
    const { threshold = 10 } = req.query;
    const products = await Product.find({ stock: { $lte: threshold } }).populate('categoryId');
    res.json(products);
};

exports.applyBulkPriceUpdate = async (req, res) => {
    const { categoryId, percentage } = req.body;
    if (percentage <= 0) return res.status(400).send('El porcentaje debe ser positivo');
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).send('Categoría no encontrada');
    const products = await Product.updateMany(
        { categoryId },
        { $mul: { price: 1 + percentage / 100 } }
    );
    res.json({ modifiedCount: products.modifiedCount });
};

exports.archiveProduct = async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true });
    if (!product) return res.status(404).send('Producto no encontrado');
    res.json(product);
};
