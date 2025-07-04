const Catalog = require('../models/catalog');
const Product = require('../models/product');

exports.getAllCatalogs = async (req, res) => {
    const catalogs = await Catalog.find();
    res.json(catalogs);
};

exports.getCatalogById = async (req, res) => {
    const catalog = await Catalog.findById(req.params.id);
    if (!catalog) return res.status(404).send('Catálogo no encontrado');
    res.json(catalog);
};

exports.createCatalog = async (req, res) => {
    const catalog = new Catalog(req.body);
    await catalog.save();
    res.status(201).json(catalog);
};

exports.updateCatalog = async (req, res) => {
    const catalog = await Catalog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!catalog) return res.status(404).send('Catálogo no encontrado');
    res.json(catalog);
};

exports.deleteCatalog = async (req, res) => {
    const catalog = await Catalog.findByIdAndRemove(req.params.id);
    if (!catalog) return res.status(404).send('Catálogo no encontrado');
    res.status(204).send();
};

exports.assignProductToCatalog = async (req, res) => {
    const { productId } = req.body;
    const catalog = await Catalog.findById(req.params.id);
    if (!catalog) return res.status(404).send('Catálogo no encontrado');
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send('Producto no encontrado');
    if (!catalog.products.includes(productId)) {
        catalog.products.push(productId);
        await catalog.save();
    }
    res.json(catalog);
};

exports.removeProductFromCatalog = async (req, res) => {
    const { productId } = req.body;
    const catalog = await Catalog.findById(req.params.id);
    if (!catalog) return res.status(404).send('Catálogo no encontrado');
    catalog.products = catalog.products.filter(id => id.toString() !== productId);
    await catalog.save();
    res.json(catalog);
};

exports.getCatalogProducts = async (req, res) => {
    const catalog = await Catalog.findById(req.params.id).populate('products');
    if (!catalog) return res.status(404).send('Catálogo no encontrado');
    res.json(catalog.products);
};

exports.updateCatalogStatus = async (req, res) => {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) return res.status(400).send('Estado inválido');
    const catalog = await Catalog.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!catalog) return res.status(404).send('Catálogo no encontrado');
    res.json(catalog);
};

exports.duplicateCatalog = async (req, res) => {
    const catalog = await Catalog.findById(req.params.id);
    if (!catalog) return res.status(404).send('Catálogo no encontrado');
    const newCatalog = new Catalog({ ...catalog.toObject(), _id: undefined, name: `${catalog.name} (Copy)` });
    await newCatalog.save();
    res.status(201).json(newCatalog);
};
