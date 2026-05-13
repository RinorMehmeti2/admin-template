import { z } from 'zod';
import type { TFunction } from 'i18next';

/*
 * Reusable zod fragments. Build them inside components via useMemo([t])
 * so messages re-translate on locale change.
 */

export function makeAddressSchema(t: TFunction) {
  return z.object({
    street: z.string().min(1, t('forms.zod.required')),
    city: z.string().min(1, t('forms.zod.required')),
    zip: z
      .string()
      .min(1, t('forms.zod.required'))
      .regex(/^[A-Z0-9 -]{3,10}$/i, t('forms.zod.invalidZip')),
    country: z.string().min(2, t('forms.zod.required')),
  });
}

export function makeMoneySchema(t: TFunction) {
  return z.object({
    amount: z.number({ message: t('forms.zod.required') }).nonnegative(t('forms.zod.nonnegative')),
    currency: z.enum(['USD', 'EUR', 'GBP']),
  });
}

export function makeLineItemSchema(t: TFunction) {
  return z.object({
    sku: z.string().min(1, t('forms.zod.required')),
    qty: z
      .number({ message: t('forms.zod.required') })
      .int(t('forms.zod.integer'))
      .min(1, t('forms.zod.minQty')),
    unitPrice: z
      .number({ message: t('forms.zod.required') })
      .nonnegative(t('forms.zod.nonnegative')),
    taxRatePct: z
      .number({ message: t('forms.zod.required') })
      .min(0)
      .max(100),
    notes: z.string().optional(),
  });
}

export type LineItem = z.infer<ReturnType<typeof makeLineItemSchema>>;
export type AddressValues = z.infer<ReturnType<typeof makeAddressSchema>>;
