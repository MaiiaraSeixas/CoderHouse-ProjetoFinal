// ✅ REGISTRO DE USUÁRIO (Corrigido)
export const registerUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password, age } = req.body;

    // Validação básica de idade
    if (isNaN(age)) return res.sendError('Idade inválida', 400);

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) return res.sendError('Usuário já existe', 400);

    const hashedPassword = createHash(password);

    // 1. Cria usuário primeiro
    const newUser = await UserModel.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      age,
      role: 'user',
      cartId: null // Temporário
    });

    // 2. Cria carrinho associado ao ID do usuário
    const newCart = await CartModel.create({
      user: newUser._id, // Usa ObjectId
      products: []
    });

    // 3. Atualiza usuário com ID do carrinho
    newUser.cartId = newCart._id;
    await newUser.save();

    res.sendCreated({
      message: 'Usuário registrado com sucesso',
      // Retorna apenas dados não sensíveis
      user: {
        id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name
      }
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.sendError('Erro ao registrar usuário', 500);
  }
};

// ✅ LOGIN DE USUÁRIO (Corrigido)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user || !isValidPassword(password, user.password)) {
      return res.sendError('Credenciais inválidas', 401);
    }

    user.last_connection = new Date();

    // Verifica se carrinho existe (por ObjectId)
    let cart = await CartModel.findOne({ user: user._id });

    if (!cart) {
      cart = await CartModel.create({ user: user._id, products: [] });
      user.cartId = cart._id; // Atualiza referência
    }

    await user.save(); // Persiste última conexão + cartId

    const token = generateToken({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        cartId: user.cartId
      }
    });

    res.cookie('jwtCookieToken', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      sameSite: 'strict'
    });

    req.session.user = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    };

    res.sendSuccess({ message: 'Login bem-sucedido' });
  } catch (error) {
    console.error('Erro no login:', error);
    res.sendError('Erro no login', 500);
  }
};

// ✅ DADOS DO USUÁRIO (Melhorado)
export const getCurrentUser = (req, res) => {
  if (!req.user) return res.sendError('Não autenticado', 401);

  const { _id, first_name, last_name, email, role, cartId } = req.user;
  res.sendSuccess({
    user: {
      _id,
      first_name,
      last_name,
      email,
      role,
      cartId // Útil para o front-end
    }
  });
};