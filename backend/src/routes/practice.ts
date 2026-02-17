import express, { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAllRows, getRow, runQuery } from '../services/database.js';
import { generatePracticeQuestions } from '../services/aiGenerator.js';
import { ApiResponse, PracticeQuestion } from '../types/index.js';

const router = Router();

// Generate practice questions for an error
router.post('/:errorId/generate', async (req: Request, res: Response) => {
  try {
    const { errorId } = req.params;
    const { count = 3 } = req.body;

    // Get the error question
    const error = await getRow('SELECT * FROM errors WHERE id = ?', [errorId]);

    if (!error) {
      return res.status(404).json({
        success: false,
        error: 'Error question not found',
      } as ApiResponse<null>);
    }

    // Generate practice questions using AI
    const generatedQuestions = await generatePracticeQuestions(
      error.original_question,
      error.subject,
      error.category,
      error.difficulty,
      count
    );

    // Save practice questions to database
    const practiceQuestions: PracticeQuestion[] = [];

    for (const q of generatedQuestions) {
      const id = uuidv4();
      const now = new Date().toISOString();

      await runQuery(
        `INSERT INTO practice_questions (id, error_id, question_text, options, difficulty, category, subject, created_at)`,
        [
          id,
          errorId,
          q.question,
          q.options ? JSON.stringify(q.options) : null,
          error.difficulty,
          error.category,
          error.subject,
          now,
        ]
      );

      practiceQuestions.push({
        id,
        error_id: errorId,
        question_text: q.question,
        options: q.options,
        difficulty: error.difficulty,
        category: error.category,
        subject: error.subject,
        created_at: now,
      });
    }

    const response: ApiResponse<PracticeQuestion[]> = {
      success: true,
      data: practiceQuestions,
      message: `Generated ${practiceQuestions.length} practice questions`,
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error generating practice questions:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    } as ApiResponse<null>);
  }
});

// Get practice questions for an error
router.get('/:errorId', async (req: Request, res: Response) => {
  try {
    const { errorId } = req.params;

    const questions = await getAllRows(
      'SELECT * FROM practice_questions WHERE error_id = ? ORDER BY created_at DESC',
      [errorId]
    );

    const formattedQuestions = questions.map((q: any) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : undefined,
    }));

    const response: ApiResponse<PracticeQuestion[]> = {
      success: true,
      data: formattedQuestions,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching practice questions:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    } as ApiResponse<null>);
  }
});

// Get all practice questions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { subject, category, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM practice_questions WHERE 1=1';
    const params: any[] = [];

    if (subject) {
      query += ' AND subject = ?';
      params.push(subject);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const questions = await getAllRows(query, params);

    const formattedQuestions = questions.map((q: any) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : undefined,
    }));

    const response: ApiResponse<PracticeQuestion[]> = {
      success: true,
      data: formattedQuestions,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching practice questions:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    } as ApiResponse<null>);
  }
});

// Delete practice question
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await runQuery('DELETE FROM practice_questions WHERE id = ?', [req.params.id]);

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id: req.params.id },
      message: 'Practice question deleted successfully',
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error deleting practice question:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    } as ApiResponse<null>);
  }
});

export default router;