import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export function useAuth() {
  const router = useRouter();

  const logout = async () => {
    try {
      // 1. Llamar al backend para limpiar la cookie HTTP-Only
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
    } finally {
      // 2. Limpiar estado local en cualquier caso
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 3. Redirigir al login
      router.push('/login');
    }
  };

  return { logout };
}
