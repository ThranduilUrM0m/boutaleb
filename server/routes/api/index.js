import express from 'express';
import permission from './permission.js';

const router = express.Router();
router.use('/permission', permission);

export default router;