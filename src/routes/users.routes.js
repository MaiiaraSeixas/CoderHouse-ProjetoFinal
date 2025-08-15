// src/routes/users.routes.js

import { Router } from 'express';
import passport from 'passport';
import {
	getAllUsers,
	getUserById,
	deleteUser,
	uploadDocuments,
	changeUserRole
} from '../controllers/users.controller.js';
import handlePolicies from '../middlewares/handlePolicies.js';
import uploader from '../utils/multer.js';

// Cria o roteador para as rotas de usuários
const router = Router();

// src/tests/products.service.test.js

import { expect } from 'chai';
import sinon from 'sinon';
import ProductRepository from '../repositories/product.repository.js';
import ProductService from '../services/products.service.js';

describe('Teste de Unidade para ProductService', () => {
	let productService;
	let productRepositoryStub;

	beforeEach(() => {
		productRepositoryStub = sinon.createStubInstance(ProductRepository);
		// CORREÇÃO: Instanciamos a classe para o teste
		productService = new ProductService();
		// Injetamos o stub na instância
		productService.productRepository = productRepositoryStub;
	});

	afterEach(() => {
		sinon.restore();
	});

	it('Deve chamar o repositório para obter produtos com os parâmetros corretos', async () => {
		const params = { limit: 5, page: 2, sort: 'asc', query: 'Eletrônicos' };
		const expectedFilter = { category: 'Eletrônicos' };
		const expectedOptions = { page: 2, limit: 5, lean: true, sort: { price: 1 } };

		productRepositoryStub.get.resolves({ docs: [], totalPages: 1 });
		await productService.getProducts(params);
		expect(productRepositoryStub.get.calledOnceWith(expectedFilter, sinon.match(expectedOptions))).to.be.true;
	});

	it('Deve lançar um erro ao tentar adicionar um produto sem título', async () => {
		const invalidProduct = { price: 150 };
		try {
			await productService.addProduct(invalidProduct);
			expect.fail('O serviço deveria ter lançado um erro');
		} catch (error) {
			expect(error.message).to.equal('Título e preço são campos obrigatórios.');
			expect(productRepositoryStub.create.called).to.be.false;
		}
	});

	it('Deve chamar o repositório para criar um produto com dados válidos', async () => {
		const validProduct = { title: 'Produto Válido', price: 100, category: 'Teste' };
		productRepositoryStub.create.resolves(validProduct);
		const result = await productService.addProduct(validProduct);
		expect(productRepositoryStub.create.calledOnceWith(validProduct)).to.be.true;
		expect(result).to.deep.equal(validProduct);
	});
});

// Rota para obter todos os usuários (apenas ADMIN)
router.get('/',
	// Autenticação via JWT
	passport.authenticate('jwt', { session: false }),
	// Verificação de política de acesso (somente ADMIN)
	handlePolicies(['ADMIN']),
	// Controller que busca todos os usuários
	getAllUsers
);

// Rota para obter um usuário específico por ID (apenas ADMIN)
router.get('/:uid',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['ADMIN']),
	// Controller que busca um usuário pelo ID
	getUserById
);

// Rota para deletar um usuário (apenas ADMIN)
router.delete('/:uid',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['ADMIN']),
	// Controller que remove um usuário
	deleteUser
);

// Rota para upload de documentos do usuário
// IMPORTANTE: A ordem dos middlewares é crucial
router.post('/:uid/documents',
	// 1. Primeiro autentica o usuário (para ter req.user disponível)
	passport.authenticate('jwt', { session: false }),

	// 2. Depois processa o upload de arquivos
	// Permite até 5 arquivos com o campo name="document"
	uploader.array('document', 5),

	// 3. Controller que salva os metadados dos documentos
	uploadDocuments
);

// Rota para alterar o role do usuário (apenas ADMIN)
router.put('/premium/:uid',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['ADMIN']),
	// Controller que atualiza o role do usuário
	changeUserRole
);

// Exporta o roteador configurado
export default router;