const Notification = require('../models/notification');
const Product = require('../models/product');

exports.getAllNotifications = async (req, res) => {
    const notifications = await Notification.find();
    res.json(notifications);
};

exports.getNotificationById = async (req, res) => {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).send('Notificación no encontrada');
    res.json(notification);
};

exports.createNotification = async (req, res) => {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
};

exports.updateNotification = async (req, res) => {
    const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notification) return res.status(404).send('Notificación no encontrada');
    res.json(notification);
};

exports.deleteNotification = async (req, res) => {
    const notification = await Notification.findByIdAndRemove(req.params.id);
    if (!notification) return res.status(404).send('Notificación no encontrada');
    res.status(204).send();
};

exports.createNotificationForLowStock = async (req, res) => {
    const { threshold = 10 } = req.body;
    const products = await Product.find({ stock: { $lte: threshold } });
    const notifications = await Promise.all(products.map(async (product) => {
        const notification = new Notification({
            message: `El producto ${product.name} tiene un inventario bajo (${product.stock} unidades)`,
            type: 'low_stock'
        });
        await notification.save();
        return notification;
    }));
    res.status(201).json(notifications);
};

exports.markNotificationAsRead = async (req, res) => {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { status: 'read' }, { new: true });
    if (!notification) return res.status(404).send('Notificación no encontrada');
    res.json(notification);
};
