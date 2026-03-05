import { createFileRoute } from '@tanstack/react-router'
import type { SubmitEventHandler } from 'react'
import { useMemo, useState } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useMasterCategoriesQuery,
  useUpdateCategoryMutation,
} from '../hooks/master.items'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

export const Route = createFileRoute('/master-kategori')({
  component: MasterKategoriPage,
})

function MasterKategoriPage() {
  const [name, setName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useMasterCategoriesQuery()
  const createCategoryMutation = useCreateCategoryMutation()
  const updateCategoryMutation = useUpdateCategoryMutation()
  const deleteCategoryMutation = useDeleteCategoryMutation()

  const trimmedName = useMemo(() => name.trim(), [name])
  const trimmedEditingName = useMemo(() => editingName.trim(), [editingName])

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    setFeedback(null)

    if (!trimmedName) {
      setFeedback('Nama kategori wajib diisi')
      return
    }

    try {
      await createCategoryMutation.mutateAsync({ name: trimmedName })
      setName('')
      setFeedback('Kategori berhasil ditambahkan')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Gagal menambah kategori')
    }
  }

  const startEditCategory = (id: string, categoryName: string) => {
    setFeedback(null)
    setEditingCategoryId(id)
    setEditingName(categoryName)
  }

  const cancelEditCategory = () => {
    setEditingCategoryId(null)
    setEditingName('')
  }

  const saveEditCategory = async () => {
    if (!editingCategoryId) {
      return
    }

    setFeedback(null)

    if (!trimmedEditingName) {
      setFeedback('Nama kategori wajib diisi')
      return
    }

    try {
      await updateCategoryMutation.mutateAsync({
        id: editingCategoryId,
        payload: { name: trimmedEditingName },
      })
      setFeedback('Kategori berhasil diperbarui')
      cancelEditCategory()
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Gagal mengubah kategori')
    }
  }

  const removeCategory = async (id: string, categoryName: string) => {
    setFeedback(null)
    const isConfirmed = window.confirm(
      `Hapus kategori "${categoryName}"? Tindakan ini tidak bisa dibatalkan.`,
    )

    if (!isConfirmed) {
      return
    }

    try {
      await deleteCategoryMutation.mutateAsync(id)
      if (editingCategoryId === id) {
        cancelEditCategory()
      }
      setFeedback('Kategori berhasil dihapus')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Gagal menghapus kategori')
    }
  }

  const isMutatingCategory =
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    deleteCategoryMutation.isPending

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <Box component="main" sx={{ p: { xs: 3, md: 6 }, maxWidth: 960, mx: 'auto' }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Tambah Kategori
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Kelola kategori master untuk pengelompokan item alat dan fasilitas.
            </Typography>
          </Box>

          <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
              <TextField
                label="Nama Kategori"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Contoh: APAR"
                autoComplete="off"
                fullWidth
                required
              />
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isMutatingCategory}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  {createCategoryMutation.isPending ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    'Simpan Kategori'
                  )}
                </Button>
              </Box>
            </Stack>
          </Paper>

          {feedback ? <Alert severity="info">{feedback}</Alert> : null}

          <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Daftar Kategori
            </Typography>

            {isCategoriesLoading ? (
              <Typography variant="body2" color="text.secondary">
                Memuat data kategori...
              </Typography>
            ) : categoriesError ? (
              <Alert severity="error">Gagal memuat data kategori</Alert>
            ) : categories.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Belum ada kategori.
              </Typography>
            ) : (
              <List disablePadding>
                {categories.map((category) => (
                  <ListItem
                    key={category.id}
                    disableGutters
                    divider
                    secondaryAction={
                      editingCategoryId === category.id ? (
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={saveEditCategory}
                            disabled={isMutatingCategory}
                            sx={{ textTransform: 'none' }}
                          >
                            Simpan
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={cancelEditCategory}
                            disabled={isMutatingCategory}
                            sx={{ textTransform: 'none' }}
                          >
                            Batal
                          </Button>
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => startEditCategory(category.id, category.name)}
                            disabled={isMutatingCategory}
                            sx={{ textTransform: 'none' }}
                          >
                            Ubah
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => removeCategory(category.id, category.name)}
                            disabled={isMutatingCategory}
                            sx={{ textTransform: 'none' }}
                          >
                            Hapus
                          </Button>
                        </Stack>
                      )
                    }
                    sx={{ pr: 22 }}
                  >
                    {editingCategoryId === category.id ? (
                      <TextField
                        size="small"
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        placeholder="Nama kategori"
                        fullWidth
                        autoFocus
                      />
                    ) : (
                      <ListItemText primary={category.name} />
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Stack>
      </Box>
    </ProtectedRoute>
  )
}
