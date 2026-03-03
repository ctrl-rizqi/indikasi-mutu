import { createFileRoute, useNavigate, Link as RouterLink } from '@tanstack/react-router'
import { ShieldCheck, ClipboardCheck, BarChart3, Activity } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Paper, 
  Stack,
  Avatar
} from '@mui/material'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' })
    }
  }, [isAuthenticated, navigate])

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <Box component="section" sx={{ 
        position: 'relative', 
        py: { xs: 10, md: 15 }, 
        px: 3, 
        overflow: 'hidden', 
        bgcolor: 'rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack spacing={4} sx={{ position: 'relative', zIndex: 10 }}>
                <Box sx={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  px: 2, 
                  py: 0.5, 
                  borderRadius: '9999px', 
                  bgcolor: 'rgba(59, 130, 246, 0.1)', 
                  color: 'primary.main' 
                }}>
                  <ShieldCheck size={14} />
                  <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Hospital Quality Assurance
                  </Typography>
                </Box>
                <Typography variant="h2" fontWeight="800" sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.1,
                  color: 'white'
                }}>
                  Sistem Pemantauan <Box component="span" sx={{ color: 'primary.main' }}>Indikator Mutu</Box> Rumah Sakit
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.6)', maxWidth: 500, fontWeight: 'normal' }}>
                  Optimalkan pemeliharaan aset dan fasilitas medis Anda dengan sistem pemantauan real-time yang akurat dan mudah digunakan.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button 
                    component={RouterLink} 
                    to="/login" 
                    variant="contained" 
                    size="large"
                    sx={{ px: 4, py: 1.5, fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}
                  >
                    Mulai Sekarang
                  </Button>
                  <Button 
                    component={RouterLink} 
                    to="/signup" 
                    variant="outlined" 
                    size="large"
                    sx={{ px: 4, py: 1.5, fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}
                  >
                    Daftar Akun
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ 
                  position: 'absolute', 
                  inset: 0, 
                  bgcolor: 'primary.main', 
                  borderRadius: '50%', 
                  filter: 'blur(80px)', 
                  opacity: 0.15,
                  animation: 'pulse 3s infinite'
                }} />
                <Paper 
                  elevation={24} 
                  sx={{ 
                    borderRadius: 4, 
                    overflow: 'hidden', 
                    transform: 'rotate(3deg)',
                    transition: 'transform 0.5s',
                    '&:hover': { transform: 'rotate(0deg)' }
                  }}
                >
                  {imageError ? (
                    <Box sx={{ 
                      width: { xs: '100%', sm: 400, lg: 500 }, 
                      height: { xs: 250, sm: 300, lg: 350 }, 
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Activity size={64} color="white" />
                    </Box>
                  ) : (
                    <Box 
                      component="img"
                      src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"
                      alt="Medical Technology"
                      sx={{ 
                        width: { xs: '100%', sm: 400, lg: 500 }, 
                        height: { xs: 250, sm: 300, lg: 350 }, 
                        objectFit: 'cover' 
                      }}
                      onError={() => setImageError(true)}
                    />
                  )}
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box component="section" sx={{ py: 15, px: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom color="white">
              Solusi Modern Manajemen Mutu
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)', maxWidth: 600, mx: 'auto' }}>
              Didesain khusus untuk memenuhi standar akreditasi rumah sakit dalam pengelolaan fasilitas dan keselamatan.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              { 
                title: 'Checklist Digital', 
                desc: 'Ucapkan selamat tinggal pada kertas. Petugas dapat melakukan inspeksi langsung dari perangkat mobile mereka.',
                icon: <ClipboardCheck size={24} />,
                color: '#3b82f6'
              },
              { 
                title: 'Statistik Real-time', 
                desc: 'Pantau kepatuhan pemeliharaan secara instan melalui dashboard analitik yang informatif.',
                icon: <BarChart3 size={24} />,
                color: '#10b981'
              },
              { 
                title: 'Terintegrasi & Aman', 
                desc: 'Data tersentralisasi dan terlindungi, memudahkan audit internal maupun eksternal kapan saja.',
                icon: <ShieldCheck size={24} />,
                color: '#6366f1'
              }
            ].map((feature) => (
              <Grid size={{ xs: 12, md: 4 }} key={feature.title}>
                <Paper 
                  elevation={0} 
                  variant="outlined" 
                  sx={{ 
                    p: 4, 
                    height: '100%', 
                    borderRadius: 3, 
                    bgcolor: 'rgba(255, 255, 255, 0.01)',
                    transition: 'all 0.3s',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)', transform: 'translateY(-5px)' }
                  }}
                >
                  <Stack spacing={3}>
                    <Avatar sx={{ 
                      bgcolor: feature.color, 
                      borderRadius: 2, 
                      width: 48, 
                      height: 48,
                      boxShadow: `0 8px 16px -4px ${feature.color}66`
                    }}>
                      {feature.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom color="white">{feature.title}</Typography>
                      <Typography variant="body2" color="rgba(255, 255, 255, 0.6)">{feature.desc}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer Placeholder */}
      <Box component="footer" sx={{ 
        mt: 'auto', 
        py: 8, 
        px: 3, 
        borderTop: '1px solid', 
        borderColor: 'divider', 
        textAlign: 'center' 
      }}>
        <Typography variant="body2" color="rgba(255, 255, 255, 0.4)">
          &copy; 2026 Indikator Mutu RS. All rights reserved.
        </Typography>
      </Box>
    </Box>
  )
}
