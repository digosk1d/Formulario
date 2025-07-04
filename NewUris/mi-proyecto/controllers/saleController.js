const Sale = require('../models/sale');
const Product = require('../models/product');
const Client = require('../models/client');

exports.getAllSales = async (req, res) => {
    const sales = await Sale.find().populate('clientId items.productId');
    res.json(sales);
};

exports.getSaleById = async (req, res) => {
    const sale = await Sale.findById(req.params.id).populate('clientId items.productId');
    if (!sale) return res.status(404).send('Venta no encontrada');
    res.json(sale);
};

exports.createSale = async (req, res) => {
    const sale = new Sale(req.body);
    await sale.save();
    res.status(201).json(sale);
};

exports.updateSale = async (req, res) => {
    const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sale) return res.status(404).send('Venta no encontrada');
    res.json(sale);
};

exports.deleteSale = async (req, res) => {
    const sale = await Sale.findByIdAndRemove(req.params.id);
    if (!sale) return res.status(404).send('Venta no encontrada');
    res.status(204).send();
};

exports.createSaleWithValidation = async (req, res) => {
    try {
        const { clientId, items } = req.body;
        const client = await Client.findById(clientId);
        if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ error: `Producto ${item.productId} no encontrado` });
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Inventario insuficiente para el producto ${item.productId}` });
            }
        }

        const sale = new Sale(req.body);
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        }
        await sale.save();
        res.status(201).json(sale);
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor', details: error.message });
    }
};

exports.cancelSale = async (req, res) => {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).send('Venta no encontrada');
    for (const item of sale.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }
    await sale.remove();
    res.status(204).send();
};

exports.getSalesByDateRange = async (req, res) => {
    const { startDate, endDate } = req.body;
    const sales = await Sale.find({
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).populate('clientId items.productId');
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    res.json({ totalSales, totalRevenue, sales });
};

exports.applyDiscountToSale = async (req, res) => {
    const { discount } = req.body;
    if (discount < 0 || discount > 100) return res.status(400).send('Descuento inválido');
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).send('Venta no encontrada');
    sale.total = sale.total * (1 - discount / 100);
    await sale.save();
    res.json(sale);
};

exports.getSaleProfit = async (req, res) => {
    const sale = await Sale.findById(req.params.id).populate('items.productId');
    if (!sale) return res.status(404).send('Venta no encontrada');
    const profit = sale.items.reduce((sum, item) => {
        const product = item.productId;
        return sum + (item.price - product.costPrice) * item.quantity;
    }, 0);
    res.json({ saleId: sale._id, profit });
};
