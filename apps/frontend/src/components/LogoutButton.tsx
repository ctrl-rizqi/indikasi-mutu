import { useAuthStore } from '../store/authStore';
import { Button } from '@mui/material';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <Button
      variant="contained"
      color="error"
      onClick={handleLogout}
      startIcon={<LogOut size={18} />}
      sx={{ textTransform: 'none' }}
    >
      Logout
    </Button>
  );
}