const Supplier = require('../models/supplier');
const Catalog = require('../models/catalog');
const Product = require('../models/product');

exports.getAllSuppliers = async (req, res) => {
    const suppliers = await Supplier.find().populate('catalogId');
    res.json(suppliers);
};

exports.getSupplierById = async (req, res) => {
    const supplier = await Supplier.findById(req.params.id).populate('catalogId');
    if (!supplier) return res.status(404).send('Proveedor no encontrado');
    res.json(supplier);
};

exports.createSupplier = async (req, res) => {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
};

exports.updateSupplier = async (req, res) => {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).send('Proveedor no encontrado');
    res.json(supplier);
};

exports.deleteSupplier = async (req, res) => {
    const supplier = await Supplier.findByIdAndRemove(req.params.id);
    if (!supplier) return res.status(404).send('Proveedor no encontrado');
    res.status(204).send();
};

exports.assignCatalogToSupplier = async (req, res) => {
    const { catalogId } = req.body;
    const catalog = await Catalog.findById(catalogId);
    if (!catalog) return res.status(404).send('Catálogo no encontrado');
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).send('Proveedor no encontrado');
    supplier.catalogId = catalogId;
    await supplier.save();
    res.json(supplier);
};

exports.getSupplierProductCount = async (req, res) => {
    const supplier = await Supplier.findById(req.params.id).populate('catalogId');
    if (!supplier) return res.status(404).send('Proveedor no encontrado');
    const productCount = supplier.catalogId ? await Product.countDocuments({ _id: { $in: supplier.catalogId.products } }) : 0;
    res.json({ supplierId: supplier._id, productCount });
};

exports.updateSupplierStatus = async (req, res) => {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) return res.status(400).send('Estado inválido');
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!supplier) return res.status(404).send('Proveedor no encontrado');
    res.json(supplier);
};

exports.getSupplierSummary = async (req, res) => {
    const suppliers = await Supplier.find().populate('catalogId');
    const summary = await Promise.all(suppliers.map(async (supplier) => {
        const productCount = supplier.catalogId ? await Product.countDocuments({ _id: { $in: supplier.catalogId.products } }) : 0;
        return { supplierId: supplier._id, name: supplier.name, productCount };
    }));
    res.json(summary);
};
