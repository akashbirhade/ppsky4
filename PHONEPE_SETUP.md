# PhonePe Payment Gateway Configuration

## Setup Instructions

### 1. Get PhonePe Merchant Account
- Visit: https://merchant.phonepe.com/
- Sign up and create a merchant account
- Complete KYC verification
- You will receive:
  - Merchant ID
  - Merchant Key (API Key)
  - App ID

### 2. Environment Variables
Add these to your `.env.local` file:

```env
# PhonePe Configuration
PHONEPE_ENV=sandbox              # Use 'sandbox' for testing, 'production' for live
PHONEPE_MERCHANT_ID=MERCHANTUAT  # Replace with your Merchant ID
PHONEPE_MERCHANT_KEY=MerchantKey123  # Replace with your Merchant Key
PHONEPE_APP_ID=1111             # Replace with your App ID

# Application URLs (for callbacks)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Test Credentials (Sandbox)
For testing purposes, use these credentials:

```
PHONEPE_MERCHANT_ID=MERCHANTUAT
PHONEPE_MERCHANT_KEY=MerchantKey123
PHONEPE_APP_ID=1111
PHONEPE_ENV=sandbox
```

### 4. API Endpoints Created

#### Initiate Payment
- **Endpoint**: `POST /api/payment/phonepe/initiate`
- **Request Body**:
  ```json
  {
    "userId": "user_123",
    "plan": "gold",
    "couponCode": "SHADI50",
    "mobileNumber": "9876543210"
  }
  ```
- **Response**: PhonePe payment URL for redirect

#### Payment Callback
- **Endpoint**: `POST /api/payment/phonepe/callback`
- **Purpose**: Handles PhonePe payment success/failure callback

#### Payment Status Check
- **Endpoint**: `GET /api/payment/phonepe/status?merchantTransactionId=TXN_XXXX`
- **Purpose**: Check payment status after transaction

### 5. Integration Flow

1. User selects **PhonePe** as payment method
2. User enters **10-digit mobile number**
3. Click **"Pay via PhonePe"** button
4. Frontend calls `/api/payment/phonepe/initiate`
5. Backend generates PhonePe payment request
6. User redirected to **PhonePe app/website**
7. User completes payment securely
8. PhonePe sends callback to your server
9. Payment verified and subscription activated
10. User redirected to `/payment/success`

### 6. Production Deployment

Before going live:

1. **Change environment**:
   ```
   PHONEPE_ENV=production
   ```

2. **Update API endpoint**:
   - Sandbox: `https://api-sandbox.phonepe.com/apis/hermes`
   - Production: `https://api.phonepe.com/apis/hermes`

3. **Update credentials** with production merchant details

4. **Update callback URL** in PhonePe dashboard:
   - Set to: `https://yourdomain.com/api/payment/phonepe/callback`

5. **Test thoroughly** with small amounts before full launch

### 7. Transaction Flow Details

#### Request Signature Generation
```
Payload = Base64(JSON_DATA)
HashPayload = Payload + '/pg/v1/pay' + MERCHANT_KEY
X-VERIFY = SHA256(HashPayload) + '###1'
```

#### Response Verification
```
Signature Format: HASH###KeyIndex
Verify by recalculating hash with same formula
```

#### Amount Format
- All amounts must be in **paise** (1 rupee = 100 paise)
- Example: ₹100 = 10000 paise

### 8. Webhook Configuration

**Webhook Handler**: `/api/payment/phonepe/callback`

**Webhook Events**:
- PAYMENT_SUCCESS
- PAYMENT_FAILED
- PAYMENT_PENDING

**Security**: All webhooks are verified using signature matching

### 9. Error Handling

Common error responses:
- `INVALID_MERCHANT_ID`: Check merchant credentials
- `INVALID_REQUEST`: Validate request payload
- `PAYMENT_DECLINED`: User cancelled or insufficient funds
- `TRANSACTION_TIMEOUT`: Payment exceeded time limit

### 10. Support & Documentation

- PhonePe Developer Docs: https://developer.phonepe.com/
- PhonePe Support: support@phonepe.com
- Sandbox Test Account: Use provided test credentials

### 11. Security Best Practices

✅ Always validate signatures on callbacks
✅ Store merchant key securely in environment variables
✅ Use HTTPS for all API calls
✅ Never log sensitive payment data
✅ Implement rate limiting on payment endpoints
✅ Audit all payment transactions
✅ Regular security audits recommended

### 12. Testing Checklist

- [ ] Sandbox payment initiation works
- [ ] PhonePe redirect works
- [ ] Payment success callback received
- [ ] Subscription activated after payment
- [ ] Payment status check works
- [ ] Error handling tested
- [ ] Coupon application works with PhonePe
- [ ] GST calculation correct
- [ ] Transaction ID generated properly
- [ ] Email confirmation sent to user

---

**For any issues or questions about PhonePe integration, contact:** support@phonepe.com
