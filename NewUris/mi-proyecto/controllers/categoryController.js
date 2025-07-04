const Category = require('../models/category');
const Product = require('../models/product');

exports.getAllCategories = async (req, res) => {
    const categories = await Category.find();
    res.json(categories);
};

exports.getCategoryById = async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).send('Categoría no encontrada');
    res.json(category);
};

exports.createCategory = async (req, res) => {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
};

exports.updateCategory = async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).send('Categoría no encontrada');
    res.json(category);
};

exports.deleteCategory = async (req, res) => {
    const category = await Category.findByIdAndRemove(req.params.id);
    if (!category) return res.status(404).send('Categoría no encontrada');
    res.status(204).send();
};

exports.assignProductToCategory = async (req, res) => {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send('Producto no encontrado');
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).send('Categoría no encontrada');
    product.categoryId = category._id;
    await product.save();
    res.json(product);
};

exports.getCategoryProductCount = async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).send('Categoría no encontrada');
    const count = await Product.countDocuments({ categoryId: req.params.id });
    res.json({ categoryId: req.params.id, productCount: count });
};

exports.archiveCategory = async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true });
    if (!category) return res.status(404).send('Categoría no encontrada');
    res.json(category);
};

exports.mergeCategories = async (req, res) => {
    const { sourceCategoryId, targetCategoryId } = req.body;
    const sourceCategory = await Category.findById(sourceCategoryId);
    const targetCategory = await Category.findById(targetCategoryId);
    if (!sourceCategory || !targetCategory) return res.status(404).send('Categoría no encontrada');
    await Product.updateMany({ categoryId: sourceCategoryId }, { categoryId: targetCategoryId });
    await sourceCategory.remove();
    res.json(targetCategory);
};

exports.getCategorySummary = async (req, res) => {
    const categories = await Category.find();
    const summary = await Promise.all(categories.map(async (category) => {
        const productCount = await Product.countDocuments({ categoryId: category._id });
        return { categoryId: category._id, name: category.name, productCount };
    }));
    res.json(summary);
};
