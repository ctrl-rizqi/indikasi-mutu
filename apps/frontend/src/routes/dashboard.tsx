import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'
import { useAuthStore } from '../store/authStore'
import ProtectedRoute from '../components/ProtectedRoute'
import { 
  Box, 
  Typography, 
  Button, 
  Avatar, 
  Chip, 
  Paper, 
  Grid,
  Stack,
  Card,
  CardContent,
  CardActionArea
} from '@mui/material'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  FileBarChart,
  Settings,
  ArrowRight,
} from 'lucide-react'
import type { User } from '../lib/auth'

// ============================================================================
// Types
// ============================================================================

type UserRole = User['role']

interface QuickAction {
  title: string
  description: string
  Icon: LucideIcon
  color: string
  to: string
}

interface HeaderActionConfig {
  to: string
  label: string
  icon: LucideIcon
  variant: 'contained' | 'outlined' | 'text'
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
  showWhenAdmin?: boolean
}

// ============================================================================
// Constants
// ============================================================================

const ROUTES = {
  MASTER: '/master',
  LAPORAN: '/laporan',
  TUGAS: '/tugas',
} as const

const ROLE = {
  ADMIN: 'ADMIN' as UserRole,
  USER: 'USER' as UserRole,
} as const

// ============================================================================
// Data
// ============================================================================

const ADMIN_ACTIONS: QuickAction[] = [
  {
    title: 'Master Item',
    description: 'Kelola data alat dan fasilitas rumah sakit.',
    Icon: Package,
    color: '#3b82f6',
    to: ROUTES.MASTER,
  },
  {
    title: 'Laporan Mutu',
    description: 'Lihat statistik dan kepatuhan pemeliharaan.',
    Icon: FileBarChart,
    color: '#10b981',
    to: ROUTES.LAPORAN,
  },
]

const USER_ACTIONS: QuickAction[] = [
  {
    title: 'Tugas / Aktivitas',
    description: 'Input checklist pemeliharaan harian.',
    Icon: ClipboardList,
    color: '#8b5cf6',
    to: ROUTES.TUGAS,
  },
]

const HEADER_ACTIONS: HeaderActionConfig[] = [
  {
    to: ROUTES.TUGAS,
    label: 'Lihat Tugas',
    icon: ClipboardList,
    variant: 'outlined',
    color: 'inherit',
  },
  {
    to: ROUTES.MASTER,
    label: 'Pengaturan',
    icon: Settings,
    variant: 'contained',
    color: 'primary',
    showWhenAdmin: true,
  },
]

// ============================================================================
// Helper Functions
// ============================================================================

const getActionsByRole = (role?: UserRole): QuickAction[] =>
  role === ROLE.ADMIN ? ADMIN_ACTIONS : USER_ACTIONS

const getAvatarInitials = (role?: UserRole): string =>
  role === ROLE.ADMIN ? 'AD' : 'PT'

// ============================================================================
// Sub-Components
// ============================================================================

function UserGreeting({ user }: { user: User | null }): React.ReactElement {
  return (
    <Stack direction="row" spacing={3} alignItems="center">
      <Avatar sx={{ 
        width: 80, 
        height: 80, 
        fontSize: '2rem', 
        bgcolor: user?.role === 'ADMIN' ? 'primary.main' : 'secondary.main',
        fontWeight: 'bold'
      }}>
        {getAvatarInitials(user?.role)}
      </Avatar>
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Selamat Datang, {user?.name}!
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip 
            label={user?.role || 'GUEST'} 
            size="small" 
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white', fontWeight: 'bold' }} 
          />
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontStyle: 'italic' }}>
            Akses panel kontrol {user?.role.toLowerCase() ?? 'pengguna'} Anda di sini.
          </Typography>
        </Stack>
      </Box>
    </Stack>
  )
}

function HeaderActions({ isAdmin }: { isAdmin: boolean }): React.ReactElement {
  const visibleActions = HEADER_ACTIONS.filter(
    (action) => !action.showWhenAdmin || isAdmin,
  )

  return (
    <Stack direction="row" spacing={2}>
      {visibleActions.map((action) => (
        <Button
          key={action.to}
          component={RouterLink}
          to={action.to}
          variant={action.variant}
          color={action.color}
          startIcon={<action.icon size={18} />}
          sx={{ 
            textTransform: 'none', 
            fontWeight: 'bold',
            ...(action.variant === 'outlined' && { borderColor: 'rgba(255, 255, 255, 0.3)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' } }),
            ...(action.variant === 'contained' && action.color === 'primary' && { bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' } })
          }}
        >
          {action.label}
        </Button>
      ))}
    </Stack>
  )
}

function WelcomeHeader(): React.ReactElement {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === ROLE.ADMIN

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 4, md: 6 }, 
        borderRadius: 4, 
        background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
        boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)'
      }}
    >
      <UserGreeting user={user} />
      <HeaderActions isAdmin={isAdmin} />
    </Paper>
  )
}

function QuickAccessCard({
  action,
}: {
  action: QuickAction
}): React.ReactElement {
  return (
    <Card 
      elevation={0} 
      sx={{ 
        height: '100%', 
        borderRadius: 3, 
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 20px -10px rgba(0,0,0,0.3)',
          borderColor: 'primary.main'
        }
      }}
    >
      <CardActionArea component={RouterLink} to={action.to} sx={{ height: '100%', p: 1 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              display: 'flex'
            }}>
              <action.Icon size={24} color={action.color} />
            </Box>
            <ArrowRight size={20} style={{ opacity: 0.3 }} />
          </Stack>
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {action.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {action.description}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

function QuickAccessGrid(): React.ReactElement {
  const user = useAuthStore((state) => state.user)
  const actions = getActionsByRole(user?.role)

  return (
    <Box sx={{ spaceY: 3 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
        <LayoutDashboard size={24} color="#94a3b8" />
        <Typography variant="h5" fontWeight="bold">
          Akses Cepat
        </Typography>
      </Stack>

      <Grid container spacing={4}>
        {actions.map((action) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={action.title}>
            <QuickAccessCard action={action} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

function VisualizationPlaceholder(): React.ReactElement {
  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        py: 10, 
        px: 4, 
        textAlign: 'center', 
        borderRadius: 4, 
        bgcolor: 'background.paper',
        borderStyle: 'dashed',
        borderWidth: 2
      }}
    >
      <Stack spacing={4} alignItems="center">
        <Box sx={{ 
          p: 3, 
          borderRadius: '50%', 
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <FileBarChart size={48} color="#94a3b8" />
        </Box>
        <Box maxWidth={500}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Visualisasi Data Mutu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Modul statistik lanjutan sedang dikembangkan. Gunakan menu Laporan
            untuk melihat data saat ini.
          </Typography>
        </Box>
        <Button 
          component={RouterLink} 
          to={ROUTES.LAPORAN}
          variant="contained" 
          sx={{ px: 4, py: 1.2, fontWeight: 'bold', textTransform: 'none' }}
        >
          Buka Laporan
        </Button>
      </Stack>
    </Paper>
  )
}

// ============================================================================
// Main Component
// ============================================================================

function DashboardPage(): React.ReactElement {
  return (
    <ProtectedRoute>
      <Box component="main" sx={{ p: { xs: 3, md: 6 }, maxWidth: '1200px', mx: 'auto' }}>
        <Stack spacing={8}>
          <WelcomeHeader />
          <QuickAccessGrid />
          <VisualizationPlaceholder />
        </Stack>
      </Box>
    </ProtectedRoute>
  )
}

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

export default DashboardPage
