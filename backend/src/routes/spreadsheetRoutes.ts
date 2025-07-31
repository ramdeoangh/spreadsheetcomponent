import { Router } from 'express';
import { sendMessage, getActions, getState, getHealth, testWebSocket } from '../controllers/spreadsheetController';

const router = Router();

router.get('/health', getHealth);
router.post('/message', sendMessage);
router.get('/action', getActions);
router.get('/state', getState);
router.get('/test-websocket', testWebSocket);

// Debug endpoint to track /api/stream calls
router.get('/stream', (req, res) => {
  console.log('DEBUG: /api/stream called from:', req.get('User-Agent'));
  console.log('DEBUG: Referer:', req.get('Referer'));
  console.log('DEBUG: Headers:', req.headers);
  res.status(404).json({
    success: false,
    error: 'Stream endpoint removed - use WebSocket instead'
  });
});

export default router; 