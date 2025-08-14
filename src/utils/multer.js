import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// Helper para obter __dirname em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define os caminhos de armazenamento relativos à raiz do projeto
const storagePaths = {
  profiles: path.join(__dirname, '../../uploads/profiles'),   // Perfis de usuários
  products: path.join(__dirname, '../../uploads/products'),   // Imagens de produtos
  documents: path.join(__dirname, '../../uploads/documents'), // Documentos gerais
  others: path.join(__dirname, '../../uploads/others')        // Fallback para outros arquivos
};

// Garante que todos os diretórios de armazenamento existam
Object.entries(storagePaths).forEach(([key, dir]) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true }); // Cria recursivamente se não existir
    console.log(`📁 Diretório criado: ${dir}`);
  }
});

// Tipos MIME permitidos para cada categoria
const allowedMimes = {
  profileImage: ['image/jpeg', 'image/png', 'image/webp'], // Imagens de perfil
  productImage: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], // Imagens de produtos
  document: [ // Documentos permitidos
    'application/pdf', // PDF
    'image/jpeg',      // JPEG
    'image/png',       // PNG
    'application/msword', // DOC
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
  ]
};

// Filtro de arquivos - valida tipos permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = allowedMimes[file.fieldname];

  if (!allowedTypes) {
    // Se não houver regras definidas, permite qualquer tipo
    return cb(null, true);
  }

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Aceita arquivo
  } else {
    // Rejeita com mensagem de erro detalhada
    cb(new Error(`❌ Tipo de arquivo inválido para ${file.fieldname}. Tipos permitidos: ${allowedTypes.join(', ')}`), false);
  }
};

// Sanitização de nomes de arquivo
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9_.-]/g, '_')  // Substitui caracteres especiais
    .replace(/\s+/g, '_')               // Substitui espaços por underscores
    .replace(/_+/g, '_')                // Remove underscores duplicados
    .substring(0, 100);                 // Limita o comprimento do nome
};

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Added authentication check for specific fields
    if ((file.fieldname === 'profileImage' || file.fieldname === 'document') && !req.user?._id) {
      return cb(new Error("Unauthenticated user"), null);
    }

    let dest;

    // Determina o destino com base no campo do formulário
    switch (file.fieldname) {
      case 'profileImage':
        // Perfis: cria subdiretório por usuário
        dest = path.join(storagePaths.profiles, req.user._id.toString());
        break;
      case 'productImage':
        // Produtos: diretório geral
        dest = storagePaths.products;
        break;
      case 'document':
        // Documentos: subdiretório por usuário
        dest = path.join(storagePaths.documents, req.user._id.toString());
        break;
      default:
        // Fallback para outros tipos
        dest = storagePaths.others;
    }

    // Cria diretório específico se não existir
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
      console.log(`📂 Diretório de usuário criado: ${dest}`);
    }

    cb(null, dest); // Retorna destino
  },

  filename: function (req, file, cb) {
    // Added general authentication check
    if (!req.user?._id) {
      return cb(new Error("Unauthenticated user"), null);
    }

    // Gera hash aleatório para segurança
    const randomHash = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now(); // Timestamp atual
    const sanitizedOriginal = sanitizeFilename(file.originalname); // Nome sanitizado

    // Extrai extensão do arquivo original
    const ext = path.extname(file.originalname) || '';
    const baseName = path.basename(sanitizedOriginal, ext);

    // Monta nome seguro: [tipo]-[userID]-[timestamp]-[hash]-[nome][ext]
    const safeFilename = `${file.fieldname}-${req.user._id}-${timestamp}-${randomHash}-${baseName}${ext}`;

    cb(null, safeFilename); // Retorna nome processado
  }
});

// Configuração final do multer
const uploader = multer({
  storage,         // Armazenamento configurado
  fileFilter,      // Filtro de tipos
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de 10MB por arquivo
    files: 5                    // Máximo de 5 arquivos por upload
  }
});

export default uploader;










// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';
// import crypto from 'crypto';

// // Helper para obter __dirname em módulos ES
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Define os caminhos de armazenamento relativos à raiz do projeto
// const storagePaths = {
//   profiles: path.join(__dirname, '../../uploads/profiles'),   // Perfis de usuários
//   products: path.join(__dirname, '../../uploads/products'),   // Imagens de produtos
//   documents: path.join(__dirname, '../../uploads/documents'), // Documentos gerais
//   others: path.join(__dirname, '../../uploads/others')        // Fallback para outros arquivos
// };

// // Garante que todos os diretórios de armazenamento existam
// Object.entries(storagePaths).forEach(([key, dir]) => {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true }); // Cria recursivamente se não existir
//     console.log(`📁 Diretório criado: ${dir}`);
//   }
// });

// // Tipos MIME permitidos para cada categoria
// const allowedMimes = {
//   profileImage: ['image/jpeg', 'image/png', 'image/webp'], // Imagens de perfil
//   productImage: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], // Imagens de produtos
//   document: [ // Documentos permitidos
//     'application/pdf', // PDF
//     'image/jpeg',      // JPEG
//     'image/png',       // PNG
//     'application/msword', // DOC
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
//   ]
// };

// // Filtro de arquivos - valida tipos permitidos
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = allowedMimes[file.fieldname];

//   if (!allowedTypes) {
//     // Se não houver regras definidas, permite qualquer tipo
//     return cb(null, true);
//   }

//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true); // Aceita arquivo
//   } else {
//     // Rejeita com mensagem de erro detalhada
//     cb(new Error(`❌ Tipo de arquivo inválido para ${file.fieldname}. Tipos permitidos: ${allowedTypes.join(', ')}`), false);
//   }
// };

// // Sanitização de nomes de arquivo
// const sanitizeFilename = (filename) => {
//   return filename
//     .replace(/[^a-zA-Z0-9_.-]/g, '_')  // Substitui caracteres especiais
//     .replace(/\s+/g, '_')               // Substitui espaços por underscores
//     .replace(/_+/g, '_')                // Remove underscores duplicados
//     .substring(0, 100);                 // Limita o comprimento do nome
// };

// // Configuração de armazenamento
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     let dest;

//     // Determina o destino com base no campo do formulário
//     switch (file.fieldname) {
//       case 'profileImage':
//         // Perfis: cria subdiretório por usuário
//         dest = path.join(storagePaths.profiles, req.user._id.toString());
//         break;
//       case 'productImage':
//         // Produtos: diretório geral
//         dest = storagePaths.products;
//         break;
//       case 'document':
//         // Documentos: subdiretório por usuário
//         dest = path.join(storagePaths.documents, req.user._id.toString());
//         break;
//       default:
//         // Fallback para outros tipos
//         dest = storagePaths.others;
//     }

//     // Cria diretório específico se não existir
//     if (!fs.existsSync(dest)) {
//       fs.mkdirSync(dest, { recursive: true });
//       console.log(`📂 Diretório de usuário criado: ${dest}`);
//     }

//     cb(null, dest); // Retorna destino
//   },

//   filename: function (req, file, cb) {
//     // Gera hash aleatório para segurança
//     const randomHash = crypto.randomBytes(8).toString('hex');
//     const timestamp = Date.now(); // Timestamp atual
//     const sanitizedOriginal = sanitizeFilename(file.originalname); // Nome sanitizado

//     // Extrai extensão do arquivo original
//     const ext = path.extname(file.originalname) || '';
//     const baseName = path.basename(sanitizedOriginal, ext);

//     // Monta nome seguro: [tipo]-[userID]-[timestamp]-[hash]-[nome][ext]
//     const safeFilename = `${file.fieldname}-${req.user._id}-${timestamp}-${randomHash}-${baseName}${ext}`;

//     cb(null, safeFilename); // Retorna nome processado
//   }
// });

// // Configuração final do multer
// const uploader = multer({
//   storage,         // Armazenamento configurado
//   fileFilter,      // Filtro de tipos
//   limits: {
//     fileSize: 10 * 1024 * 1024, // Limite de 10MB por arquivo
//     files: 5                    // Máximo de 5 arquivos por upload
//   }
// });

// export default uploader;