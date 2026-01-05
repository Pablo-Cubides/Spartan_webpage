// Brevo API Client
import { BREVO_CONFIG } from './config';

export interface BrevoContact {
  email: string;
  attributes?: {
    FIRSTNAME?: string;
    LASTNAME?: string;
    NAME?: string;
    ALIAS?: string;
    SMS?: string;
  };
  listIds?: number[];
  updateEnabled?: boolean;
}

export interface BrevoEmailParams {
  to: { email: string; name?: string }[];
  sender?: { email: string; name: string };
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: number;
  params?: Record<string, string | number>;
}

class BrevoClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = BREVO_CONFIG.apiKey;
    this.baseUrl = BREVO_CONFIG.apiUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error('BREVO_API_KEY is not configured');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Brevo API error (${response.status}): ${errorText}`
      );
    }

    return response.json();
  }

  /**
   * Add or update a contact
   */
  async createOrUpdateContact(contact: BrevoContact) {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        email: contact.email,
        attributes: contact.attributes || {},
        listIds: contact.listIds || [],
        updateEnabled: contact.updateEnabled ?? true,
      }),
    });
  }

  /**
   * Add contact to a list
   */
  async addContactToList(listId: number, emails: string[]) {
    return this.request(`/contacts/lists/${listId}/contacts/add`, {
      method: 'POST',
      body: JSON.stringify({ emails }),
    });
  }

  /**
   * Send a transactional email
   */
  async sendTransactionalEmail(params: BrevoEmailParams) {
    const payload: Record<string, unknown> = {
      to: params.to,
      sender: params.sender || BREVO_CONFIG.sender,
    };

    if (params.templateId) {
      payload.templateId = params.templateId;
      payload.params = params.params || {};
    } else {
      payload.subject = params.subject;
      payload.htmlContent = params.htmlContent;
      if (params.textContent) {
        payload.textContent = params.textContent;
      }
    }

    return this.request('/smtp/email', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Subscribe to newsletter
   */
  async subscribeToNewsletter(email: string, name?: string) {
    // Add to contact list
    await this.createOrUpdateContact({
      email,
      attributes: name ? { NAME: name } : undefined,
      listIds: BREVO_CONFIG.lists.newsletter ? [BREVO_CONFIG.lists.newsletter] : [],
    });

    // Send welcome email if template is configured
    if (BREVO_CONFIG.templates.welcome) {
      await this.sendTransactionalEmail({
        to: [{ email, name }],
        templateId: BREVO_CONFIG.templates.welcome,
        params: {
          NAME: name || 'Espartano',
        },
      });
    }

    return { success: true };
  }

  /**
   * Send purchase confirmation
   */
  async sendPurchaseConfirmation(
    email: string,
    data: {
      name: string;
      credits: number;
      amount: number;
      packageName: string;
    }
  ) {
    if (!BREVO_CONFIG.templates.purchaseConfirmation) {
      console.warn('Purchase confirmation template not configured');
      return;
    }

    return this.sendTransactionalEmail({
      to: [{ email, name: data.name }],
      templateId: BREVO_CONFIG.templates.purchaseConfirmation,
      params: {
        NAME: data.name,
        CREDITS: data.credits.toString(),
        AMOUNT: data.amount.toString(),
        PACKAGE_NAME: data.packageName,
      },
    });
  }

  /**
   * Send credit low notification
   */
  async sendCreditLowNotification(email: string, name: string, creditsRemaining: number) {
    if (!BREVO_CONFIG.templates.creditLow) {
      console.warn('Credit low template not configured');
      return;
    }

    return this.sendTransactionalEmail({
      to: [{ email, name }],
      templateId: BREVO_CONFIG.templates.creditLow,
      params: {
        NAME: name,
        CREDITS_REMAINING: creditsRemaining.toString(),
      },
    });
  }
}

export const brevoClient = new BrevoClient();
