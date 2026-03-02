/**
 * Provider Validation Hooks
 * 
 * React hooks for validating provider credentials before allowing changes.
 */

import { useQuery } from '@tanstack/react-query';
import {
  validateProviderCredentials,
  getAvailableProviders,
  type ProviderValidationResult,
  type AvailableProvidersResponse,
} from '@/services/provider-validation';

/**
 * Hook to validate a specific provider's credentials
 */
export function useProviderValidation(
  providerType: 'stt' | 'llm' | 'tts',
  providerName: string,
  enabled: boolean = true
) {
  return useQuery<ProviderValidationResult>({
    queryKey: ['provider-validation', providerType, providerName],
    queryFn: () => validateProviderCredentials(providerType, providerName),
    enabled: enabled && !!providerName,
    staleTime: 60000, // 1 minute
    retry: 1,
  });
}

/**
 * Hook to get all available providers and their status
 */
export function useAvailableProviders() {
  return useQuery<AvailableProvidersResponse>({
    queryKey: ['available-providers'],
    queryFn: getAvailableProviders,
    staleTime: 300000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to check if a provider can be used
 */
export function useCanUseProvider(
  providerType: 'stt' | 'llm' | 'tts',
  providerName: string
) {
  const { data, isLoading } = useProviderValidation(providerType, providerName);
  
  return {
    canUse: data?.valid ?? false,
    isLoading,
    missingVars: data?.missing_env_vars ?? [],
    requiredVars: data?.required_env_vars ?? [],
  };
}

