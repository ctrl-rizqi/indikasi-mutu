import { Link } from '@tanstack/react-router'
import { LogOut, Menu as MenuIcon, Package, X } from 'lucide-react'
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Stack,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material'

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)

  const handleOpenMenu = (event: ReactMouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleCloseMenu()
    void logout()
  }

  const userLabel = user?.name || user?.role || 'User'
  const userFallback = user?.role === 'ADMIN' ? 'AD' : 'PT'

  const navItems = [
    ...(isAuthenticated ? [{ label: 'Home', to: '/' as const }] : []),
    ...(user?.role === 'USER'
      ? [{ label: 'Tugas / Aktivitas', to: '/tugas' as const }]
      : []),
    ...(user?.role === 'ADMIN'
      ? [
          { label: 'Master Item', to: '/master' as const },
          { label: 'Tambah Kategori', to: '/master-kategori' as const },
          { label: 'Laporan', to: '/laporan' as const },
        ]
      : []),
  ]

  const toggleDrawer =
    (open: boolean) => (event: ReactKeyboardEvent | ReactMouseEvent) => {
      if (event.type === 'keydown') {
        const keyboardEvent = event as ReactKeyboardEvent
        if (keyboardEvent.key === 'Tab' || keyboardEvent.key === 'Shift') {
          return
        }
      }

      setIsDrawerOpen(open)
    }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Link
            to="/"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Package size={22} color="currentColor" />
            <Typography
              variant="h6"
              fontWeight={700}
              color="text.primary"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              Indikator Mutu RS
            </Typography>
          </Link>
        </Stack>

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 3 }}>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {({ isActive }) => (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    color: isActive ? 'primary.main' : 'text.secondary',
                    borderBottom: isActive
                      ? '2px solid'
                      : '2px solid transparent',
                    borderColor: isActive ? 'primary.main' : 'transparent',
                    pb: 0.5,
                    transition: 'color 0.2s ease, border-color 0.2s ease',
                    '&:hover': { color: 'text.primary' },
                  }}
                >
                  {item.label}
                </Typography>
              )}
            </Link>
          ))}
        </Box>

        <Box>
          {!isAuthenticated ? (
            <Button
              component={Link}
              to="/login"
              variant="contained"
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Login
            </Button>
          ) : (
            <>
              <IconButton
                onClick={handleOpenMenu}
                sx={{ p: 0.5, borderRadius: 2 }}
              >
                <Stack
                  direction="row"
                  spacing={1.25}
                  alignItems="center"
                  sx={{
                    p: 0.5,
                    pr: { md: 1.25 },
                    borderRadius: 999,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'primary.main',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    {userFallback}
                  </Avatar>
                  <Box
                    sx={{
                      display: { xs: 'none', md: 'block' },
                      textAlign: 'left',
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      display="block"
                      sx={{ lineHeight: 1.1 }}
                    >
                      {userLabel}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {user?.role.toLowerCase()}
                    </Typography>
                  </Box>
                </Stack>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1,
                      minWidth: 190,
                      border: '1px solid',
                      borderColor: 'divider',
                    },
                  },
                }}
              >
                <MenuItem disabled sx={{ opacity: '1 !important', py: 1.5 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      Signed in as
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {user?.username || user?.role}
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={handleLogout}
                  sx={{ gap: 1.25, color: 'error.main' }}
                >
                  <LogOut size={16} />
                  <Typography variant="body2">Log Out</Typography>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              bgcolor: 'background.paper',
            },
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Package size={22} color="currentColor" />
            <Typography variant="h6" fontWeight={700}>
              Menu
            </Typography>
          </Stack>
          <IconButton onClick={toggleDrawer(false)} color="inherit">
            <X size={24} />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {navItems.map((item) => (
            <ListItemButton
              key={item.to}
              component={Link}
              to={item.to}
              onClick={toggleDrawer(false)}
              sx={{ py: 1.5, px: 2 }}
            >
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={700}>
                    {item.label}
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ mt: 'auto', p: 2, borderTop: 1, borderColor: 'divider' }}>
          {!isAuthenticated ? (
            <Button
              fullWidth
              component={Link}
              to="/login"
              variant="contained"
              onClick={toggleDrawer(false)}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Login
            </Button>
          ) : (
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={() => {
                setIsDrawerOpen(false)
                handleLogout()
              }}
              startIcon={<LogOut size={18} />}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Drawer>
    </AppBar>
  )
}
