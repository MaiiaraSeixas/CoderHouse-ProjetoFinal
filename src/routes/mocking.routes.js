// Arquivo: src/routes/mocking.routes.js (Versão Final Limpa)

import { Router } from 'express';
import { generateMockProduct } from '../utils/mocking.js';

const router = Router();

router.get('/', (req, res) => {
    const products = [];
    for (let i = 0; i < 100; i++) {
        products.push(generateMockProduct());
    }
    // O método sendSuccess, que vem do seu responseMiddleware,
    // padroniza a resposta da API.
    res.sendSuccess(products);
});

export default router;


