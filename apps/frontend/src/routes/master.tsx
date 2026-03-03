import { createFileRoute } from '@tanstack/react-router'
import type { SubmitEventHandler } from 'react'
import { useState, useCallback, useEffect, useRef } from 'react'
import {
  useMasterItemsQuery,
  useMasterCategoriesQuery,
  useCreateItemMutation,
} from '../hooks/master.items'
import ProtectedRoute from '../components/ProtectedRoute'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
} from '@mui/material'
import { Edit2, Trash2, Package, CheckCircle } from 'lucide-react'

export const Route = createFileRoute('/master')({
  component: RouteComponent,
})

const INITIAL_FORM_STATE = {
  name: '',
  code: '',
  location: '',
  categoryId: '',
  spec: '',
}

const FORM_FIELDS = [
  {
    name: 'name' as const,
    label: 'Nama Alat',
    placeholder: 'e.g AC Daikin 1PK',
    required: true,
    gridSize: { xs: 12, md: 4 },
  },
  {
    name: 'code' as const,
    label: 'Kode Alat / No Seri',
    placeholder: 'e.g AC-LT2-01',
    required: true,
    gridSize: { xs: 12, md: 4 },
  },
  {
    name: 'location' as const,
    label: 'Lokasi / Ruangan',
    placeholder: 'e.g Ruang Tunggu',
    required: true,
    gridSize: { xs: 12, md: 4 },
  },
  {
    name: 'spec' as const,
    label: 'Spesifikasi Detail (Opsional)',
    placeholder: 'e.g Watt, Kapasitas...',
    required: false,
    gridSize: { xs: 12, md: 8 },
  },
] as const

type FormState = typeof INITIAL_FORM_STATE
type FeedbackState = {
  severity: 'success' | 'error'
  message: string
}

function StatusChip({ status }: { status: string }) {
  const isActive = status === 'ACTIVE'
  return (
    <Chip
      label={status}
      color={isActive ? 'success' : 'warning'}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 700 }}
    />
  )
}

function ItemActions() {
  return (
    <Stack direction="row" spacing={1} justifyContent="flex-end">
      <IconButton size="small" color="primary" aria-label="Edit item">
        <Edit2 size={16} />
      </IconButton>
      <IconButton size="small" color="error" aria-label="Delete item">
        <Trash2 size={16} />
      </IconButton>
    </Stack>
  )
}

export default function RouteComponent() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: items = [], isLoading: isLoadingItems } = useMasterItemsQuery()
  const { data: categories = [], isLoading: isLoadingCategories } =
    useMasterCategoriesQuery()
  const createItemMutation = useCreateItemMutation()

  const isFormValid = !!(
    form.name &&
    form.code &&
    form.location &&
    form.categoryId
  )

  const handleInputChange = useCallback(
    (field: keyof FormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }))
    },
    [],
  )

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM_STATE)
  }, [])

  const showFeedback = useCallback(
    (severity: FeedbackState['severity'], message: string) => {
      setFeedback({ severity, message })

      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current)
      }

      feedbackTimerRef.current = setTimeout(() => {
        setFeedback(null)
        feedbackTimerRef.current = null
      }, 3000)
    },
    [],
  )

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current)
      }
    }
  }, [])

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    if (!isFormValid) return

    try {
      await createItemMutation.mutateAsync({
        name: form.name,
        code: form.code,
        location: form.location,
        categoryId: form.categoryId,
        spec: form.spec || undefined,
      })

      resetForm()
      showFeedback('success', `Item "${form.name}" berhasil ditambahkan!`)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Gagal menambahkan item. Silakan coba lagi.'
      showFeedback('error', errorMessage)
    }
  }

  const isSubmitting = createItemMutation.isPending

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <Box sx={{ p: { xs: 3, md: 6 }, maxWidth: '1200px', mx: 'auto' }}>
        <Stack spacing={4}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}
          >
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Package size={20} />
                <Typography variant="h5" fontWeight={700}>
                  Kelola Master Item
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Tambah data alat dan pantau daftar item terdaftar.
              </Typography>
            </Box>

            {feedback && (
              <Alert
                severity={feedback.severity}
                icon={
                  feedback.severity === 'success' ? (
                    <CheckCircle size={18} />
                  ) : undefined
                }
                sx={{ mb: 3 }}
              >
                {feedback.message}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {FORM_FIELDS.map((field) => (
                  <Grid size={field.gridSize} key={field.name}>
                    <TextField
                      fullWidth
                      label={field.label}
                      placeholder={field.placeholder}
                      value={form[field.name]}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                      }
                      required={field.required}
                      variant="outlined"
                    />
                  </Grid>
                ))}

                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth required variant="outlined">
                    <InputLabel>Kategori Item</InputLabel>
                    <Select
                      value={form.categoryId}
                      label="Kategori Item"
                      onChange={(e) =>
                        handleInputChange('categoryId', e.target.value)
                      }
                      disabled={isLoadingCategories || isSubmitting}
                    >
                      <MenuItem value="" disabled>
                        Pilih item...
                      </MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={
                        isLoadingCategories || isSubmitting || !isFormValid
                      }
                      sx={{
                        px: 4,
                        py: 1.2,
                        fontWeight: 700,
                        textTransform: 'none',
                      }}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Tambah Alat Master'
                      )}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>

          <Paper
            elevation={0}
            variant="outlined"
            sx={{ borderRadius: 3, overflow: 'hidden' }}
          >
            <Box
              sx={{
                p: 3,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" fontWeight={700}>
                  Daftar Master Item Terdaftar
                </Typography>
                <Chip
                  label={`Total: ${items.length} Item`}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Box>

            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>KODE</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>NAMA ALAT</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>KATEGORI</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>LOKASI</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      AKSI
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoadingItems ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <CircularProgress size={32} />
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <Typography variant="body2" color="text.secondary">
                          Belum ada item terdaftar
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          {item.code}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {item.name}
                        </TableCell>
                        <TableCell>
                          {item.category?.name || 'Lainnya'}
                        </TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>
                          <StatusChip status={item.status} />
                        </TableCell>
                        <TableCell align="right">
                          <ItemActions />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      </Box>
    </ProtectedRoute>
  )
}
