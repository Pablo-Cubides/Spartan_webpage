/**
 * Feature flag identifiers.
 *
 * Single source of truth for flag names. Both client and server import from
 * here so that flag references can't drift.
 *
 * Adding a new flag?
 *   1. Add the identifier here
 *   2. Add a default value in `defaults`
 *   3. Document in docs/specs/<feature>/spec.md
 *   4. Create the flag in Harness UI: Feature Flags → New Flag
 */

export const FLAGS = {
  /** Enables Layer 2 strategist plan in Coach Espartano (gradual 10/50/100%). */
  COACH_LAYER2_ENABLED: 'coach_layer2_enabled',
  /** Master kill switch for Stripe payment gateway. */
  PAYMENT_STRIPE_ENABLED: 'payment_stripe_enabled',
  /** Master kill switch for MercadoPago payment gateway. */
  PAYMENT_MERCADOPAGO_ENABLED: 'payment_mercadopago_enabled',
  /** Toggles the new asesor-estilo image generation flow. */
  ASESOR_NEW_FLOW_ENABLED: 'asesor_new_flow_enabled',
} as const;

export type FlagKey = typeof FLAGS[keyof typeof FLAGS];

/**
 * Defaults applied if Harness FF is unreachable. These should match the
 * "fail closed" / "fail open" decision for each flag.
 */
export const defaults: Record<FlagKey, boolean> = {
  [FLAGS.COACH_LAYER2_ENABLED]: false,           // fail closed (don't expose new feature)
  [FLAGS.PAYMENT_STRIPE_ENABLED]: true,          // fail open (don't block payments)
  [FLAGS.PAYMENT_MERCADOPAGO_ENABLED]: true,     // fail open (don't block payments)
  [FLAGS.ASESOR_NEW_FLOW_ENABLED]: false,        // fail closed
};
