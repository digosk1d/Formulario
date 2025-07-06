const mongoose = require('mongoose');
const Client = require('../models/client');
const Sale = require('../models/sale');

exports.getAllClients = async (req, res) => {
    try {
        const clients = await Client.find();
        res.json(clients);
    } catch (err) {
        res.status(500).send('Error al obtener los clientes');
    }
};

exports.getClientById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const client = await Client.findById(req.params.id);
        if (!client) return res.status(404).send('Cliente no encontrado');
        res.json(client);
    } catch (err) {
        res.status(500).send('Error al obtener el cliente');
    }
};

exports.createClient = async (req, res) => {
    try {
        const client = new Client(req.body);
        await client.save();
        res.status(201).json(client);
    } catch (err) {
        res.status(500).send('Error al crear el cliente');
    }
};

exports.updateClient = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!client) return res.status(404).send('Cliente no encontrado');
        res.json(client);
    } catch (err) {
        res.status(500).send('Error al actualizar el cliente');
    }
};

exports.deleteClient = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) return res.status(404).send('Cliente no encontrado');
        res.status(204).send();
    } catch (err) {
        res.status(500).send('Error al eliminar el cliente');
    }
};

exports.updateClientCredit = async (req, res) => {
    try {
        const { credit } = req.body;
        if (credit < 0) return res.status(400).send('El crédito no puede ser negativo');

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const client = await Client.findByIdAndUpdate(req.params.id, { credit }, { new: true });
        if (!client) return res.status(404).send('Cliente no encontrado');
        res.json(client);
    } catch (err) {
        res.status(500).send('Error al actualizar el crédito del cliente');
    }
};

exports.getClientPurchaseHistory = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const sales = await Sale.find({ clientId: req.params.id }).populate('items.productId');
        if (!sales.length) return res.status(404).send('No se encontraron compras para este cliente');
        res.json(sales);
    } catch (err) {
        res.status(500).send('Error al obtener el historial de compras');
    }
};

exports.assignClientToSale = async (req, res) => {
    try {
        const { saleId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(saleId) || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const sale = await Sale.findById(saleId);
        if (!sale) return res.status(404).send('Venta no encontrada');

        const client = await Client.findById(req.params.id);
        if (!client) return res.status(404).send('Cliente no encontrado');

        sale.clientId = client._id;
        await sale.save();

        res.json(sale);
    } catch (err) {
        res.status(500).send('Error al asignar el cliente a la venta');
    }
};

exports.getTopClientsBySales = async (req, res) => {
    try {
        const clients = await Sale.aggregate([
            { $group: { _id: '$clientId', totalSales: { $sum: 1 } } },
            { $sort: { totalSales: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'clients',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'client'
                }
            },
            { $unwind: '$client' },
            {
                $project: {
                    clientId: '$_id',
                    clientName: '$client.name',
                    totalSales: 1
                }
            }
        ]);
        res.json(clients);
    } catch (err) {
        res.status(500).send('Error al obtener los mejores clientes');
    }
};

exports.deactivateClient = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const client = await Client.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
        if (!client) return res.status(404).send('Cliente no encontrado');
        res.json(client);
    } catch (err) {
        res.status(500).send('Error al desactivar el cliente');
    }
};
