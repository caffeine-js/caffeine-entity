# @caffeine/models

Biblioteca core do ecossistema **Caffeine.js** que fornece classes base, utilitários de validação de schema, DTOs reutilizáveis e helpers para construção de entidades de domínio.

## 📦 Instalação

```bash
bun install @caffeine/models
```

Ou, se estiver usando localmente no monorepo:

```bash
bun link @caffeine/models
```

## 🎯 O que este pacote fornece

### Classes Base & Core

Importados via `@caffeine/models`:

| Export | Descrição |
|--------|-----------|
| `Entity` | Classe abstrata base para entidades de domínio. Gerencia `id`, `createdAt` e `updatedAt` automaticamente. |
| `t` | Re-export do TypeBox para criação de schemas de validação. |

Importados via `@caffeine/models/schema`:

| Export | Descrição |
|--------|-----------|
| `Schema` | Wrapper para validação de schemas TypeBox com compilação otimizada e método `.map()`. |
| `SchemaManager` | Utilitário para construir e validar schemas a partir de strings JSON. |

### Domain & Value Objects

Importados via `@caffeine/models/value-objects`:

| Value Object | Descrição |
|--------------|-----------|
| `DefinedStringVO` | String que não pode ser nula, undefined ou vazia. |
| `StringArrayVO` | Array de strings único (Set) e ordenado. |
| `UuidVO` | Value Object para validação e tipagem de UUIDs v7. |
| `UuidArrayVO` | Array de UUIDs únicos. |
| `UrlVO` | Validação de URLs com suporte a protocolos (http/https). |

### DTOs (Data Transfer Objects)

#### DTOs de Aplicação

Importados via `@caffeine/models/dtos`:

| DTO | Descrição |
|-----|-----------|
| `EntityDTO` | Schema base para entidades (`id`, `createdAt`, `updatedAt`). |
| `IdObjectDTO` | Schema para query parameters por ID ({ id: string }). |
| `SlugObjectDTO` | Schema para query parameters por slug ({ slug: string }). |
| `PasswordDTO` | Schema para validação de senha. |

#### DTOs Primitivos

Importados via `@caffeine/models/dtos/primitives`:

| DTO | Descrição |
|-----|-----------|
| `BooleanDTO` | Schema para booleanos. |
| `NumberDTO` | Schema para números. |
| `StringDTO` | Schema para strings. |
| `StringArrayDTO` | Schema para arrays de strings. |
| `UrlDTO` | Schema para URLs. |
| `UuidDTO` | Schema para UUIDs. |
| `UuidArrayDTO` | Schema para arrays de UUIDs. |

#### DTOs de API

Importados via `@caffeine/models/dtos/api`:

| DTO | Descrição |
|-----|-----------|
| `AuthorizationDTO` | Schema para headers de autorização. |

### Factories

Importadas via `@caffeine/models/factories`:

| Factory | Descrição |
|---------|-----------|
| `makeEntityFactory` | Gera dados base de entidade com UUID v7 e timestamps. |
| `makeResponse` | Factory para padronizar respostas de API. |

### Helpers

Importados via `@caffeine/models/helpers`:

| Helper | Descrição |
|--------|-----------|
| `generateUUID` | Gera um UUID v7. |
| `slugify` | Converte uma string para slug (lowercase, sem caracteres especiais). |

### Types

Importados via `@caffeine/models/types`:

| Type | Descrição |
|------|-----------|
| `IEntity` | Interface base para entidades. |
| `IValueObjectMetadata` | Interface para metadados de Value Objects. |

## 🚀 Uso

### Criando uma Entidade

```typescript
import { Entity, t } from "@caffeine/models";
import { EntityDTO } from "@caffeine/models/dtos";
import { Schema } from "@caffeine/models/schema";

interface PostData {
  id: string;
  createdAt: string;
  updatedAt?: string;
  title: string;
  content: string;
}

class Post extends Entity<PostData> {
  private constructor(
    entity: EntityDTO,
    public readonly title: string,
    public readonly content: string
  ) {
    super(entity);
  }

  static make(data: PostData): Post {
    const entity = Entity.prepare(data);
    return new Post(entity, data.title, data.content);
  }
}
```

### Usando Value Objects

```typescript
import { UuidVO, StringArrayVO } from "@caffeine/models/value-objects";
import { generateUUID } from "@caffeine/models/helpers";

const id = generateUUID();
const uuidVO = UuidVO.make({ value: id });

const tags = StringArrayVO.make({ value: ["nodejs", "typescript", "nodejs"] });
console.log(tags.value); // ["nodejs", "typescript"] (duplicatas removidas)
```

### Validando com Schemas

```typescript
import { t } from "@caffeine/models";
import { Schema } from "@caffeine/models/schema";

const UserSchema = t.Object({
  name: t.String(),
  email: t.String({ format: "email" }),
  age: t.Number({ minimum: 18 }),
});

const schema = new Schema(UserSchema);

const isValid = schema.match({
  name: "John",
  email: "john@example.com",
  age: 25,
}); // true

// Mapeamento e Type Casting seguro
const userData = schema.map({
  name: "John",
  email: "john@example.com",
  age: "25" // String numérica
});
// userData.age será number (25)
```

## 📁 Estrutura de Exports

```
@caffeine/models
├── index.ts (Entity, t)
│
├── /schema
│   ├── Schema
│   └── SchemaManager
│
├── /value-objects
│   ├── DefinedStringVO
│   ├── StringArrayVO
│   ├── UrlVO
│   ├── UuidVO
│   └── UuidArrayVO
│
├── /dtos
│   ├── EntityDTO, IdObjectDTO, SlugObjectDTO, PasswordDTO
│   ├── /primitives (BooleanDTO, StringDTO, UuidDTO, ...)
│   └── /api (AuthorizationDTO)
│
├── /factories
│   ├── makeEntityFactory
│   └── makeResponse
│
├── /helpers
│   ├── generateUUID
│   └── slugify
│
└── /types
    ├── IEntity
    └── IValueObjectMetadata
```

## 🛠️ Scripts

| Script | Descrição |
|--------|-----------|
| `bun run build` | Compila o projeto para CJS e ESM. |
| `bun run test` | Executa os testes unitários. |
| `bun run test:coverage` | Executa os testes com cobertura. |
| `bun setup` | Compila e registra o pacote localmente via `bun link`. |

## 📄 Licença

Desenvolvido por [Alan Reis](https://hoyasumii.dev).
