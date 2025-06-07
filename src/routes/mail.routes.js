import { Router } from 'express';
import { sendMail } from '../utils/mailer.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { to, subject, html, attachments } = req.body;
    await sendMail({ to, subject, html, attachments });
    res.sendSuccess('E-mail enviado com sucesso');
  } catch (err) {
    res.status(500).json({ status: 'error', error: 'Falha ao enviar e-mail' });
  }
});

export default router;
