import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useSuperadmin() {
  const { user } = useAuth();
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSuperadmin = async () => {
      if (!user) {
        setIsSuperadmin(false);
        setLoading(false);
        return;
      }

      try {
        // Use the is_superadmin function we created
        const { data, error } = await supabase
          .rpc('is_superadmin', { _user_id: user.id });
        
        if (error) {
          console.error('Error checking superadmin status:', error);
          setIsSuperadmin(false);
        } else {
          setIsSuperadmin(data === true);
        }
      } catch (err) {
        console.error('Error checking superadmin:', err);
        setIsSuperadmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkSuperadmin();
  }, [user]);

  return { isSuperadmin, loading };
}
