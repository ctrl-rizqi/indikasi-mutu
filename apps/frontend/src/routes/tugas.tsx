import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SubmitEvent } from 'react'
import {
  useTugasItemsQuery,
  useCreateActivityMutation,
} from '../hooks/tugas.activities'
import { useAuthStore } from '../store/authStore'
import ProtectedRoute from '../components/ProtectedRoute'
import { Search, ClipboardCheck, ChevronDown } from 'lucide-react'
import type { Item } from '@repo/resource'
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Stack,
  InputAdornment,
} from '@mui/material'

export const Route = createFileRoute('/tugas')({
  component: RouteComponent,
})

const KONDISI_OPTIONS = [
  { key: 'baik', label: 'Baik' },
  { key: 'rusak', label: 'Rusak' },
  { key: 'hilang', label: 'Hilang' },
] as const

const EMPTY_FORM = {
  kondisi: '',
  catatan: '',
}

type ActivityFormState = typeof EMPTY_FORM

function ItemActivityForm({
  itemId,
  userId,
}: {
  itemId: string
  userId?: string
}) {
  const createActivityMutation = useCreateActivityMutation()
  const [form, setForm] = useState<ActivityFormState>(EMPTY_FORM)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!submitSuccess) return

    const timeoutId = setTimeout(() => {
      setSubmitSuccess(false)
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [submitSuccess])

  const updateField = useCallback(
    (field: keyof ActivityFormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }))
    },
    [],
  )

  const handleSubmit = useCallback(
    async (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!userId) {
        setSubmitError('Pengguna tidak ditemukan. Silakan login ulang.')
        return
      }

      if (!form.kondisi) return

      setSubmitError(null)

      try {
        await createActivityMutation.mutateAsync({
          itemId,
          userId,
          checklist: { kondisi: form.kondisi },
          note: form.catatan || undefined,
        })

        setSubmitSuccess(true)
        setForm(EMPTY_FORM)
      } catch (error) {
        console.error('Failed to create activity:', error)
        setSubmitError('Aktivitas gagal disimpan. Silakan coba lagi.')
      }
    },
    [createActivityMutation, form.catatan, form.kondisi, itemId, userId],
  )

  if (submitSuccess) {
    return (
      <Alert severity="success" sx={{ mb: 2 }}>
        <AlertTitle>Berhasil!</AlertTitle>
        Aktivitas berhasil disimpan.
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {submitError && (
          <Alert severity="error">
            <AlertTitle>Gagal</AlertTitle>
            {submitError}
          </Alert>
        )}

        <FormControl fullWidth required variant="outlined">
          <InputLabel shrink>Kondisi</InputLabel>
          <Select
            value={form.kondisi}
            label="Kondisi"
            onChange={(e) => updateField('kondisi', e.target.value)}
            displayEmpty
            notched
          >
            <MenuItem value="" disabled>
              Pilih Kondisi
            </MenuItem>
            {KONDISI_OPTIONS.map((option) => (
              <MenuItem key={option.key} value={option.key}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Tambahkan catatan (opsional)..."
          value={form.catatan}
          onChange={(event) => updateField('catatan', event.target.value)}
          variant="outlined"
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={!form.kondisi || createActivityMutation.isPending}
            sx={{ px: 4, py: 1, fontWeight: 'bold', textTransform: 'none' }}
          >
            {createActivityMutation.isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Simpan Aktivitas'
            )}
          </Button>
        </Box>
      </Stack>
    </form>
  )
}

function TugasItemAccordion({
  items,
  userId,
}: {
  items: Item[]
  userId?: string
}) {
  return (
    <Box>
      {items.map((item) => (
        <Accordion
          key={item.id}
          elevation={0}
          variant="outlined"
          sx={{
            mb: 1,
            borderRadius: '8px !important',
            '&:before': { display: 'none' },
            overflow: 'hidden',
          }}
        >
          <AccordionSummary
            expandIcon={<ChevronDown size={20} />}
            sx={{
              px: 2,
              '&.Mui-expanded': {
                minHeight: 64,
                borderBottom: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {item.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.location}
              </Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.01)' }}>
            <ItemActivityForm itemId={item.id} userId={userId} />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}

export default function RouteComponent() {
  const userId = useAuthStore((state) => state.user?.id)
  const { data: items = [], isLoading } = useTugasItemsQuery()
  const [search, setSearch] = useState('')
  const normalizedSearch = search.trim().toLowerCase()

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.name.toLowerCase().includes(normalizedSearch) ||
          item.location.toLowerCase().includes(normalizedSearch),
      ),
    [items, normalizedSearch],
  )

  return (
    <ProtectedRoute>
      <Box sx={{ p: { xs: 3, md: 6 }, maxWidth: '800px', mx: 'auto' }}>
        <Stack spacing={4}>
          <Stack direction="row" spacing={2} alignItems="center">
            <ClipboardCheck color="#3b82f6" size={32} />
            <Typography variant="h4" fontWeight="bold">
              Tugas / Aktivitas
            </Typography>
          </Stack>

          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Cari item berdasarkan nama atau lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            variant="outlined"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color="rgba(255, 255, 255, 0.4)" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
          />

          {/* Loading State */}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={48} />
            </Box>
          )}

          {!isLoading && filteredItems.length > 0 && (
            <TugasItemAccordion items={filteredItems} userId={userId} />
          )}

          {/* Empty State */}
          {!isLoading && filteredItems.length === 0 && (
            <Paper
              variant="outlined"
              sx={{
                py: 12,
                px: 4,
                textAlign: 'center',
                borderRadius: 4,
                bgcolor: 'rgba(255, 255, 255, 0.02)',
                borderStyle: 'dashed',
                borderWidth: 2,
              }}
            >
              <Stack spacing={2} alignItems="center">
                <Search size={48} color="#94a3b8" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Item tidak ditemukan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Coba gunakan kata kunci lain
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Box>
    </ProtectedRoute>
  )
}
