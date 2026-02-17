import { Router } from 'express';
import { getDatabaseStatistics } from '../utils/database';

const router = Router();

// Health check endpoint
router.get('/', async (req, res) => {
    try {
        const dbStats = await getDatabaseStatistics();
        res.status(200).json({
            status: 'healthy',
            database: dbStats
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// Readiness check endpoint
router.get('/ready', (req, res) => {
    // Implement logic to check if the application is ready to handle requests
    res.status(200).json({ status: 'ready' });
});

// Liveness check endpoint
router.get('/live', (req, res) => {
    res.status(200).json({ status: 'alive' });
});

export default router;