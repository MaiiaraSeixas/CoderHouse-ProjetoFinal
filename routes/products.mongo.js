// Importação de módulos necessários
import { Router } from 'express'; // Framework para criação de rotas
import handlePolicies  from '../middlewares/handlePolicies.js'; // Middleware de autorização
import { // Importação dos controladores de produtos
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/products.controller.js';

// Cria uma instância do router do Express
const router = Router();

/**************************************/
/*         ROTAS PÚBLICAS             */
/*   Acessíveis sem autenticação full  */
/**************************************/
router.get('/', // Rota para listagem de produtos
  handlePolicies(['PUBLIC']), // Permite acesso público
  getAllProducts // Controller que busca todos os produtos
);

router.get('/:pid', // Rota para obter um produto específico por ID
  handlePolicies(['PUBLIC']), // Permite acesso público
  getProductById // Controller que busca produto por ID
);

/**************************************/
/*       ROTAS PROTEGIDAS              */
/* Requerem autenticação e autorização */
/**************************************/
router.post('/', // Rota para criação de novo produto
  handlePolicies(['ADMIN', 'PREMIUM']), // Exige role ADMIN ou PREMIUM
  createProduct // Controller que cria novo produto
);

router.put('/:pid', // Rota para atualização de produto
  handlePolicies(['ADMIN', 'PREMIUM']), // Exige role ADMIN ou PREMIUM
  updateProduct // Controller que atualiza produto existente
);

router.delete('/:pid', // Rota para exclusão de produto
  handlePolicies(['ADMIN', 'PREMIUM']), // Exige role ADMIN ou PREMIUM
  deleteProduct // Controller que remove produto
);

// Exporta o router configurado para uso na aplicação
export default router;