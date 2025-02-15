import express from 'express';

import article from './article.js';
import benefit from './benefit.js';
import client from './client.js';
import comment from './comment.js';
import department from './department.js';
import downvote from './downvote.js';
import expense from './expense.js';
import expertise from './expertise.js';
import income from './income.js';
import insurance from './insurance.js';
import investment from './investment.js';
import invoice from './invoice.js';
import loan from './loan.js';
import payment from './payment.js';
import permission from './permission.js';
import priority from './priority.js';
import project from './project.js';
import revenue from './revenue.js';
import role from './role.js';
import salary from './salary.js';
import saving from './saving.js';
import team from './team.js';
import testimonial from './testimonial.js';
import token from './token.js';
import upvote from './upvote.js';
import user from './user.js';
import view from './view.js';

const router = express.Router();
router.use('/article', article);
router.use('/benefit', benefit);
router.use('/client', client);
router.use('/comment', comment);
router.use('/department', department);
router.use('/downvote', downvote);
router.use('/expense', expense);
router.use('/expertise', expertise);
router.use('/income', income);
router.use('/insurance', insurance);
router.use('/investment', investment);
router.use('/invoice', invoice);
router.use('/loan', loan);
router.use('/payment', payment);
router.use('/permission', permission);
router.use('/priority', priority);
router.use('/project', project);
router.use('/revenue', revenue);
router.use('/role', role);
router.use('/salary', salary);
router.use('/saving', saving);
router.use('/team', team);
router.use('/testimonial', testimonial);
router.use('/token', token);
router.use('/upvote', upvote);
router.use('/user', user);
router.use('/view', view);

export default router;
