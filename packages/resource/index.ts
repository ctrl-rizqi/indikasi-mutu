export const ROLE = {
  ADMIN: 'ADMIN',
  PETUGAS: 'PETUGAS'
} as const

export type Role = (typeof ROLE)[keyof typeof ROLE]

export const ASSET_TYPE = {
  AC: 'AC',
  APAR: 'APAR',
  HYDRANT: 'HYDRANT'
} as const

export type AssetType = (typeof ASSET_TYPE)[keyof typeof ASSET_TYPE]

export const STATUS_PELAKSANAAN = {
  TEPAT_WAKTU: 'TEPAT_WAKTU',
  TERLAMBAT: 'TERLAMBAT'
} as const

export type StatusPelaksanaan = (typeof STATUS_PELAKSANAAN)[keyof typeof STATUS_PELAKSANAAN]

export interface User {
  id: string
  username: string
  password: string
  role: Role
  createdAt: Date
  updatedAt: Date
  jadwals?: Jadwal[]
}

export interface Asset {
  id: string
  name: string
  type: AssetType
  location: string
  createdAt: Date
  updatedAt: Date
  jadwals?: Jadwal[]
}

export interface Jadwal {
  id: string
  assetId: string
  asset?: Asset
  petugasId: string
  petugas?: User
  plannedDate: Date
  createdAt: Date
  updatedAt: Date
  transaksi?: Transaksi | null
}

export interface Transaksi {
  id: string
  jadwalId: string
  jadwal?: Jadwal
  actualDate: Date
  hasilFisik: string
  status: StatusPelaksanaan
  createdAt: Date
}
