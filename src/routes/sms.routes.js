import { Router } from 'express';
import { sendSMS } from '../utils/twilioClient.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { to, message } = req.body;
    await sendSMS(to, message);
    res.sendSuccess('SMS enviado com sucesso');
  } catch (err) {
    res.status(500).json({ status: 'error', error: 'Falha ao enviar SMS' });
  }
});

export default router;
