import { LicensePlan } from '../types/music';

export type LabModuleId =
  | 'keyboard'
  | 'intervals'
  | 'chords'
  | 'scales'
  | 'progressions'
  | 'melody';

export interface ServerLicenseResponse {
  valid: boolean;
  plan: LicensePlan;
  licenseType: 'free' | 'perpetual';
  verifiedByServer: boolean;
  checkedAt: string;
  message?: string;
}

const LARAVEL_API_BASE =
  (import.meta.env?.VITE_LARAVEL_API_URL as string | undefined)?.replace(/\/$/, '') || '';

/**
 * LicenseAdapter manages entitlements for Rumie Music Tools.
 * - Free tier: World 1 complete (5 levels), Auditory Diagnostic, first medals, limited Lab.
 * - Premium tier: All 8 worlds (40 levels), full Lab, full analytics, all rewards & Diploma (perpetual).
 * - Prepared to validate server-side against Laravel Sanctum/API without building a custom payment gateway.
 */
export const LicenseAdapter = {
  canAccessWorld(worldId: number, plan: LicensePlan): boolean {
    if (plan === 'premium') return true;
    return worldId === 1;
  },

  canAccessLabModule(moduleId: LabModuleId, plan: LicensePlan): boolean {
    if (plan === 'premium') return true;
    return moduleId === 'keyboard' || moduleId === 'intervals';
  },

  canAccessAdvancedAnalytics(plan: LicensePlan): boolean {
    return plan === 'premium';
  },

  getPlanDetails(plan: LicensePlan) {
    if (plan === 'premium') {
      return {
        label: 'Licencia Premium Perpetua',
        shortLabel: 'Premium',
        worldsUnlocked: 8,
        levelsUnlocked: 40,
        labAccess: 'Completo (6 módulos)',
      };
    }
    return {
      label: 'Plan Gratuito',
      shortLabel: 'Gratuito',
      worldsUnlocked: 1,
      levelsUnlocked: 5,
      labAccess: 'Limitado (Teclado e Intervalos)',
    };
  },

  /**
   * Server-side Laravel license check contract.
   * When VITE_LARAVEL_API_URL is configured in production, this verifies the user's
   * perpetual Rumie Music Tools license directly on the Laravel backend.
   */
  async verifyLicenseWithLaravel(
    fallbackLocalPlan: LicensePlan,
    bearerToken?: string
  ): Promise<ServerLicenseResponse> {
    if (!LARAVEL_API_BASE) {
      return {
        valid: true,
        plan: fallbackLocalPlan,
        licenseType: fallbackLocalPlan === 'premium' ? 'perpetual' : 'free',
        verifiedByServer: false,
        checkedAt: new Date().toISOString(),
        message: 'Modo prototipo local. Configura VITE_LARAVEL_API_URL para validar con Laravel.',
      };
    }

    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };
      if (bearerToken) {
        headers.Authorization = `Bearer ${bearerToken}`;
      }

      const response = await fetch(`${LARAVEL_API_BASE}/api/rumie/ear-training/license`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as {
        active?: boolean;
        plan?: LicensePlan;
        license_type?: 'free' | 'perpetual';
      };

      const plan: LicensePlan = data.active && data.plan === 'premium' ? 'premium' : 'free';
      return {
        valid: true,
        plan,
        licenseType: data.license_type ?? (plan === 'premium' ? 'perpetual' : 'free'),
        verifiedByServer: true,
        checkedAt: new Date().toISOString(),
      };
    } catch {
      return {
        valid: false,
        plan: fallbackLocalPlan,
        licenseType: fallbackLocalPlan === 'premium' ? 'perpetual' : 'free',
        verifiedByServer: false,
        checkedAt: new Date().toISOString(),
        message: 'No se pudo contactar al servidor Laravel; usando estado de caché local.',
      };
    }
  },
};
