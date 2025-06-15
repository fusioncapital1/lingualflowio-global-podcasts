
import { useEffect } from 'react';

interface WebVitalsProps {
  reportWebVitals?: (metric: any) => void;
}

export const WebVitals = ({ reportWebVitals }: WebVitalsProps) => {
  useEffect(() => {
    if (reportWebVitals && typeof window !== 'undefined') {
      import('web-vitals').then((webVitals) => {
        webVitals.onCLS(reportWebVitals);
        webVitals.onFID(reportWebVitals);
        webVitals.onFCP(reportWebVitals);
        webVitals.onLCP(reportWebVitals);
        webVitals.onTTFB(reportWebVitals);
      }).catch(() => {
        // Silently handle if web-vitals is not available
      });
    }
  }, [reportWebVitals]);

  return null;
};
