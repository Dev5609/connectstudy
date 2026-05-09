'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { toast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: any) => {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: error.message,
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
