const mongoose = require('mongoose');
const Notification = require('../models/notification');
const Product = require('../models/product');

exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find();
        res.json(notifications);
    } catch (err) {
        res.status(500).send('Error al obtener notificaciones');
    }
};

exports.getNotificationById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).send('Notificación no encontrada');
        res.json(notification);
    } catch (err) {
        res.status(500).send('Error al obtener la notificación');
    }
};

exports.createNotification = async (req, res) => {
    try {
        const notification = new Notification(req.body);
        await notification.save();
        res.status(201).json(notification);
    } catch (err) {
        res.status(500).send('Error al crear la notificación');
    }
};

exports.updateNotification = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!notification) return res.status(404).send('Notificación no encontrada');
        res.json(notification);
    } catch (err) {
        res.status(500).send('Error al actualizar la notificación');
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).send('Notificación no encontrada');
        res.status(204).send();
    } catch (err) {
        res.status(500).send('Error al eliminar la notificación');
    }
};

exports.createNotificationForLowStock = async (req, res) => {
    try {
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
    } catch (err) {
        res.status(500).send('Error al generar notificaciones por bajo stock');
    }
};

exports.markNotificationAsRead = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { status: 'read' },
            { new: true }
        );

        if (!notification) return res.status(404).send('Notificación no encontrada');
        res.json(notification);
    } catch (err) {
        res.status(500).send('Error al marcar la notificación como leída');
    }
};
