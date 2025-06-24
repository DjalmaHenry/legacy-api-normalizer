# Legacy API Normalizer

API RESTful para processar arquivos de pedidos legados e normalizar dados.

## Tecnologias

- **Node.js** + **TypeScript**
- **Fastify** (framework web)
- **SQLite** (banco de dados)
- **Zod** (validação de schemas)
- **Swagger** (documentação)
- **Jest** (testes)
- **Esbuild** (build)
- **ESLint** + **Prettier** (qualidade de código)

## Arquitetura

### Padrões Arquiteturais
- **Arquitetura em Camadas**: Controllers → Services → Database
- **Princípios SOLID**:
  - **S** - Single Responsibility Principle: Cada classe tem uma única responsabilidade (ex: `OrderParser` apenas analisa linhas, `OrderCalculator` apenas calcula totais)
  - **O** - Open/Closed Principle: Classes abertas para extensão via interfaces (ex: `IOrderProcessor`, `IOrderFilter`)
  - **L** - Liskov Substitution Principle: Implementações podem ser substituídas sem quebrar o código (ex: qualquer implementação de `IOrderParser`)
  - **I** - Interface Segregation Principle: Interfaces específicas e focadas (ex: `IOrderCalculator`, `IOrderFilter`, `IFieldValidator`)
  - **D** - Dependency Inversion Principle: Dependências via abstrações/interfaces, não implementações concretas (ex: `OrdersController` depende de `IOrderProcessor`, `OrderProcessorService` recebe dependências via construtor)

### Padrões de Design
- **Dependency Injection**: Injeção de dependências via interfaces (ex: `OrdersController` constructor, `OrderProcessorService` constructor)
- **Singleton**: Classe `Database` com instância única (ex: `Database.getInstance()` em `database.ts`, `app.ts`, `persistence.service.ts`)
- **Strategy**: Diferentes estratégias de processamento via interfaces (ex: `OrderParser` implementa `IOrderParser`, `OrderFilterService` implementa `IOrderFilter`, `OrderCalculatorService` implementa `IOrderCalculator`)
- **Repository**: Abstração de acesso a dados via `IPersistenceService` (ex: `PersistenceService` implementa `IPersistenceService`, método `persistData()` em `persistence.service.ts`)

## Instalação

```bash
npm install

# Desenvolvimento
npm run dev
npm start

# Build
npm run build

# Testes
npm test
npm run test:watch
npm run test:coverage

# Qualidade
npm run lint
npm run lint:fix
npm run format
```