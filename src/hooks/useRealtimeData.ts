import { useState, useEffect, useCallback } from 'react';
import { supabaseMock, Registration, Institution, Sponsor, Expense } from '@/lib/supabaseMock';

export function useRealtimeData() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refreshData = useCallback(() => {
    setRegistrations(supabaseMock.getRegistrations());
    setInstitutions(supabaseMock.getInstitutions());
    setSponsors(supabaseMock.getSponsors());
    setExpenses(supabaseMock.getExpenses());
    setIsLoaded(true);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    // Initial fetch from memory/localStorage cache
    refreshData();

    // Subscribe to realtime push notifications & local state updates
    const unsubscribe = supabaseMock.subscribe(() => {
      refreshData();
    });

    // Trigger explicit sync from Supabase server
    supabaseMock.syncFromSupabase().then(() => {
      refreshData();
    });

    return () => {
      unsubscribe();
    };
  }, [refreshData]);

  const forceSync = useCallback(async () => {
    await supabaseMock.syncFromSupabase();
    refreshData();
  }, [refreshData]);

  return {
    registrations,
    institutions,
    sponsors,
    expenses,
    isLoaded,
    lastUpdated,
    forceSync,
    refreshData
  };
}
