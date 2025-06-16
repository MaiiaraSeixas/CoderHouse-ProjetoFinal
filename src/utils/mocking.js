// Arquivo 1: src/utils/mocking.js (CRIE ESTE ARQUIVO)

import { faker } from '@faker-js/faker';

/**
 * Gera um produto falso com dados realistas.
 */
export const generateMockProduct = () => {
    return {
        _id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        code: faker.string.alphanumeric(10).toUpperCase(),
        price: parseFloat(faker.commerce.price()),
        stock: faker.number.int({ min: 0, max: 100 }),
        category: faker.commerce.department(),
        thumbnails: [faker.image.url(), faker.image.url()],
        status: faker.datatype.boolean(),
    };
};
