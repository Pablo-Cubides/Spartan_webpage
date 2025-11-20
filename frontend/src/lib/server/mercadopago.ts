
export type PreferenceItem = {
  title: string;
  quantity: number;
  unit_price: number;
};

export type PreferenceBackUrls = {
  success: string;
  failure: string;
  pending?: string;
};

export async function createPreference(
  items: PreferenceItem[],
  back_urls: PreferenceBackUrls,
  external_reference: string
) {
  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!mpToken) {
    throw new Error('MercadoPago token not configured');
  }

  const preferencePayload = {
    items,
    back_urls,
    external_reference,
    auto_return: 'approved',
  };

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${mpToken}`,
    },
    body: JSON.stringify(preferencePayload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`MercadoPago error: ${JSON.stringify(errorData)}`);
  }

  return await res.json();
}
