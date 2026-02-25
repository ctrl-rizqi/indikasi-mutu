import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import auth from './routes/auth'
import master from './routes/master'
import jadwal from './routes/jadwal'
import transaksi from './routes/transaksi'
import laporan from './routes/laporan'
import health from './routes/health'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('/api/*', cors())

app.route('/api/health', health)
app.route('/api/auth', auth)
app.route('/api/master', master)
app.route('/api/jadwal', jadwal)
app.route('/api/transaksi', transaksi)
app.route('/api/laporan', laporan)

const port = 5000
console.log(`Server is running on port ${port}`)

serve({
    fetch: app.fetch,
    port
})
