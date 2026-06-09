# atividade-cache

API REST para gerenciamento de postagens, construída com **Node.js**, **Express**, **MongoDB** e **Redis**. Implementa uma camada de cache manual sobre o Redis para otimizar requisições de leitura.

---

## Tecnologias

- [Node.js](https://nodejs.org/) (v18+, com suporte a ESModules e `--env-file`)
- [Express](https://expressjs.com/) v5
- [MongoDB](https://www.mongodb.com/) com [Mongoose](https://mongoosejs.com/)
- [Redis](https://redis.io/) com o cliente oficial [`redis`](https://www.npmjs.com/package/redis) v6
- [compression](https://www.npmjs.com/package/compression) — middleware de compressão gzip

---

## Por que não foi usada a biblioteca `express-redis-cache`

O enunciado da atividade sugeria o uso de `express-redis-cache`. A biblioteca foi avaliada e descartada pelos seguintes motivos:

- **Abandonada:** o pacote não recebe atualizações desde 2016 e é incompatível com versões modernas do cliente Redis (`redis` v4+), que migrou para uma API baseada em Promises.
- **Incompatível com ESModules:** o projeto usa `"type": "module"` no `package.json`, e `express-redis-cache` não oferece suporte a `import`/`export`.
- **Sem necessidade:** a camada de cache foi implementada manualmente em `src/middleware/cache.js` com o mesmo comportamento esperado — interceptação da resposta, armazenamento no Redis com TTL e invalidação por padrão de chave — sem adicionar uma dependência obsoleta.

---

## Pré-requisitos

Antes de executar o projeto, instale e certifique-se de que os seguintes serviços estão rodando localmente:

### MongoDB

Baixe e instale o MongoDB Community Edition:

- [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

Após a instalação, inicie o serviço:

```bash
# Linux/macOS
mongod --dbpath /data/db

# Windows (via serviço instalado)
net start MongoDB
```

Por padrão, o MongoDB escuta em `localhost:27017`.

### Redis (ou Memurai no Windows)

**Linux/macOS:**

```bash
# Via apt (Ubuntu/Debian)
sudo apt install redis-server
sudo service redis start

# Via Homebrew (macOS)
brew install redis
brew services start redis
```

**Windows:** o Redis não tem suporte oficial. Use o [Memurai](https://www.memurai.com/), que é um port nativo do Redis para Windows:

- [memurai.com](https://www.memurai.com/)

Após a instalação, o Memurai inicia automaticamente como serviço Windows e escuta em `localhost:6379`.

---

## Instalação e execução

```bash
# 1. Clone o repositório
git clone https://github.com/victorCNeves/atividade-cache.git
cd atividade-cache

# 2. Instale as dependências
npm install

# 3. Crie o arquivo de variáveis de ambiente
cp .env.example .env
```

Edite o arquivo `.env` com os valores do seu ambiente:

```env
PORT=3000

MONGO_URI=mongodb://localhost:27017/post_db

REDIS_HOST=localhost
REDIS_PORT=6379
```

```bash
# 4. Inicie a aplicação em modo desenvolvimento
npm run dev
```

A API estará disponível em `http://localhost:3000`.

> **Requisito de runtime:** o comando `npm run dev` usa a flag `--env-file` do Node.js, disponível a partir da versão **20.6.0**. Certifique-se de ter uma versão igual ou superior instalada (`node --version`).

---

## Estrutura do projeto

```
atividade-cache/
├── src/
│   ├── app.js                   # Entry point — inicializa Express, DB e rotas
│   ├── config/
│   │   ├── db.js                # Conexão com o MongoDB via Mongoose
│   │   └── redis.js             # Instância do cliente Redis
│   ├── controller/
│   │   └── postController.js    # Lógica de negócio dos endpoints
│   ├── middleware/
│   │   ├── bodyValidator.js     # Validação do corpo da requisição (POST)
│   │   ├── cache.js             # Middleware de cache via Redis
│   │   ├── errors.js            # Handler global de erros
│   │   ├── idValidator.js       # Validação de ObjectId do MongoDB
│   │   └── queryValidator.js    # Validação dos query params (GET /posts)
│   ├── model/
│   │   └── Post.js              # Schema Mongoose da entidade Post
│   └── routes/
│       └── routes.js            # Definição das rotas da API
├── .env                         # Variáveis de ambiente (não versionado)
├── .env.example                 # Exemplo de configuração
├── .gitignore
└── package.json
```

---

## Endpoints

Base URL: `http://localhost:3000`

---

### `GET /posts`

Retorna todas as postagens. Suporta filtragem por `title` e/ou `author` via query string. **Utiliza cache Redis** com TTL de 60 segundos — a chave de cache é derivada da URL completa (incluindo query params), portanto cada combinação de filtros é cacheada independentemente.

**Query params opcionais:**

| Parâmetro | Tipo   | Descrição                                                                    |
| --------- | ------ | ---------------------------------------------------------------------------- |
| `title`   | string | Filtra postagens cujo título começa com o valor informado (case-insensitive) |
| `author`  | string | Filtra postagens cujo autor começa com o valor informado (case-insensitive)  |

**Exemplos de requisição:**

```http
GET /posts
GET /posts?title=node
GET /posts?author=victor
GET /posts?title=intro&author=victor
```

**Resposta de sucesso — `200 OK`:**

```json
[
  {
    "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "title": "Introdução ao Node.js",
    "content": "Node.js é um runtime JavaScript...",
    "author": "Victor",
    "createdAt": "2024-09-23T12:00:00.000Z",
    "updatedAt": "2024-09-23T12:00:00.000Z"
  }
]
```

**Resposta de erro — `400 Bad Request`** (query param enviado mas vazio):

```json
{ "error": "O parâmetro 'title' não pode ser vazio." }
```

---

### `GET /posts/:id`

Retorna uma única postagem pelo seu ID. Não utiliza cache — a busca é feita diretamente no MongoDB.

**Parâmetro de rota:**

| Parâmetro | Tipo   | Descrição           |
| --------- | ------ | ------------------- |
| `id`      | string | ObjectId do MongoDB |

**Exemplo de requisição:**

```http
GET /posts/66f1a2b3c4d5e6f7a8b9c0d1
```

**Resposta de sucesso — `200 OK`:**

```json
{
  "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "title": "Introdução ao Node.js",
  "content": "Node.js é um runtime JavaScript...",
  "author": "Victor",
  "createdAt": "2024-09-23T12:00:00.000Z",
  "updatedAt": "2024-09-23T12:00:00.000Z"
}
```

**Respostas de erro:**

| Status | Corpo                                     | Causa                       |
| ------ | ----------------------------------------- | --------------------------- |
| `400`  | `{ "error": "ID inválido." }`             | ID não é um ObjectId válido |
| `404`  | `{ "error": "Postagem não encontrada." }` | Nenhum post com esse ID     |

---

### `POST /posts`

Cria uma nova postagem. Ao criar com sucesso, **invalida todo o cache** de listagem no Redis (todas as chaves com prefixo `cache:/posts*`), garantindo que a próxima leitura reflita os dados atualizados.

**Corpo da requisição (`application/json`):**

| Campo     | Tipo   | Obrigatório | Descrição            |
| --------- | ------ | ----------- | -------------------- |
| `title`   | string | Sim         | Título da postagem   |
| `content` | string | Sim         | Conteúdo da postagem |
| `author`  | string | Sim         | Nome do autor        |

**Exemplo de requisição:**

```http
POST /posts
Content-Type: application/json

{
  "title": "Introdução ao Node.js",
  "content": "Node.js é um runtime JavaScript construído sobre o V8...",
  "author": "Victor"
}
```

**Resposta de sucesso — `200 OK`:**

```json
{
  "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "title": "Introdução ao Node.js",
  "content": "Node.js é um runtime JavaScript construído sobre o V8...",
  "author": "Victor",
  "createdAt": "2024-09-23T12:00:00.000Z",
  "updatedAt": "2024-09-23T12:00:00.000Z"
}
```

**Resposta de erro — `400 Bad Request`** (campos ausentes, não-string ou vazios):

```json
{
  "errors": {
    "title": "O título é obrigatório.",
    "content": "O conteúdo é obrigatório.",
    "author": "O autor deve ser uma string."
  }
}
```

---

## Como o cache funciona

O middleware `cache.js` atua exclusivamente na rota `GET /posts` (incluindo variações com query params).

**Fluxo de leitura com cache:**

```
Requisição GET /posts
        │
        ▼
Middleware verifica chave "cache:/posts?..." no Redis
        │
   ┌────┴────────────────────────┐
   │ Cache HIT                   │ Cache MISS
   ▼                             ▼
Retorna JSON do Redis    Consulta o MongoDB
(sem tocar no banco)     Armazena resultado no Redis (TTL 60s)
                         Retorna JSON ao cliente
```

**Invalidação por escrita:** ao criar um post, o controller apaga do Redis todas as chaves que correspondem ao padrão `cache:/posts*`, forçando que a próxima leitura busque dados frescos no banco.

---

## Erros globais

O middleware `errors.js` captura exceções não tratadas nos controllers:

| Condição               | Status | Resposta                                                 |
| ---------------------- | ------ | -------------------------------------------------------- |
| `CastError` (Mongoose) | `400`  | `{ "error": "ID inválido." }`                            |
| Qualquer outro erro    | `500`  | `{ "error": "Ocorreu um erro inesperado no servidor." }` |
