router.get('/', async (req, res) => {
  const { limit = 5, page = 1, sort, query } = req.query;

  const options = {
    limit: parseInt(limit),
    page: parseInt(page),
    sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {}
  };

  const filter = query ? { category: { $regex: query, $options: 'i' } } : {};

  try {
    const result = await manager.paginateProducts(filter, options);

    res.render('products', {
      title: 'Lista de Produtos',
      products: result.docs,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}&limit=${limit}${query ? `&query=${query}` : ''}${sort ? `&sort=${sort}` : ''}` : null,
      nextLink: result.hasNextPage ? `/products?page=${result.nextPage}&limit=${limit}${query ? `&query=${query}` : ''}${sort ? `&sort=${sort}` : ''}` : null,
      totalPages: result.totalPages,
      currentPage: result.page,
      limit // adicionar essa linha aqui
    });
    
  } catch (err) {
    res.status(500).send('Erro ao carregar produtos');
  }
});
