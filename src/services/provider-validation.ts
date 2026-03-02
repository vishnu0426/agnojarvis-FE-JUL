/**
 * Provider Validation Service
 * 
 * Validates that required environment variables exist before allowing
 * provider changes in the UI.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface ProviderValidationResult {
  valid: boolean;
  provider: string;
  provider_type: string;
  description?: string;
  required_env_vars?: string[];
  existing_env_vars?: string[];
  missing_env_vars?: string[];
  message: string;
  error?: string;
  supported_providers?: string[];
}

export interface ProviderInfo {
  available: boolean;
  description: string;
  required_env_vars: string[];
  missing_env_vars: string[];
}

export interface AvailableProvidersResponse {
  stt: Record<string, ProviderInfo>;
  llm: Record<string, ProviderInfo>;
  tts: Record<string, ProviderInfo>;
}

/**
 * Validate that a provider has the required credentials configured
 */
export async function validateProviderCredentials(
  providerType: 'stt' | 'llm' | 'tts',
  providerName: string
): Promise<ProviderValidationResult> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/providers/validate?provider_type=${providerType}&provider_name=${providerName}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to validate provider: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get list of all available providers and their credential status
 */
export async function getAvailableProviders(): Promise<AvailableProvidersResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/providers/list`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch available providers: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Check if a provider can be used (has all required credentials)
 */
export async function canUseProvider(
  providerType: 'stt' | 'llm' | 'tts',
  providerName: string
): Promise<boolean> {
  try {
    const result = await validateProviderCredentials(providerType, providerName);
    return result.valid;
  } catch (error) {
    console.error('Error checking provider availability:', error);
    return false;
  }
}

