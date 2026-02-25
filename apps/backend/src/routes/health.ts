import { Hono } from "hono";

const health = new Hono()

health.get('/', (c) => {
    return c.json({
        message: 'OK',
        timestamp: new Date().toISOString()
    })
})

export default health