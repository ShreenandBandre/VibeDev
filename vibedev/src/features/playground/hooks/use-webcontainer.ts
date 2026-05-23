// src/features/playground/hooks/use-webcontainer.ts
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';
import type { TemplateFolder } from '@/features/playground/libs/path-to-json';

interface UseWebContainerReturn {
  serverUrl: string | null;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  destroy: () => void;
}

// Global reference pointer prevents Next.js HMR double-renders from spawning duplicate VMs
let globalWebContainerInstance: WebContainer | null = null;
let isBootingInFlight = false;

export const useWebContainer = ({ templateData }: { templateData: TemplateFolder }): UseWebContainerReturn => {
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!globalWebContainerInstance);
  const [error, setError] = useState<string | null>(null);
  const [instance, setInstance] = useState<WebContainer | null>(globalWebContainerInstance);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    async function initializeWebContainer() {
      if (globalWebContainerInstance) {
        setInstance(globalWebContainerInstance);
        setIsLoading(false);
        return;
      }

      if (isBootingInFlight) return;
      isBootingInFlight = true;

      try {
        const webcontainerInstance = await WebContainer.boot();
        
        if (!isMounted.current) {
          webcontainerInstance.teardown();
          return;
        }
        
        globalWebContainerInstance = webcontainerInstance;
        setInstance(webcontainerInstance);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize WebContainer:', err);
        if (isMounted.current) {
          setError(err instanceof Error ? err.message : 'Failed to initialize WebContainer');
          setIsLoading(false);
        }
      } finally {
        isBootingInFlight = false;
      }
    }

    initializeWebContainer();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const writeFileSync = useCallback(async (path: string, content: string): Promise<void> => {
    if (!instance) {
      throw new Error('WebContainer instance is not available');
    }

    try {
      const pathParts = path.split('/');
      const folderPath = pathParts.slice(0, -1).join('/');

      if (folderPath) {
        await instance.fs.mkdir(folderPath, { recursive: true });
      }

      await instance.fs.writeFile(path, content);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to write file';
      console.error(`Failed to write file at ${path}:`, err);
      throw new Error(`Failed to write file at ${path}: ${errorMessage}`);
    }
  }, [instance]);

  const destroy = useCallback(() => {
    if (globalWebContainerInstance) {
      globalWebContainerInstance.teardown();
      globalWebContainerInstance = null;
    }
    setInstance(null);
    setServerUrl(null);
  }, []);

  return { serverUrl, isLoading, error, instance, writeFileSync, destroy };
};