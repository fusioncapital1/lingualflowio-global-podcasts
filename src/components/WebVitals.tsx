
import { useEffect } from 'react';

interface WebVitalsProps {
  reportWebVitals?: (metric: any) => void;
}

export const WebVitals = ({ reportWebVitals }: WebVitalsProps) => {
  useEffect(() => {
    if (reportWebVitals && typeof window !== 'undefined') {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(reportWebVitals);
        getFID(reportWebVitals);
        getFCP(reportWebVitals);
        getLCP(reportWebVitals);
        getTTFB(reportWebVitals);
      }).catch(() => {
        // Silently handle if web-vitals is not available
      });
    }
  }, [reportWebVitals]);

  return null;
};
