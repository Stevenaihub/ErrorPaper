import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { getDatabase } from '../database/init.js';
import { createLogger } from '../utils/logger.js';

const router = express.Router();
const logger = createLogger('PracticeRoutes');

// Validation schema
const practiceSchema = Joi.object({
  error_id: Joi.string().required(),
  answers: Joi.array().items(Joi.string()),
});

// POST - Submit practice answers
router.post('/submit', async (req, res) => {
  const { error: validationError, value } = practiceSchema.validate(req.body);
  if (validationError) {
    validationError.isJoi = true;
    throw validationError;
  }

  const db = await getDatabase();
  
  try {
    const records = [];
    for (let i = 0; i < (value.answers || []).length; i++) {
      const id = uuidv4();
      await db.run(
        `INSERT INTO practice_records (id, error_id, question_index, user_answer, created_at)`,
        [id, value.error_id, i, value.answers[i]]
      );
      records.push(id);
    }

    logger.info(`Practice record created for error: ${value.error_id}`);
    res.status(201).json({ records, message: 'Practice answers submitted' });
  } catch (err) {
    logger.error(`Failed to submit practice: ${err.message}`);
    throw err;
  }
});

// GET - Get practice history by error ID
router.get('/history/:error_id', async (req, res) => {
  const db = await getDatabase();
  
  try {
    const records = await db.all(
      `SELECT * FROM practice_records WHERE error_id = ? ORDER BY created_at DESC`,
      [req.params.error_id]
    );
    res.json(records);
  } catch (err) {
    logger.error(`Failed to fetch practice history: ${err.message}`);
    throw err;
  }
});

// GET - Get learning statistics
router.get('/stats', async (req, res) => {
  const db = await getDatabase();
  
  try {
    const stats = await db.all('SELECT * FROM learning_stats');
    res.json(stats);
  } catch (err) {
    logger.error(`Failed to fetch stats: ${err.message}`);
    throw err;
  }
});

export default router;