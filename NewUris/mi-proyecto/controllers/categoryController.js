const mongoose = require('mongoose');
const Category = require('../models/category');
const Product = require('../models/product');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).send('Error al obtener las categorías');
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).send('Categoría no encontrada');
        res.json(category);
    } catch (err) {
        res.status(500).send('Error al obtener la categoría');
    }
};

exports.createCategory = async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).send('Error al crear la categoría');
    }
};

exports.updateCategory = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).send('Categoría no encontrada');
        res.json(category);
    } catch (err) {
        res.status(500).send('Error al actualizar la categoría');
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).send('Categoría no encontrada');
        res.status(204).send();
    } catch (err) {
        res.status(500).send('Error al eliminar la categoría');
    }
};

exports.assignProductToCategory = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).send('Producto no encontrado');

        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).send('Categoría no encontrada');

        product.categoryId = category._id;
        await product.save();

        res.json(product);
    } catch (err) {
        res.status(500).send('Error al asignar producto a categoría');
    }
};

exports.getCategoryProductCount = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).send('Categoría no encontrada');

        const count = await Product.countDocuments({ categoryId: req.params.id });
        res.json({ categoryId: req.params.id, productCount: count });
    } catch (err) {
        res.status(500).send('Error al contar productos por categoría');
    }
};

exports.archiveCategory = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const category = await Category.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true });
        if (!category) return res.status(404).send('Categoría no encontrada');
        res.json(category);
    } catch (err) {
        res.status(500).send('Error al archivar la categoría');
    }
};

exports.mergeCategories = async (req, res) => {
    try {
        const { sourceCategoryId, targetCategoryId } = req.body;
        if (
            !mongoose.Types.ObjectId.isValid(sourceCategoryId) ||
            !mongoose.Types.ObjectId.isValid(targetCategoryId)
        ) {
            return res.status(400).send('ID inválido');
        }

        const sourceCategory = await Category.findById(sourceCategoryId);
        const targetCategory = await Category.findById(targetCategoryId);
        if (!sourceCategory || !targetCategory) {
            return res.status(404).send('Categoría no encontrada');
        }

        await Product.updateMany({ categoryId: sourceCategoryId }, { categoryId: targetCategoryId });
        await sourceCategory.deleteOne();

        res.json(targetCategory);
    } catch (err) {
        res.status(500).send('Error al fusionar las categorías');
    }
};

exports.getCategorySummary = async (req, res) => {
    try {
        const categories = await Category.find();
        const summary = await Promise.all(
            categories.map(async (category) => {
                const productCount = await Product.countDocuments({ categoryId: category._id });
                return {
                    categoryId: category._id,
                    name: category.name,
                    productCount
                };
            })
        );
        res.json(summary);
    } catch (err) {
        res.status(500).send('Error al obtener el resumen de categorías');
    }
};
