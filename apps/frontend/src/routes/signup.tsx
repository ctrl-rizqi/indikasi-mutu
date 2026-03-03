import {
  createFileRoute,
  useNavigate,
  Link as RouterLink,
} from '@tanstack/react-router'
import { useState, useCallback, useMemo } from 'react'
import { useAuthStore } from '../store/authStore'
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  AlertTitle,
  CircularProgress,
  Link,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material'
import { Lock, User, UserCircle } from 'lucide-react'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

// Initial form state constant
const INITIAL_FORM_STATE = {
  username: '',
  password: '',
  name: '',
  role: 'USER' as 'USER' | 'ADMIN',
}

// Type for form state
type FormState = typeof INITIAL_FORM_STATE

// Form field configuration for reusability
const FORM_FIELDS = [
  {
    name: 'name' as const,
    label: 'Full Name',
    placeholder: 'Enter your full name',
    type: 'text',
    icon: UserCircle,
    required: true,
  },
  {
    name: 'username' as const,
    label: 'Username',
    placeholder: 'Enter your username',
    type: 'text',
    icon: User,
    required: true,
  },
  {
    name: 'password' as const,
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    icon: Lock,
    required: true,
  },
] as const

// Role options
const ROLE_OPTIONS = [
  { key: 'USER', label: 'User' },
  { key: 'ADMIN', label: 'Admin' },
] as const

export default function SignupPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const signup = useAuthStore((state) => state.signup)
  const navigate = useNavigate()

  // Form validation
  const isFormValid = useMemo(() => {
    return !!(form.name && form.username && form.password && form.role)
  }, [form])

  // Generic input change handler
  const handleInputChange = useCallback(
    (field: keyof FormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }))
    },
    [],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setError('')
    setLoading(true)

    try {
      await signup(form)
      navigate({ to: '/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: 'background.default',
        p: 2 
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom color="white">
              Create an account
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.6)">
              Enter your details to get started
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {FORM_FIELDS.map((field) => (
                <TextField
                  key={field.name}
                  fullWidth
                  label={field.label}
                  placeholder={field.placeholder}
                  type={field.type}
                  variant="outlined"
                  value={form[field.name]}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  required={field.required}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <field.icon size={20} color="rgba(255, 255, 255, 0.4)" />
                        </InputAdornment>
                      ),
                    },
                    inputLabel: { shrink: true }
                  }}
                />
              ))}

              <FormControl fullWidth required variant="outlined">
                <InputLabel shrink>Role</InputLabel>
                <Select
                  value={form.role}
                  label="Role"
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  notched
                >
                  {ROLE_OPTIONS.map((role) => (
                    <MenuItem key={role.key} value={role.key}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={!isFormValid || loading}
                sx={{ 
                  py: 1.5, 
                  bgcolor: 'primary.main', 
                  '&:hover': { bgcolor: 'primary.dark' },
                  textTransform: 'none',
                  fontWeight: 'bold',
                  mt: 1
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create account'}
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.6)">
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{ color: 'primary.main', fontWeight: 'bold', textDecoration: 'none' }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
