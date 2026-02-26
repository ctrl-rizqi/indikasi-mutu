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

const app = new Hono()

app.use('/api/*', cors())

app.route('/api/health', health)
app.route('/api/auth', auth)
app.route('/api/items', items)
app.route('/api/categories', categories)
app.route('/api/activities', activities)
app.route('/api/laporan', laporan)

const port = 5000
console.log(`Server is running on port ${port}`)

serve({
    fetch: app.fetch,
    port
})
