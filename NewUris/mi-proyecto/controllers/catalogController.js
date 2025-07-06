const mongoose = require('mongoose');
const Catalog = require('../models/catalog');
const Product = require('../models/product');

exports.getAllCatalogs = async (req, res) => {
    try {
        const catalogs = await Catalog.find();
        res.json(catalogs);
    } catch (err) {
        res.status(500).send('Error al obtener los catálogos');
    }
};

exports.getCatalogById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }
        const catalog = await Catalog.findById(req.params.id);
        if (!catalog) return res.status(404).send('Catálogo no encontrado');
        res.json(catalog);
    } catch (err) {
        res.status(500).send('Error al obtener el catálogo');
    }
};

exports.createCatalog = async (req, res) => {
    try {
        const catalog = new Catalog(req.body);
        await catalog.save();
        res.status(201).json(catalog);
    } catch (err) {
        res.status(500).send('Error al crear el catálogo');
    }
};

exports.updateCatalog = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }
        const catalog = await Catalog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!catalog) return res.status(404).send('Catálogo no encontrado');
        res.json(catalog);
    } catch (err) {
        res.status(500).send('Error al actualizar el catálogo');
    }
};

exports.deleteCatalog = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }
        const catalog = await Catalog.findByIdAndDelete(req.params.id);
        if (!catalog) return res.status(404).send('Catálogo no encontrado');
        res.status(204).send();
    } catch (err) {
        res.status(500).send('Error al eliminar el catálogo');
    }
};

exports.assignProductToCatalog = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send('ID inválido');
        }

        const catalog = await Catalog.findById(req.params.id);
        if (!catalog) return res.status(404).send('Catálogo no encontrado');

        const product = await Product.findById(productId);
        if (!product) return res.status(404).send('Producto no encontrado');

        if (!catalog.products.includes(productId)) {
            catalog.products.push(productId);
            await catalog.save();
        }

        res.json(catalog);
    } catch (err) {
        res.status(500).send('Error al asignar el producto al catálogo');
    }
};

exports.removeProductFromCatalog = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send('ID inválido');
        }

        const catalog = await Catalog.findById(req.params.id);
        if (!catalog) return res.status(404).send('Catálogo no encontrado');

        catalog.products = catalog.products.filter(id => id?.toString() !== productId);
        await catalog.save();

        res.json(catalog);
    } catch (err) {
        res.status(500).send('Error al quitar el producto del catálogo');
    }
};

exports.getCatalogProducts = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const catalog = await Catalog.findById(req.params.id).populate('products');
        if (!catalog) return res.status(404).send('Catálogo no encontrado');
        res.json(catalog.products);
    } catch (err) {
        res.status(500).send('Error al obtener los productos del catálogo');
    }
};

exports.updateCatalogStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).send('Estado inválido');
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const catalog = await Catalog.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!catalog) return res.status(404).send('Catálogo no encontrado');
        res.json(catalog);
    } catch (err) {
        res.status(500).send('Error al actualizar el estado del catálogo');
    }
};

exports.duplicateCatalog = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const catalog = await Catalog.findById(req.params.id);
        if (!catalog) return res.status(404).send('Catálogo no encontrado');

        const newCatalog = new Catalog({
            ...catalog.toObject(),
            _id: undefined,
            name: `${catalog.name} (Copy)`
        });

        await newCatalog.save();
        res.status(201).json(newCatalog);
    } catch (err) {
        res.status(500).send('Error al duplicar el catálogo');
    }
};
