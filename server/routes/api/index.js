import express from 'express';
import article from './article.js';
import permission from './permission.js';
import project from './project.js';

const router = express.Router();
router.use('/article', article);
router.use('/permission', permission);
router.use('/project', project);

export default router;