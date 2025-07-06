const mongoose = require('mongoose');
const Sale = require('../models/sale');
const Product = require('../models/product');
const Client = require('../models/client');

exports.getAllSales = async (req, res) => {
    try {
        const sales = await Sale.find().populate('clientId items.productId');
        res.json(sales);
    } catch (err) {
        res.status(500).send('Error al obtener ventas');
    }
};

exports.getSaleById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const sale = await Sale.findById(req.params.id).populate('clientId items.productId');
        if (!sale) return res.status(404).send('Venta no encontrada');
        res.json(sale);
    } catch (err) {
        res.status(500).send('Error al obtener la venta');
    }
};

exports.createSale = async (req, res) => {
    try {
        const sale = new Sale(req.body);
        await sale.save();
        res.status(201).json(sale);
    } catch (err) {
        res.status(500).send('Error al crear la venta');
    }
};

exports.updateSale = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!sale) return res.status(404).send('Venta no encontrada');
        res.json(sale);
    } catch (err) {
        res.status(500).send('Error al actualizar la venta');
    }
};

exports.deleteSale = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const sale = await Sale.findByIdAndDelete(req.params.id);
        if (!sale) return res.status(404).send('Venta no encontrada');
        res.status(204).send();
    } catch (err) {
        res.status(500).send('Error al eliminar la venta');
    }
};

exports.createSaleWithValidation = async (req, res) => {
    try {
        const { clientId, items } = req.body;

        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ error: 'ID de cliente inválido' });
        }

        const client = await Client.findById(clientId);
        if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

        for (const item of items) {
            if (!mongoose.Types.ObjectId.isValid(item.productId)) {
                return res.status(400).json({ error: `ID inválido del producto ${item.productId}` });
            }

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
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const sale = await Sale.findById(req.params.id);
        if (!sale) return res.status(404).send('Venta no encontrada');

        for (const item of sale.items) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
        }

        await sale.deleteOne();
        res.status(204).send();
    } catch (err) {
        res.status(500).send('Error al cancelar la venta');
    }
};

exports.getSalesByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const sales = await Sale.find({
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }).populate('clientId items.productId');

        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

        res.json({ totalSales, totalRevenue, sales });
    } catch (err) {
        res.status(500).send('Error al obtener ventas por rango de fechas');
    }
};

exports.applyDiscountToSale = async (req, res) => {
    try {
        const { discount } = req.body;

        if (discount < 0 || discount > 100) {
            return res.status(400).send('Descuento inválido');
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const sale = await Sale.findById(req.params.id);
        if (!sale) return res.status(404).send('Venta no encontrada');

        sale.total = sale.total * (1 - discount / 100);
        await sale.save();

        res.json(sale);
    } catch (err) {
        res.status(500).send('Error al aplicar descuento');
    }
};

exports.getSaleProfit = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const sale = await Sale.findById(req.params.id).populate('items.productId');
        if (!sale) return res.status(404).send('Venta no encontrada');

        const profit = sale.items.reduce((sum, item) => {
            const product = item.productId;
            return sum + (item.price - product.costPrice) * item.quantity;
        }, 0);

        res.json({ saleId: sale._id, profit });
    } catch (err) {
        res.status(500).send('Error al calcular ganancia');
    }
};
