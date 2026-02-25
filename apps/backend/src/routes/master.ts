import { Hono } from 'hono'
import { prisma } from '../db'
import type { Asset } from '@repo/resource'

const master = new Hono()

type CreateAssetBody = Pick<Asset, 'name' | 'type' | 'location'>

master.get('/assets', async (c) => {
    const assets = await prisma.asset.findMany()
    return c.json(assets)
})

master.post('/assets', async (c) => {
    const { name, type, location } = await c.req.json<CreateAssetBody>()

    const newAsset = await prisma.asset.create({
        data: { name, type, location }
    })

    return c.json(newAsset, 201)
})

export default master
