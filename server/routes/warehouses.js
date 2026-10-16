import express from 'express';
import { warehouseController } from '../controllers/warehouseController.js';

const router = express.Router();

// GET all warehouses with filters
router.get('/', warehouseController.getAllWarehouses);

// POST create warehouse listing
router.post('/', warehouseController.createWarehouse);

// GET warehouse by ID
router.get('/:id', warehouseController.getWarehouseById);

// DELETE warehouse by ID
router.delete('/:id', warehouseController.deleteWarehouse);

export default router;
