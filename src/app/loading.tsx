import React from 'react';
import { PremiumLoader } from '../components/ui/PremiumLoader';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <PremiumLoader
        title="Loading Operations Console..."
        subtitle="Retrieving real-time fashion atelier transactions, dispatch manifests and metrics..."
        minHeight="min-h-[400px]"
      />
    </div>
  );
}

