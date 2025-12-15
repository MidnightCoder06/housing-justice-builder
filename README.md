# Housing Justice Builder

AI-powered legal document analysis and generation for housing notices.

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
OPENAI_API_KEY=sk-your-openai-api-key
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key. Get one at [platform.openai.com](https://platform.openai.com/api-keys) |
| `DATABASE_URL` | PostgreSQL connection string for [Neon](https://neon.tech) database. Used to store vector store IDs and file metadata. |

## To Run Locally

1. `npm install`
2. Create `.env` file with required variables (see above)
3. `npm run dev`
