import { Router, type Router as RouterType } from 'express';
import { todosController } from '../controllers/todos.controller.js';
import { validateBody } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import {
  createTodoSchema,
  updateTodoSchema,
  completeTodoSchema,
  shareTodoSchema,
  bulkCompleteTodosSchema,
  bulkDeleteTodosSchema,
} from '../schemas/todo.schema.js';

const router: RouterType = Router();

router.use(authenticate);

// Bulk operations
router.post('/bulk/complete', validateBody(bulkCompleteTodosSchema), todosController.bulkComplete);
router.post('/bulk/delete', validateBody(bulkDeleteTodosSchema), todosController.bulkDelete);

// CRUD routes
router.get('/', todosController.list);
router.get('/:id', todosController.getById);
router.post('/', validateBody(createTodoSchema), todosController.create);
router.put('/:id', validateBody(updateTodoSchema), todosController.update);
router.patch('/:id/complete', validateBody(completeTodoSchema), todosController.toggleComplete);
router.delete('/:id', todosController.delete);

// Sharing
router.post('/:id/share', validateBody(shareTodoSchema), todosController.share);
router.delete('/:id/share/:userId', todosController.unshare);

export default router;
