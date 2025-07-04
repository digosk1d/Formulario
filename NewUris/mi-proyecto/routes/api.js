const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const clientController = require('../controllers/clientController');
const catalogController = require('../controllers/catalogController');
const notificationController = require('../controllers/notificationController');
const supplierController = require('../controllers/supplierController');
const saleController = require('../controllers/saleController');

// Categorías
router.get('/categories/summary', categoryController.getCategorySummary);
router.post('/categories/merge', categoryController.mergeCategories);
router.get('/categories', categoryController.getAllCategories);
router.post('/categories', categoryController.createCategory);
router.get('/categories/:id', categoryController.getCategoryById);
router.post('/categories/:id/assign-product', categoryController.assignProductToCategory);
router.get('/categories/:id/product-count', categoryController.getCategoryProductCount);
router.put('/categories/:id/archive', categoryController.archiveCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// Productos
router.get('/products/low-stock', productController.getLowStockProducts);
router.post('/products/bulk-price-update', productController.applyBulkPriceUpdate);
router.get('/products', productController.getAllProducts);
router.post('/products', productController.createProduct);
router.get('/products/:id', productController.getProductById);
router.put('/products/:id/stock', productController.updateProductStock);
router.put('/products/:id/archive', productController.archiveProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Clientes
router.get('/clients/top-sales', clientController.getTopClientsBySales);
router.get('/clients', clientController.getAllClients);
router.post('/clients', clientController.createClient);
router.get('/clients/:id', clientController.getClientById);
router.get('/clients/:id/purchase-history', clientController.getClientPurchaseHistory);
router.post('/clients/:id/assign-sale', clientController.assignClientToSale);
router.put('/clients/:id/credit', clientController.updateClientCredit);
router.put('/clients/:id/deactivate', clientController.deactivateClient);
router.put('/clients/:id', clientController.updateClient);
router.delete('/clients/:id', clientController.deleteClient); 

// Catálogos
router.get('/catalogs', catalogController.getAllCatalogs);
router.post('/catalogs', catalogController.createCatalog);
router.get('/catalogs/:id', catalogController.getCatalogById);
router.get('/catalogs/:id/products', catalogController.getCatalogProducts);
router.post('/catalogs/:id/assign-product', catalogController.assignProductToCatalog);
router.post('/catalogs/:id/remove-product', catalogController.removeProductFromCatalog);
router.post('/catalogs/:id/duplicate', catalogController.duplicateCatalog);
router.put('/catalogs/:id/status', catalogController.updateCatalogStatus);
router.put('/catalogs/:id', catalogController.updateCatalog);
router.delete('/catalogs/:id', catalogController.deleteCatalog);

// Notificaciones
router.get('/notifications', notificationController.getAllNotifications);
router.post('/notifications/low-stock', notificationController.createNotificationForLowStock);
router.post('/notifications', notificationController.createNotification);
router.get('/notifications/:id', notificationController.getNotificationById);
router.put('/notifications/:id/read', notificationController.markNotificationAsRead);
router.put('/notifications/:id', notificationController.updateNotification);
router.delete('/notifications/:id', notificationController.deleteNotification);

// Proveedores
router.get('/suppliers/summary', supplierController.getSupplierSummary);
router.get('/suppliers', supplierController.getAllSuppliers);
router.post('/suppliers', supplierController.createSupplier);
router.get('/suppliers/:id', supplierController.getSupplierById);
router.get('/suppliers/:id/product-count', supplierController.getSupplierProductCount);
router.post('/suppliers/:id/assign-catalog', supplierController.assignCatalogToSupplier);
router.put('/suppliers/:id/status', supplierController.updateSupplierStatus);
router.put('/suppliers/:id', supplierController.updateSupplier);
router.delete('/suppliers/:id', supplierController.deleteSupplier);

// Sales
router.get('/sales', saleController.getAllSales);
router.post('/sales/validated', saleController.createSaleWithValidation);
router.post('/sales/date-range', saleController.getSalesByDateRange);
router.post('/sales', saleController.createSale);
router.get('/sales/:id', saleController.getSaleById);
router.get('/sales/:id/profit', saleController.getSaleProfit);
router.put('/sales/:id/discount', saleController.applyDiscountToSale);
router.put('/sales/:id', saleController.updateSale);
router.delete('/sales/:id/cancel', saleController.cancelSale);
router.delete('/sales/:id', saleController.deleteSale);

module.exports = router;
