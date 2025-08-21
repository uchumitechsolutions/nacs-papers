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
    try {
      // Validate credentials
      if (!this.config.consumerKey || !this.config.consumerSecret) {
        throw new Error('Consumer Key and Consumer Secret are required');
      }

      // Create Basic Auth string
      const credentials = `${this.config.consumerKey}:${this.config.consumerSecret}`;
      const auth = Buffer.from(credentials).toString('base64');
      
      console.log(`Requesting access token from: ${this.baseUrl}/oauth/v1/generate`);
      console.log(`Using environment: ${this.config.environment}`);
      
      const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      const responseText = await response.text();
      console.log(`Token response status: ${response.status}`);
      console.log(`Token response: ${responseText}`);

      if (!response.ok) {
        throw new Error(`Failed to get access token. Status: ${response.status}, Response: ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!data.access_token) {
        throw new Error(`No access token in response: ${responseText}`);
      }

      console.log(`✅ Access token obtained successfully`);
      return data.access_token;
    } catch (error) {
      console.error('Access token generation failed:', error);
      throw error;
    }
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
    // Remove any non-digit characters except +
    let formatted = phoneNumber.replace(/[^\d+]/g, '');
    
    // Handle different input formats
    if (formatted.startsWith('+254')) {
      formatted = formatted.slice(1); // Remove + to get 254XXXXXXXXX
    } else if (formatted.startsWith('254')) {
      // Already in correct format
      formatted = formatted;
    } else if (formatted.startsWith('0')) {
      // Convert 0712345678 to 254712345678
      formatted = '254' + formatted.slice(1);
    } else if (formatted.startsWith('7') || formatted.startsWith('1')) {
      // Convert 712345678 to 254712345678
      formatted = '254' + formatted;
    } else {
      throw new Error('Invalid phone number format. Use formats like 254712345678, 0712345678, or +254712345678');
    }
    
    // Validate final format
    if (formatted.length !== 12) {
      throw new Error(`Phone number must be exactly 12 digits after formatting. Got ${formatted.length} digits: ${formatted}`);
    }
    
    // Validate that it's a valid Kenyan mobile number
    if (!formatted.match(/^254[17]\d{8}$/)) {
      throw new Error('Invalid Kenyan mobile number. Must start with 2547 or 2541');
    }
    
    return formatted;
  }

  /**
   * Initiate STK Push payment
   */
  async initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
    try {
      console.log(`🚀 Initiating STK Push for phone: ${request.phoneNumber}, amount: ${request.amount}`);
      
      const accessToken = await this.getAccessToken();
      const password = this.generatePassword();
      const timestamp = this.getTimestamp();
      const phoneNumber = this.formatPhoneNumber(request.phoneNumber);

      console.log(`📱 Formatted phone number: ${phoneNumber}`);

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

      console.log(`📤 STK Push payload:`, JSON.stringify(payload, null, 2));

      const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      console.log(`📥 STK Push response status: ${response.status}`);
      console.log(`📥 STK Push response: ${responseText}`);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (response.ok && data.ResponseCode === '0') {
        console.log(`✅ STK Push initiated successfully`);
        return {
          success: true,
          checkoutRequestId: data.CheckoutRequestID,
          responseCode: data.ResponseCode,
          responseDescription: data.ResponseDescription,
          customerMessage: data.CustomerMessage
        };
      } else {
        console.log(`❌ STK Push failed: ${data.ResponseDescription || data.errorMessage}`);
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