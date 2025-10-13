import express from 'express';
import CategoryController from '../controllers/categoryController';
import {authAdmin, authenticateToken} from "../middleware/auth";

const router = express.Router();

router.get('/', CategoryController.getCategories);
router.use(authenticateToken);
router.use(authAdmin);

router.post('/', CategoryController.createCategory);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);
export default router;
