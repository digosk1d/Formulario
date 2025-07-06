const mongoose = require('mongoose');
const Supplier = require('../models/supplier');
const Catalog = require('../models/catalog');
const Product = require('../models/product');

exports.getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find().populate('catalogId');
        res.json(suppliers);
    } catch (err) {
        res.status(500).send('Error al obtener proveedores');
    }
};

exports.getSupplierById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }
        const supplier = await Supplier.findById(req.params.id).populate('catalogId');
        if (!supplier) return res.status(404).send('Proveedor no encontrado');
        res.json(supplier);
    } catch (err) {
        res.status(500).send('Error al obtener proveedor');
    }
};

exports.createSupplier = async (req, res) => {
    try {
        const supplier = new Supplier(req.body);
        await supplier.save();
        res.status(201).json(supplier);
    } catch (err) {
        res.status(500).send('Error al crear proveedor');
    }
};

exports.updateSupplier = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }
        const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!supplier) return res.status(404).send('Proveedor no encontrado');
        res.json(supplier);
    } catch (err) {
        res.status(500).send('Error al actualizar proveedor');
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }
        const supplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!supplier) return res.status(404).send('Proveedor no encontrado');
        res.status(204).send();
    } catch (err) {
        res.status(500).send('Error al eliminar proveedor');
    }
};

exports.assignCatalogToSupplier = async (req, res) => {
    try {
        const { catalogId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(catalogId) || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const catalog = await Catalog.findById(catalogId);
        if (!catalog) return res.status(404).send('Catálogo no encontrado');

        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) return res.status(404).send('Proveedor no encontrado');

        supplier.catalogId = catalogId;
        await supplier.save();
        res.json(supplier);
    } catch (err) {
        res.status(500).send('Error al asignar catálogo al proveedor');
    }
};

exports.getSupplierProductCount = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const supplier = await Supplier.findById(req.params.id).populate('catalogId');
        if (!supplier) return res.status(404).send('Proveedor no encontrado');

        const productCount = supplier.catalogId
            ? await Product.countDocuments({ _id: { $in: supplier.catalogId.products } })
            : 0;

        res.json({ supplierId: supplier._id, productCount });
    } catch (err) {
        res.status(500).send('Error al contar productos del proveedor');
    }
};

exports.updateSupplierStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).send('Estado inválido');
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const supplier = await Supplier.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!supplier) return res.status(404).send('Proveedor no encontrado');

        res.json(supplier);
    } catch (err) {
        res.status(500).send('Error al actualizar estado del proveedor');
    }
};

exports.getSupplierSummary = async (req, res) => {
    try {
        const suppliers = await Supplier.find().populate('catalogId');
        const summary = await Promise.all(suppliers.map(async (supplier) => {
            const productCount = supplier.catalogId
                ? await Product.countDocuments({ _id: { $in: supplier.catalogId.products } })
                : 0;

            return {
                supplierId: supplier._id,
                name: supplier.name,
                productCount
            };
        }));
        res.json(summary);
    } catch (err) {
        res.status(500).send('Error al obtener resumen de proveedores');
    }
};
