import express from 'express';
import { vehicleController } from '../controllers/vehicleController.js';

const router = express.Router();

// GET all vehicles with filters
router.get('/', vehicleController.getAllVehicles);

// POST register vehicle
router.post('/', vehicleController.createVehicle);

// GET vehicle by ID
router.get('/:id', vehicleController.getVehicleById);

// DELETE vehicle by ID
router.delete('/:id', vehicleController.deleteVehicle);

export default router;
