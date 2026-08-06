import React, { useState, useEffect } from 'react';
import PageSkeleton, { PageSkeletonProps } from './page-skeleton';
import { PageLoadingFullscreen } from './page-loading-lottie';

export const DelayedFallback: React.FC<{
  variant?: PageSkeletonProps['variant'];
  delayMs?: number;
  fullHeight?: boolean;
}> = ({
  variant = 'content',
  delayMs = 150,
  fullHeight = false,
}) => {
  const [show, setShow] = useState(delayMs === 0);
  useEffect(() => {
    if (delayMs === 0) return;
    const t = window.setTimeout(() => setShow(true), delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs]);

  if (!show) return null;

  if (fullHeight) {
    return <PageLoadingFullscreen />;
  }

  return <PageSkeleton variant={variant} />;
};
