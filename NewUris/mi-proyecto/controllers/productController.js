const mongoose = require('mongoose');
const Product = require('../models/product');
const Category = require('../models/category');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('categoryId');
        res.json(products);
    } catch (err) {
        res.status(500).send('Error al obtener productos');
    }
};

exports.getProductById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }
        const product = await Product.findById(req.params.id).populate('categoryId');
        if (!product) return res.status(404).send('Producto no encontrado');
        res.json(product);
    } catch (err) {
        res.status(500).send('Error al obtener producto');
    }
};

exports.createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(500).send('Error al crear producto');
    }
};

exports.updateProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).send('Producto no encontrado');
        res.json(product);
    } catch (err) {
        res.status(500).send('Error al actualizar producto');
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).send('Producto no encontrado');
        res.status(204).send();
    } catch (err) {
        res.status(500).send('Error al eliminar producto');
    }
};

exports.updateProductStock = async (req, res) => {
    try {
        const { stock } = req.body;
        if (stock < 0) return res.status(400).send('El inventario no puede ser negativo');

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
        if (!product) return res.status(404).send('Producto no encontrado');
        res.json(product);
    } catch (err) {
        res.status(500).send('Error al actualizar stock del producto');
    }
};

exports.getLowStockProducts = async (req, res) => {
    try {
        const { threshold = 10 } = req.query;
        const products = await Product.find({ stock: { $lte: threshold } }).populate('categoryId');
        res.json(products);
    } catch (err) {
        res.status(500).send('Error al obtener productos con bajo inventario');
    }
};

exports.applyBulkPriceUpdate = async (req, res) => {
    try {
        const { categoryId, percentage } = req.body;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).send('ID de categoría inválido');
        }

        if (percentage <= 0) return res.status(400).send('El porcentaje debe ser positivo');

        const category = await Category.findById(categoryId);
        if (!category) return res.status(404).send('Categoría no encontrada');

        const result = await Product.updateMany(
            { categoryId },
            { $mul: { price: 1 + percentage / 100 } }
        );

        res.json({ modifiedCount: result.modifiedCount });
    } catch (err) {
        res.status(500).send('Error al actualizar precios en lote');
    }
};

exports.archiveProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const product = await Product.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true });
        if (!product) return res.status(404).send('Producto no encontrado');
        res.json(product);
    } catch (err) {
        res.status(500).send('Error al archivar producto');
    }
};
