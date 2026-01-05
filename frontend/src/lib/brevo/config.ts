// Brevo (Sendinblue) Configuration
export const BREVO_CONFIG = {
  apiKey: process.env.BREVO_API_KEY || '',
  apiUrl: 'https://api.brevo.com/v3',
  
  // Sender information
  sender: {
    name: 'Spartan Club',
    email: process.env.BREVO_SENDER_EMAIL || 'spartanmarketcol@gmail.com',
  },

  // Template IDs (create these in Brevo dashboard)
  templates: {
    welcome: parseInt(process.env.BREVO_TEMPLATE_WELCOME || '0'),
    newsletter: parseInt(process.env.BREVO_TEMPLATE_NEWSLETTER || '0'),
    purchaseConfirmation: parseInt(process.env.BREVO_TEMPLATE_PURCHASE || '0'),
    creditLow: parseInt(process.env.BREVO_TEMPLATE_CREDIT_LOW || '0'),
  },

  // List IDs (create these in Brevo dashboard)
  lists: {
    newsletter: parseInt(process.env.BREVO_LIST_NEWSLETTER || '0'),
    users: parseInt(process.env.BREVO_LIST_USERS || '0'),
  },
} as const;

export const isBrevoConfigured = () => {
  return !!BREVO_CONFIG.apiKey && BREVO_CONFIG.apiKey.length > 10;
};
