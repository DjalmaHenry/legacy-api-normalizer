# Legacy API Normalizer

API REST para processar arquivos de pedidos legados e normalizar dados.

## Tecnologias

- **Node.js** + **TypeScript**
- **Fastify** (framework web)
- **SQLite** (banco de dados)
- **Zod** (validação de schemas)
- **Swagger** (documentação)
- **Jest** (testes)
- **Esbuild** (build)
- **ESLint** + **Prettier** (qualidade de código)

## Fluxograma da API

<img width="162" alt="Captura de Tela 2025-06-24 às 17 05 33" src="https://github.com/user-attachments/assets/f80913bc-dc78-4203-8fd1-a7b091144599" />

## Arquitetura

### Arquitetura em Camadas

O projeto segue uma arquitetura em camadas, onde cada camada tem responsabilidades específicas e se comunica através de interfaces:

#### **Camada de Apresentação:**

##### `routes/`

- **`orders.routes.ts`**: Define as rotas HTTP e configura a injeção de dependências
- **Responsabilidade**: Configuração de endpoints, schemas de validação e documentação Swagger
- **Fluxo**: Recebe requisições HTTP → Injeta dependências → Delega para Controllers

##### `controllers/`

- **`orders.controller.ts`**: Controlador que gerencia requisições HTTP
- **Responsabilidade**: Validação de entrada, extração de dados do request, tratamento de erros HTTP
- **Dependências**: Recebe `IOrderProcessor` via injeção de dependência
- **Fluxo**: Valida arquivo → Extrai conteúdo → Chama service → Retorna resposta HTTP

##### `schemas/`

- **`upload.schema.ts`**: Schemas Zod para validação de dados
- **Responsabilidade**: Definição de contratos de entrada e saída da API

#### **Camada de Negócio:**

##### `services/`

Contém a lógica de negócio principal, cada service implementa uma responsabilidade específica:

- **`order-processor.service.ts`**: Orquestrador principal

  - **Implementa**: `IOrderProcessor`
  - **Dependências**: `IOrderParser`, `IOrderFilter`, `IOrderCalculator`, `IPersistenceService`
  - **Responsabilidade**: Coordena todo o fluxo de processamento

- **`order-filter.service.ts`**: Filtros de dados

  - **Implementa**: `IOrderFilter`
  - **Responsabilidade**: Aplicação de regras de filtro nos pedidos

- **`order-calculator.service.ts`**: Cálculos de totais

  - **Implementa**: `IOrderCalculator`
  - **Responsabilidade**: Cálculo de totais de pedidos

- **`persistence.service.ts`**: Persistência de dados
  - **Implementa**: `IPersistenceService`
  - **Dependências**: `Database` (Singleton)
  - **Responsabilidade**: Salvar dados processados no banco

##### `utils/`

- **`parser.ts`**: Utilitário de parsing
  - **Implementa**: `IOrderParser`
  - **Responsabilidade**: Análise e validação de linhas do arquivo
- **`constants.ts`**: Constantes da aplicação

#### **Camada de Dados:**

##### `database/`

- **`database.ts`**: Classe Singleton para acesso ao SQLite
- **Responsabilidade**: Conexão com banco, criação de tabelas, operações CRUD
- **Padrão**: Singleton para garantir uma única instância de conexão

#### **Camada de Contratos:**

##### `interfaces/`

Define abstrações que permitem baixo acoplamento entre camadas:

- **`orders.interface.ts`**: Contratos para processamento de pedidos
  - `IOrderProcessor`, `IOrderFilter`, `IOrderCalculator`
- **`parser.interface.ts`**: Contratos para parsing
  - `IOrderParser`, `IFieldValidator`
- **`persistence.interface.ts`**: Contrato para persistência
  - `IPersistenceService`

##### `models/`

- **`order.model.ts`**: Definição de tipos e modelos de dados
- **Responsabilidade**: DTOs e estruturas de dados compartilhadas

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
## Deploy

A API foi implantada na plataforma Fly.io e está disponível no seguinte endereço:
https://legacy-api-normalizer-bitter-dust-7197.fly.dev/

## API

### POST /orders/upload

Endpoint para upload de arquivo `.txt` com dados de pedidos legados e retorna dados normalizados em JSON.

#### Como usar:

##### Usando Postman ou Insomnia:

1. Abra o Postman ou Insomnia
2. Crie uma nova requisição do tipo POST
3. Insira a URL: `https://legacy-api-normalizer-bitter-dust-7197.fly.dev/orders/upload` 
   (caso esteja rodando localmente, use `http://localhost:3000/orders/upload`)
4. Na seção "Body", selecione a opção "form-data" (Postman) ou "Multipart Form" (Insomnia)
5. Adicione um campo com a chave `file` e selecione o tipo "File"
6. Clique no botão para selecionar o arquivo e escolha seu arquivo .txt
7. Envie a requisição

```bash
curl -X POST \
  http://localhost:3000/orders/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@orders.txt"
```

#### Formato de entrada (.txt):

Cada linha do arquivo deve ter exatamente 95 caracteres com campos de tamanho fixo:

```bash
000000058                                  Dewey Crona00000005670000000001      1328.520211001
0000000118                                Robena Raynor00000010950000000006     1544.6620211212
0000000180                                    Judi Lowe00000016750000000004      359.9820210820
```

#### Formato de saída (JSON):

```json
[
  {
    "user_id": 1,
    "name": "João Silva",
    "orders": [
      {
        "order_id": 1,
        "total": "180.23",
        "date": "2023-01-01",
        "products": [
          {
            "product_id": 1,
            "value": "123.45"
          },
          {
            "product_id": 2,
            "value": "56.78"
          }
        ]
      }
    ]
  },
  {
    "user_id": 2,
    "name": "Maria Souza",
    "orders": [
      {
        "order_id": 2,
        "total": "99.99",
        "date": "2023-02-02",
        "products": [
          {
            "product_id": 3,
            "value": "99.99"
          }
        ]
      }
    ]
  }
]
```

#### Respostas:

- **200**: Array de usuários com pedidos normalizados
- **400**: Erro de validação ou processamento

## Documentação

A documentação da API está disponível via Swagger em `/docs` quando o servidor estiver rodando.

## Banco de Dados

Utiliza SQLite com as seguintes tabelas:

### Tabela `users`

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT
)
```

### Tabela `orders`

```sql
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  total TEXT,
  date TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

### Tabela `products`

```sql
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  product_id INTEGER,
  value TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id)
)
```
