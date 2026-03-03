import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useCallback } from 'react'
import type { LaporanApiResponse } from '../hooks/laporan.indikator'
import { useLaporanIndikatorQuery } from '../hooks/laporan.indikator'
import { useTugasItemsQuery } from '../hooks/tugas.activities'
import ProtectedRoute from '../components/ProtectedRoute'
import {
  Box,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material'
import { FileBarChart, RefreshCw, Calendar, Filter } from 'lucide-react'

export const Route = createFileRoute('/laporan')({
  component: RouteComponent,
})

// Constants moved outside component to avoid recreation
const DEFAULT_LAPORAN: LaporanApiResponse = {
  meta: {
    contractVersion: 2,
    generatedAt: new Date(0).toISOString(),
    filters: {
      itemId: null,
    },
  },
  summary: {
    totalActivities: 0,
    uniqueItems: 0,
    uniqueCategories: 0,
    enumerator: 0,
    denumerator: 0,
    complianceRate: 0,
  },
  breakdowns: {
    byCategory: [],
    byCondition: [],
  },
  trend: {
    daily: [],
  },
  history: [],
}

const DEFAULT_CATEGORY = { categoryId: '-', categoryName: '-', count: 0 }
const DEFAULT_CONDITION = { condition: '-', count: 0 }

// Utility function moved outside component
const formatCheckedAt = (value: string): string =>
  new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

// Reusable table components
function TrendTable({
  trend,
}: {
  trend: Array<{ date: string; count: number }>
}) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>TANGGAL</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>AKTIVITAS</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trend.map((entry) => (
            <TableRow key={entry.date} hover>
              <TableCell>{entry.date}</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                {entry.count}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

interface HistoryEntry {
  id: string
  checkedAt: string
  condition: string
  categoryName: string
  note: string | null
}

function HistoryTable({ history }: { history: HistoryEntry[] }) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>WAKTU</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>KONDISI</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>KATEGORI</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>CATATAN</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {history.map((entry) => (
            <TableRow key={entry.id} hover>
              <TableCell sx={{ fontSize: '0.75rem' }}>
                {formatCheckedAt(entry.checkedAt)}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={entry.condition}
                  color={entry.condition === 'baik' ? 'success' : 'error'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{entry.categoryName}</TableCell>
              <TableCell sx={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
                {entry.note ?? '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

interface BreakdownEntry {
  count: number
  condition?: string
  categoryName?: string
}

function BreakdownList({
  data,
  totalActivities,
}: {
  data: BreakdownEntry[]
  totalActivities: number
}) {
  return (
    <Stack spacing={3}>
      {data.map((entry) => {
        const label =
          'condition' in entry && entry.condition
            ? entry.condition
            : entry.categoryName || '-'
        const percentageValue = totalActivities
          ? (entry.count / totalActivities) * 100
          : 0
        const percentageDisplay = percentageValue.toFixed(1)

        return (
          <Box key={label}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="body2" fontWeight="bold">
                {label}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
              >
                {entry.count} ({percentageDisplay}%)
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(percentageValue, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(255, 255, 255, 0.05)',
              }}
            />
          </Box>
        )
      })}
    </Stack>
  )
}

export default function RouteComponent() {
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(
    undefined,
  )
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const { data: items = [] } = useTugasItemsQuery()
  const { data, isLoading, error, refetch } = useLaporanIndikatorQuery(
    selectedItemId,
    startDate,
    endDate,
  )

  // Memoized derived values
  const laporan = data ?? DEFAULT_LAPORAN

  const { byCategory, byCondition, trend, history } = useMemo(
    () => ({
      byCategory: Array.isArray(laporan.breakdowns.byCategory)
        ? laporan.breakdowns.byCategory
        : [],
      byCondition: Array.isArray(laporan.breakdowns.byCondition)
        ? laporan.breakdowns.byCondition
        : [],
      trend: Array.isArray(laporan.trend.daily) ? laporan.trend.daily : [],
      history: Array.isArray(laporan.history) ? laporan.history : [],
    }),
    [laporan],
  )

  const selectedItemName = useMemo(
    () => items.find((item) => item.id === selectedItemId)?.name,
    [items, selectedItemId],
  )

  const dominantCategory = useMemo(
    () =>
      byCategory.reduce(
        (max, category) => (category.count > max.count ? category : max),
        DEFAULT_CATEGORY,
      ),
    [byCategory],
  )

  const dominantCondition = useMemo(
    () =>
      byCondition.reduce(
        (max, condition) => (condition.count > max.count ? condition : max),
        DEFAULT_CONDITION,
      ),
    [byCondition],
  )

  const {
    currentBreakdown,
    currentBreakdownTitle,
    currentHighlightTitle,
    currentHighlightValue,
  } = useMemo(() => {
    const isItemSelected = !!selectedItemId
    return {
      currentBreakdown: isItemSelected ? byCondition : byCategory,
      currentBreakdownTitle: isItemSelected
        ? 'Distribusi Kondisi'
        : 'Distribusi Kategori',
      currentHighlightTitle: isItemSelected
        ? `Kondisi Terbanyak (${dominantCondition.condition})`
        : `Kategori Terbanyak (${dominantCategory.categoryName})`,
      currentHighlightValue: isItemSelected
        ? dominantCondition.count
        : dominantCategory.count,
    }
  }, [
    selectedItemId,
    byCondition,
    byCategory,
    dominantCondition,
    dominantCategory,
  ])

  // Event handlers
  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <ProtectedRoute>
      <Box sx={{ p: { xs: 3, md: 6 }, maxWidth: '1200px', mx: 'auto' }}>
        <Stack spacing={4}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{ p: 4, borderRadius: 3 }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: 4,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <FileBarChart color="#3b82f6" size={32} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    Laporan Indikator Mutu
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ringkasan Kepatuhan Pemeliharaan Rutin Aset
                  </Typography>
                </Box>
              </Stack>

              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  width: { xs: '100%', md: 'auto' },
                }}
              >
                <TextField
                  type="date"
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                />
                <TextField
                  type="date"
                  size="small"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                />

                <FormControl
                  size="small"
                  sx={{ minWidth: 200, width: { xs: '100%', sm: 'auto' } }}
                >
                  <InputLabel shrink>Filter Item</InputLabel>
                  <Select
                    value={selectedItemId || ''}
                    label="Filter Item"
                    onChange={(e) =>
                      setSelectedItemId(e.target.value || undefined)
                    }
                    displayEmpty
                    notched
                  >
                    <MenuItem value="">Semua Item</MenuItem>
                    {items.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <IconButton
                  onClick={handleRefresh}
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <RefreshCw size={20} />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ mt: 6 }}>
              {isLoading ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 10,
                    gap: 2,
                  }}
                >
                  <CircularProgress size={48} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight="medium"
                  >
                    Mengambil data statistik terbaru...
                  </Typography>
                </Box>
              ) : error ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                  <Typography variant="h6" color="error" fontWeight="bold">
                    Error
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {error.message}
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={6}>
                  {/* Stats Grid */}
                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          bgcolor: 'rgba(255, 255, 255, 0.01)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight="bold"
                          color="text.secondary"
                          sx={{
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Enumerator
                        </Typography>
                        <Typography
                          variant="h3"
                          fontWeight="bold"
                          sx={{ mt: 1 }}
                        >
                          {laporan.summary.totalActivities}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 1 }}
                        >
                          Seluruh log aktivitas sesuai filter
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          bgcolor: 'rgba(255, 255, 255, 0.01)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight="bold"
                          color="text.secondary"
                          sx={{
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Denumerator
                        </Typography>
                        <Typography
                          variant="h3"
                          fontWeight="bold"
                          sx={{ mt: 1 }}
                        >
                          {laporan.summary.uniqueCategories}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 1 }}
                        >
                          Jumlah kategori unik yang tercatat
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          bgcolor: 'primary.soft',
                          border: '1px solid',
                          borderColor: 'primary.main',
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight="bold"
                          color="primary.main"
                          sx={{
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {currentHighlightTitle}
                        </Typography>
                        <Typography
                          variant="h3"
                          fontWeight="bold"
                          color="primary.main"
                          sx={{ mt: 1 }}
                        >
                          {currentHighlightValue}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="primary.main"
                          display="block"
                          sx={{ mt: 1, fontWeight: 'medium' }}
                        >
                          Breakdown terbanyak saat ini
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Grid container spacing={4}>
                    {/* Breakdown Card */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                      <Paper
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                          overflow: 'hidden',
                          height: '100%',
                        }}
                      >
                        <Box
                          sx={{
                            p: 3,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'rgba(255, 255, 255, 0.02)',
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Filter size={20} color="#3b82f6" />
                            <Typography variant="subtitle1" fontWeight="bold">
                              {currentBreakdownTitle}
                            </Typography>
                          </Stack>
                        </Box>
                        <Box sx={{ p: 3 }}>
                          {currentBreakdown.length === 0 ? (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ textAlign: 'center', py: 4 }}
                            >
                              Belum ada data breakdown
                            </Typography>
                          ) : (
                            <BreakdownList
                              data={currentBreakdown}
                              totalActivities={laporan.summary.totalActivities}
                            />
                          )}
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Trend Card */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                      <Paper
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                          overflow: 'hidden',
                          height: '100%',
                        }}
                      >
                        <Box
                          sx={{
                            p: 3,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'rgba(255, 255, 255, 0.02)',
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Calendar size={20} color="#3b82f6" />
                            <Typography variant="subtitle1" fontWeight="bold">
                              Tren Harian
                            </Typography>
                          </Stack>
                        </Box>
                        <Box sx={{ p: 0 }}>
                          {trend.length === 0 ? (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ textAlign: 'center', py: 8 }}
                            >
                              Belum ada data tren
                            </Typography>
                          ) : (
                            <TrendTable trend={trend} />
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* History Section for Selected Item */}
                  {selectedItemId && (
                    <Paper
                      variant="outlined"
                      sx={{ borderRadius: 3, overflow: 'hidden' }}
                    >
                      <Box
                        sx={{
                          p: 3,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'rgba(255, 255, 255, 0.02)',
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          Riwayat Pemeriksaan Item
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedItemName} - {history.length} riwayat
                          ditemukan
                        </Typography>
                      </Box>
                      <Box sx={{ p: 0 }}>
                        {history.length === 0 ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textAlign: 'center', py: 8 }}
                          >
                            Belum ada riwayat pemeriksaan untuk item ini
                          </Typography>
                        ) : (
                          <HistoryTable history={history} />
                        )}
                      </Box>
                    </Paper>
                  )}
                </Stack>
              )}
            </Box>
          </Paper>
        </Stack>
      </Box>
    </ProtectedRoute>
  )
}
