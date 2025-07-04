const Client = require('../models/client');
const Sale = require('../models/sale');

exports.getAllClients = async (req, res) => {
    const clients = await Client.find();
    res.json(clients);
};

exports.getClientById = async (req, res) => {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).send('Cliente no encontrado');
    res.json(client);
};

exports.createClient = async (req, res) => {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
};

 exports.updateClient = async (req, res) => {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) return res.status(404).send('Cliente no encontrado');
    res.json(client);
};

exports.deleteClient = async (req, res) => {
    const client = await Client.findByIdAndRemove(req.params.id);
    if (!client) return res.status(404).send('Cliente no encontrado');
    res.status(204).send();
};

exports.updateClientCredit = async (req, res) => {
    const { credit } = req.body;
    if (credit < 0) return res.status(400).send('El crédito no puede ser negativo');
    const client = await Client.findByIdAndUpdate(req.params.id, { credit }, { new: true });
    if (!client) return res.status(404).send('Cliente no encontrado');
    res.json(client);
};

exports.getClientPurchaseHistory = async (req, res) => {
    const sales = await Sale.find({ clientId: req.params.id }).populate('items.productId');
    if (!sales.length) return res.status(404).send('No se encontraron compras para este cliente');
    res.json(sales);
};

exports.assignClientToSale = async (req, res) => {
    const { saleId } = req.body;
    const sale = await Sale.findById(saleId);
    if (!sale) return res.status(404).send('Venta no encontrada');
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).send('Cliente no encontrado');
    sale.clientId = client._id;
    await sale.save();
    res.json(sale);
};

exports.getTopClientsBySales = async (req, res) => {
    const clients = await Sale.aggregate([
        { $group: { _id: '$clientId', totalSales: { $sum: 1 } } },
        { $sort: { totalSales: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'clients', localField: '_id', foreignField: '_id', as: 'client' } },
        { $unwind: '$client' },
        { $project: { clientId: '$_id', clientName: '$client.name', totalSales: 1 } }
    ]);
    res.json(clients);
};

exports.deactivateClient = async (req, res) => {
    const client = await Client.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
    if (!client) return res.status(404).send('Cliente no encontrado');
    res.json(client);
};
