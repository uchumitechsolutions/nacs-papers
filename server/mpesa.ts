import crypto from 'crypto';

export interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  businessShortCode: string;
  passkey: string;
  environment: 'sandbox' | 'production';
}

export interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  callbackUrl: string;
}

export interface STKPushResponse {
  success: boolean;
  checkoutRequestId?: string;
  responseCode?: string;
  responseDescription?: string;
  customerMessage?: string;
  errorCode?: string;
  errorMessage?: string;
}

export class MpesaService {
  private config: MpesaConfig;
  private baseUrl: string;

  constructor(config: MpesaConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production' 
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  /**
   * Generate OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');
    
    const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Generate password for STK Push
   */
  private generatePassword(): string {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(
      `${this.config.businessShortCode}${this.config.passkey}${timestamp}`
    ).toString('base64');
    
    return password;
  }

  /**
   * Get current timestamp in the required format
   */
  private getTimestamp(): string {
    return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  }

  /**
   * Format phone number to required format (254XXXXXXXXX)
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    let formatted = phoneNumber.replace(/\D/g, '');
    
    // Handle different formats
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.slice(1);
    } else if (formatted.startsWith('7') || formatted.startsWith('1')) {
      formatted = '254' + formatted;
    } else if (!formatted.startsWith('254')) {
      throw new Error('Invalid phone number format');
    }
    
    // Validate length
    if (formatted.length !== 12) {
      throw new Error('Phone number must be 12 digits long');
    }
    
    return formatted;
  }

  /**
   * Initiate STK Push payment
   */
  async initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const password = this.generatePassword();
      const timestamp = this.getTimestamp();
      const phoneNumber = this.formatPhoneNumber(request.phoneNumber);

      const payload = {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(request.amount), // Ensure integer
        PartyA: phoneNumber,
        PartyB: this.config.businessShortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: request.callbackUrl,
        AccountReference: request.accountReference,
        TransactionDesc: request.transactionDesc
      };

      const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.ResponseCode === '0') {
        return {
          success: true,
          checkoutRequestId: data.CheckoutRequestID,
          responseCode: data.ResponseCode,
          responseDescription: data.ResponseDescription,
          customerMessage: data.CustomerMessage
        };
      } else {
        return {
          success: false,
          errorCode: data.errorCode || data.ResponseCode,
          errorMessage: data.errorMessage || data.ResponseDescription || 'STK Push failed'
        };
      }
    } catch (error) {
      console.error('STK Push error:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Query STK Push transaction status
   */
  async querySTKPushStatus(checkoutRequestId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const password = this.generatePassword();
      const timestamp = this.getTimestamp();

      const payload = {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const response = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      return await response.json();
    } catch (error) {
      console.error('STK Push query error:', error);
      throw error;
    }
  }
}

/**
 * Create M-Pesa service instance
 */
export function createMpesaService(): MpesaService {
  const config: MpesaConfig = {
    consumerKey: process.env.MPESA_CONSUMER_KEY || '',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
    businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE || '',
    passkey: process.env.MPESA_PASSKEY || '',
    environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
  };

  // Validate required environment variables
  const requiredVars = ['MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET', 'MPESA_BUSINESS_SHORT_CODE', 'MPESA_PASSKEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required M-Pesa environment variables: ${missingVars.join(', ')}`);
  }

  return new MpesaService(config);
}