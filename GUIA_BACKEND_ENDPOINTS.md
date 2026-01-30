# 🚀 GUIA DE IMPLEMENTAÇÃO - BACKEND ENDPOINTS

**Versão**: Alpha 10.1.0  
**Data**: 29/01/2026  
**Tempo Estimado**: 6h

---

## 📋 OBJETIVO

Criar endpoints backend para suportar as funcionalidades integradas em Alpha 10.1.0:
- Gestão de Funcionários
- Relatórios Consolidados
- Exceções e Pagamentos

---

## 🔧 ESTRUTURA DE ARQUIVOS

```
backend/src/
├── routes/
│   ├── funcionarios.routes.ts    ← CRIAR
│   ├── relatorios.routes.ts      ← CRIAR
│   └── index.ts                  ← ATUALIZAR
├── controllers/
│   ├── funcionarios.controller.ts ← CRIAR
│   └── relatorios.controller.ts   ← CRIAR
├── services/
│   ├── funcionarios.service.ts    ← CRIAR
│   └── relatorios.service.ts      ← CRIAR
├── middleware/
│   ├── auth.middleware.ts         ← JÁ EXISTE
│   ├── tenant.middleware.ts       ← JÁ EXISTE
│   └── validation.middleware.ts   ← CRIAR
└── validators/
    ├── funcionarios.validator.ts  ← CRIAR
    └── relatorios.validator.ts    ← CRIAR
```

---

## 🔧 PASSO 1: ROTAS DE FUNCIONÁRIOS

### `backend/src/routes/funcionarios.routes.ts`

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { funcionariosController } from '../controllers/funcionarios.controller';
import { 
  criarFuncionarioSchema, 
  atualizarFuncionarioSchema 
} from '../validators/funcionarios.validator';

const router = Router();

// Middleware global: autenticação + tenant
router.use(authMiddleware);
router.use(tenantMiddleware);

// Listar funcionários
router.get('/', funcionariosController.listar);

// Detalhes de um funcionário
router.get('/:id', funcionariosController.detalhes);

// Criar funcionário (apenas owner e admin)
router.post(
  '/',
  validateRequest(criarFuncionarioSchema),
  funcionariosController.criar
);

// Atualizar funcionário (apenas owner e admin)
router.put(
  '/:id',
  validateRequest(atualizarFuncionarioSchema),
  funcionariosController.atualizar
);

// Desativar funcionário (soft delete)
router.put('/:id/desativar', funcionariosController.desativar);

// Reativar funcionário
router.put('/:id/reativar', funcionariosController.reativar);

export default router;
```

---

## 🔧 PASSO 2: CONTROLLER DE FUNCIONÁRIOS

### `backend/src/controllers/funcionarios.controller.ts`

```typescript
import { Request, Response } from 'express';
import { funcionariosService } from '../services/funcionarios.service';
import { AppError } from '../utils/AppError';

export const funcionariosController = {
  // Listar funcionários
  async listar(req: Request, res: Response) {
    try {
      const { companyId } = req.tenant;
      const { ativo } = req.query;

      const funcionarios = await funcionariosService.listar(
        companyId,
        ativo === 'true'
      );

      res.json({
        success: true,
        data: funcionarios,
      });
    } catch (error) {
      console.error('Erro ao listar funcionários:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao listar funcionários',
      });
    }
  },

  // Detalhes de um funcionário
  async detalhes(req: Request, res: Response) {
    try {
      const { companyId } = req.tenant;
      const { id } = req.params;

      const funcionario = await funcionariosService.buscarPorId(companyId, id);

      if (!funcionario) {
        throw new AppError('Funcionário não encontrado', 404);
      }

      res.json({
        success: true,
        data: funcionario,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Erro ao buscar funcionário:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao buscar funcionário',
        });
      }
    }
  },

  // Criar funcionário
  async criar(req: Request, res: Response) {
    try {
      const { companyId } = req.tenant;
      const { userId } = req.user;
      const { userRole } = req.user;

      // Apenas owner e admin podem criar
      if (userRole !== 'owner' && userRole !== 'admin_platform') {
        throw new AppError('Sem permissão para criar funcionários', 403);
      }

      const funcionario = await funcionariosService.criar(
        companyId,
        req.body,
        userId
      );

      res.status(201).json({
        success: true,
        data: funcionario,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Erro ao criar funcionário:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao criar funcionário',
        });
      }
    }
  },

  // Atualizar funcionário
  async atualizar(req: Request, res: Response) {
    try {
      const { companyId } = req.tenant;
      const { userId } = req.user;
      const { userRole } = req.user;
      const { id } = req.params;

      // Apenas owner e admin podem atualizar
      if (userRole !== 'owner' && userRole !== 'admin_platform') {
        throw new AppError('Sem permissão para atualizar funcionários', 403);
      }

      const funcionario = await funcionariosService.atualizar(
        companyId,
        id,
        req.body,
        userId
      );

      res.json({
        success: true,
        data: funcionario,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Erro ao atualizar funcionário:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao atualizar funcionário',
        });
      }
    }
  },

  // Desativar funcionário
  async desativar(req: Request, res: Response) {
    try {
      const { companyId } = req.tenant;
      const { userId } = req.user;
      const { userRole } = req.user;
      const { id } = req.params;

      // Apenas owner e admin podem desativar
      if (userRole !== 'owner' && userRole !== 'admin_platform') {
        throw new AppError('Sem permissão para desativar funcionários', 403);
      }

      await funcionariosService.desativar(companyId, id, userId);

      res.json({
        success: true,
        message: 'Funcionário desativado com sucesso',
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Erro ao desativar funcionário:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao desativar funcionário',
        });
      }
    }
  },

  // Reativar funcionário
  async reativar(req: Request, res: Response) {
    try {
      const { companyId } = req.tenant;
      const { userId } = req.user;
      const { userRole } = req.user;
      const { id } = req.params;

      // Apenas owner e admin podem reativar
      if (userRole !== 'owner' && userRole !== 'admin_platform') {
        throw new AppError('Sem permissão para reativar funcionários', 403);
      }

      await funcionariosService.reativar(companyId, id, userId);

      res.json({
        success: true,
        message: 'Funcionário reativado com sucesso',
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Erro ao reativar funcionário:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao reativar funcionário',
        });
      }
    }
  },
};
```

---

## 🔧 PASSO 3: SERVICE DE FUNCIONÁRIOS

### `backend/src/services/funcionarios.service.ts`

```typescript
import { db, admin } from '../config/firebase.config';
import { AppError } from '../utils/AppError';

export const funcionariosService = {
  // Listar funcionários
  async listar(companyId: string, apenasAtivos: boolean = true) {
    const funcionariosRef = db.collection(`companies/${companyId}/funcionarios`);
    
    let query = funcionariosRef.orderBy('nome', 'asc');
    
    if (apenasAtivos) {
      query = query.where('deletedAt', '==', null);
    }

    const snapshot = await query.get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Buscar por ID
  async buscarPorId(companyId: string, funcionarioId: string) {
    const doc = await db
      .collection(`companies/${companyId}/funcionarios`)
      .doc(funcionarioId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    };
  },

  // Criar funcionário
  async criar(companyId: string, data: any, userId: string) {
    const { nome, funcao, email, senha, diariaBase, cpf, telefone, tipoContrato } = data;

    // 1. Criar usuário no Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password: senha,
      displayName: nome,
    });

    // 2. Criar documento no Firestore
    const funcionarioRef = db.collection(`companies/${companyId}/funcionarios`).doc();

    await funcionarioRef.set({
      userId: userRecord.uid,
      nome,
      funcao,
      email,
      diariaBase: diariaBase || 150,
      cpf: cpf || null,
      telefone: telefone || null,
      tipoContrato: tipoContrato || 'diaria',
      deletedAt: null,
      pagoDia: null,
      companyId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: userId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: userId,
    });

    // 3. Criar documento de usuário
    await db.collection('users').doc(userRecord.uid).set({
      email,
      name: nome,
      role: 'user',
      companyId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      id: funcionarioRef.id,
      userId: userRecord.uid,
      nome,
      funcao,
      email,
    };
  },

  // Atualizar funcionário
  async atualizar(companyId: string, funcionarioId: string, data: any, userId: string) {
    const { nome, funcao, diariaBase, cpf, telefone, tipoContrato } = data;

    const funcionarioRef = db
      .collection(`companies/${companyId}/funcionarios`)
      .doc(funcionarioId);

    const doc = await funcionarioRef.get();

    if (!doc.exists) {
      throw new AppError('Funcionário não encontrado', 404);
    }

    await funcionarioRef.update({
      nome,
      funcao,
      diariaBase,
      cpf: cpf || null,
      telefone: telefone || null,
      tipoContrato: tipoContrato || 'diaria',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: userId,
    });

    return {
      id: funcionarioId,
      ...data,
    };
  },

  // Desativar funcionário (soft delete)
  async desativar(companyId: string, funcionarioId: string, userId: string) {
    const funcionarioRef = db
      .collection(`companies/${companyId}/funcionarios`)
      .doc(funcionarioId);

    const doc = await funcionarioRef.get();

    if (!doc.exists) {
      throw new AppError('Funcionário não encontrado', 404);
    }

    await funcionarioRef.update({
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      deletedBy: userId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: userId,
    });
  },

  // Reativar funcionário
  async reativar(companyId: string, funcionarioId: string, userId: string) {
    const funcionarioRef = db
      .collection(`companies/${companyId}/funcionarios`)
      .doc(funcionarioId);

    const doc = await funcionarioRef.get();

    if (!doc.exists) {
      throw new AppError('Funcionário não encontrado', 404);
    }

    await funcionarioRef.update({
      deletedAt: null,
      deletedBy: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: userId,
    });
  },
};
```

---

## 🔧 PASSO 4: VALIDATORS

### `backend/src/validators/funcionarios.validator.ts`

```typescript
import Joi from 'joi';

export const criarFuncionarioSchema = Joi.object({
  nome: Joi.string().required().min(3).max(100),
  funcao: Joi.string().required().min(3).max(50),
  email: Joi.string().email().required(),
  senha: Joi.string().required().min(6),
  diariaBase: Joi.number().positive().optional(),
  cpf: Joi.string().pattern(/^\d{11}$/).optional(),
  telefone: Joi.string().pattern(/^\d{10,11}$/).optional(),
  tipoContrato: Joi.string().valid('diaria', 'mensal', 'horista').optional(),
});

export const atualizarFuncionarioSchema = Joi.object({
  nome: Joi.string().min(3).max(100).optional(),
  funcao: Joi.string().min(3).max(50).optional(),
  diariaBase: Joi.number().positive().optional(),
  cpf: Joi.string().pattern(/^\d{11}$/).optional(),
  telefone: Joi.string().pattern(/^\d{10,11}$/).optional(),
  tipoContrato: Joi.string().valid('diaria', 'mensal', 'horista').optional(),
});
```

---

## 🔧 PASSO 5: REGISTRAR ROTAS

### `backend/src/routes/index.ts`

```typescript
import { Router } from 'express';
import funcionariosRoutes from './funcionarios.routes';
import relatoriosRoutes from './relatorios.routes';
// ... outras rotas

const router = Router();

router.use('/funcionarios', funcionariosRoutes);
router.use('/relatorios', relatoriosRoutes);
// ... outras rotas

export default router;
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

- [ ] Rotas criadas e registradas
- [ ] Controllers implementados
- [ ] Services implementados
- [ ] Validators implementados
- [ ] Middleware de autenticação funcionando
- [ ] Middleware de tenant funcionando
- [ ] Testes unitários criados
- [ ] Testes de integração criados
- [ ] Documentação API atualizada
- [ ] Postman collection atualizada

---

## 🧪 TESTES COM POSTMAN

### Criar Funcionário
```http
POST http://localhost:5000/api/funcionarios
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "João Silva",
  "funcao": "Operador de Carga",
  "email": "joao@empresa.com",
  "senha": "senha123",
  "diariaBase": 150,
  "cpf": "12345678901",
  "telefone": "62999999999",
  "tipoContrato": "diaria"
}
```

### Listar Funcionários
```http
GET http://localhost:5000/api/funcionarios
Authorization: Bearer {token}
```

### Desativar Funcionário
```http
PUT http://localhost:5000/api/funcionarios/{id}/desativar
Authorization: Bearer {token}
```

---

## 📝 PRÓXIMOS PASSOS

1. Implementar rotas de relatórios (similar)
2. Criar testes automatizados
3. Adicionar rate limiting
4. Implementar cache (Redis)
5. Adicionar logs estruturados

---

**Tempo Estimado**: 6h  
**Dificuldade**: Média  
**Prioridade**: CRÍTICA (MUST HAVE)

**Versão**: Alpha 10.1.0  
**Data**: 29/01/2026
