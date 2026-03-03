import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'
import { Container, Paper, Box, Typography, Button } from '@mui/material'
import { ShieldAlert } from 'lucide-react'

export const Route = createFileRoute('/unauthorized')({
  component: UnauthorizedPage,
})

export default function UnauthorizedPage() {
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
        <Paper elevation={3} sx={{ p: 6, borderRadius: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <ShieldAlert size={64} color="#f87171" />
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom color="white">
            403 Forbidden
          </Typography>
          <Typography variant="body1" color="rgba(255, 255, 255, 0.6)" sx={{ mb: 4 }}>
            You don't have permission to access this page.
          </Typography>

          <Button
            component={RouterLink}
            to="/dashboard"
            variant="contained"
            sx={{ 
              px: 4, 
              py: 1.2, 
              bgcolor: 'primary.main', 
              '&:hover': { bgcolor: 'primary.dark' },
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Container>
    </Box>
  )
}
