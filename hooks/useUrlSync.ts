'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useSimulationStore } from '@/stores/useSimulation';

export const UrlSyncManager = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { inputs, setInputs } = useSimulationStore();
  
  // Track if we just hydrated from URL to prevent immediate overwrite
  const isHydrated = useRef(false);

  // 1. Initial hydration from URL params
  useEffect(() => {
    if (isHydrated.current) return;

    const queryXd = searchParams.get('xd');
    const queryXb = searchParams.get('xb');
    const queryZf = searchParams.get('zf');
    const queryQ = searchParams.get('q');
    const queryR = searchParams.get('r');

    const newInputs: any = {};
    if (queryXd) newInputs.xD = parseFloat(queryXd);
    if (queryXb) newInputs.xB = parseFloat(queryXb);
    if (queryZf) newInputs.zF = parseFloat(queryZf);
    if (queryQ) newInputs.q = parseFloat(queryQ);
    if (queryR) newInputs.R = parseFloat(queryR);

    if (Object.keys(newInputs).length > 0) {
      setInputs(newInputs);
    }
    
    isHydrated.current = true;
  }, [searchParams, setInputs]);

  // 2. Sync Zustand state back to URL when state changes
  useEffect(() => {
    if (!isHydrated.current) return; // Wait until initial load is done

    const params = new URLSearchParams(searchParams.toString());
    params.set('xd', inputs.xD.toFixed(3));
    params.set('xb', inputs.xB.toFixed(3));
    params.set('zf', inputs.zF.toFixed(3));
    params.set('q', inputs.q.toFixed(2));
    params.set('r', inputs.R.toFixed(2));

    // replaceState to avoid cluttering browser history
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [inputs, pathname, router, searchParams]);

  return null;
};
