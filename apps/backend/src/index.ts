import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
// Keep master only for auth users or legacy demo if needed
import laporan from './routes/laporan'
import health from './routes/health'
import auth from './routes/auth'
import items from './routes/items'
import categories from './routes/categories'
import activities from './routes/activities'
import { cors } from 'hono/cors'
import { authMiddleware } from './middleware/authMiddleware'

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}
const app = new Hono()

const configuredOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0)

app.use(
  '/api/*',
  cors({
    origin: (origin) => {
      if (!origin) {
        return '*'
      }

      if (configuredOrigins.length === 0) {
        return origin
      }

      return configuredOrigins.includes(origin) ? origin : undefined
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
  }),
)

// Apply authentication middleware to all protected route routers
items.use(authMiddleware);
categories.use(authMiddleware);
activities.use(authMiddleware);
laporan.use(authMiddleware);

app.route('/api/health', health)
app.route('/api/auth', auth)
app.route('/api/items', items)
app.route('/api/categories', categories)
app.route('/api/activities', activities)
app.route('/api/laporan', laporan)

const port = Number(process.env.PORT ?? 5000)
console.log(`Server is running on port ${port}`)

serve({
    fetch: app.fetch,
    port
})
