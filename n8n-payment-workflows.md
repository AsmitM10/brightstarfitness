# n8n Payment Workflows Documentation

This document describes the n8n workflows required for the payment system integration.

## Environment Variables Required

Add these to your `.env.local`:
```
NEXT_PUBLIC_N8N_PAYMENT_WEBHOOK_URL=https://your-n8n-instance/webhook/payment-success
```

## Workflow 1: Payment Success Notification

### Purpose
Send Telegram notification to user when payment is successfully completed and invoice is generated.

### Trigger
- **Type**: Webhook
- **Method**: POST
- **Path**: `/payment-success`

### Webhook Payload
```json
{
  "user_id": "uuid",
  "payment_id": "uuid",
  "invoice_id": "uuid",
  "amount": 1000,
  "plan_name": "Monthly",
  "invoice_number": "INV-123456"
}
```

### Workflow Steps

1. **Webhook Trigger Node**
   - Method: POST
   - Path: `/payment-success`
   - Authentication: None (or add header auth for security)

2. **Supabase Node - Fetch User Details**
   - Operation: Select
   - Table: `user4`
   - Filter: `id` = `{{ $json.user_id }}`
   - Select columns: `username`, `chat_id`, `whatsapp_no`, `email`

3. **Supabase Node - Fetch Invoice Details**
   - Operation: Select
   - Table: `invoices`
   - Filter: `id` = `{{ $json.invoice_id }}`
   - Select columns: `invoice_number`, `total_amount`, `generated_at`

4. **Code Node - Format Success Message**
   ```javascript
   const user = $input.item.json.user
   const invoice = $input.item.json.invoice
   const payment = $input.item.json
   
   const message = `✅ *Payment Successful!*
   
   Hello ${user.username},
   
   Your payment has been successfully processed.
   
   📄 *Invoice Details:*
   Invoice #: ${payment.invoice_number}
   Amount: ₹${payment.amount}
   Plan: ${payment.plan_name}
   Date: ${new Date().toLocaleDateString()}
   
   Thank you for choosing Bright Star Fitness!`
   
   return {
     chat_id: user.chat_id,
     message: message
   }
   ```

5. **Telegram Node - Send Message**
   - Operation: Send
   - Chat ID: `{{ $json.chat_id }}`
   - Text: `{{ $json.message }}`
   - Parse Mode: Markdown

6. **IF Node - Check Email**
   - Condition: `{{ $json.user.email != null }}`
   - If true: Send email notification (optional)

7. **Email Node (Optional)**
   - Send invoice PDF to user's email
   - Subject: "Payment Confirmation - Bright Star Fitness"
   - Body: Payment confirmation details

### Error Handling
- Add error nodes after each Supabase operation
- Log errors to console
- Send error notification to admin

---

## Workflow 2: Payment Failed Notification

### Purpose
Notify user when payment fails.

### Trigger
- **Type**: Webhook
- **Method**: POST
- **Path**: `/payment-failed`

### Webhook Payload
```json
{
  "user_id": "uuid",
  "payment_id": "uuid",
  "error_message": "Payment failed due to insufficient funds"
}
```

### Workflow Steps

1. **Webhook Trigger Node**
   - Method: POST
   - Path: `/payment-failed`

2. **Supabase Node - Fetch User Details**
   - Table: `user4`
   - Filter: `id` = `{{ $json.user_id }}`

3. **Code Node - Format Error Message**
   ```javascript
   const user = $input.item.json.user
   const error = $input.item.json.error_message
   
   const message = `❌ *Payment Failed*
   
   Hello ${user.username},
   
   We were unable to process your payment.
   
   Error: ${error}
   
   Please try again or contact support if the issue persists.
   
   To retry payment, visit: https://brightstarfitness.com/dashboard/${user.userpage_slug}`
   
   return {
     chat_id: user.chat_id,
     message: message
   }
   ```

4. **Telegram Node - Send Message**
   - Chat ID: `{{ $json.chat_id }}`
   - Text: `{{ $json.message }}`
   - Parse Mode: Markdown

---

## Workflow 3: Subscription Expiry Reminder

### Purpose
Send reminder to users whose subscription is expiring soon.

### Trigger
- **Type**: Cron
- **Schedule**: Daily at 9:00 AM IST

### Workflow Steps

1. **Cron Trigger Node**
   - Cron Expression: `0 9 * * *` (Daily at 9 AM)

2. **Code Node - Calculate Expiry Date**
   ```javascript
   const tomorrow = new Date()
   tomorrow.setDate(tomorrow.getDate() + 1)
   const expiryDate = tomorrow.toISOString().split('T')[0]
   
   return {
     expiry_date: expiryDate
   }
   ```

3. **Supabase Node - Fetch Expiring Subscriptions**
   - Table: `user_subscriptions`
   - Join with `user4` table
   - Filter: `end_date` = `{{ $json.expiry_date }}`
   - Filter: `status` = 'active'
   - Select: `user_id`, `end_date`, `user:username`, `user:chat_id`, `user:userpage_slug`

4. **Split in Batches Node**
   - Batch Size: 1
   - Reset: No

5. **Code Node - Format Reminder Message**
   ```javascript
   const subscription = $input.item.json
   const user = subscription.user
   
   const message = `⚠️ *Subscription Expiring Soon*
   
   Hello ${user.username},
   
   Your subscription will expire tomorrow (${new Date(subscription.end_date).toLocaleDateString()}).
   
   To continue accessing sessions, please renew your subscription.
   
   Renew now: https://brightstarfitness.com/dashboard/${user.userpage_slug}
   
   Thank you for being part of Bright Star Fitness!`
   
   return {
     chat_id: user.chat_id,
     message: message
   }
   ```

6. **Telegram Node - Send Message**
   - Chat ID: `{{ $json.chat_id }}`
   - Text: `{{ $json.message }}`
   - Parse Mode: Markdown

7. **Loop Back** to Split in Batches

---

## Workflow 4: Invoice Resend

### Purpose
Resend invoice to user when requested by admin.

### Trigger
- **Type**: Webhook
- **Method**: POST
- **Path**: `/payment-success` (reused with different payload)

### Webhook Payload
```json
{
  "type": "resend_invoice",
  "invoice_id": "uuid",
  "invoice_number": "INV-123456",
  "user_id": "uuid",
  "amount": 1000,
  "chat_id": "telegram_chat_id"
}
```

### Workflow Steps

1. **Webhook Trigger Node**
   - Method: POST
   - Path: `/payment-success`

2. **IF Node - Check Type**
   - Condition: `{{ $json.type == 'resend_invoice' }}`
   - If true: Continue to resend flow
   - If false: Continue to success notification flow

3. **Code Node - Format Resend Message**
   ```javascript
   const message = `📄 *Invoice Resent*
   
   Here is your invoice as requested:
   
   Invoice #: {{ $json.invoice_number }}
   Amount: ₹{{ $json.amount }}
   
   You can view your full invoice history in your dashboard.`
   
   return {
     chat_id: $json.chat_id,
     message: message
   }
   ```

4. **Telegram Node - Send Message**
   - Chat ID: `{{ $json.chat_id }}`
   - Text: `{{ $json.message }}`
   - Parse Mode: Markdown

---

## Workflow 5: Subscription Status Update (Optional)

### Purpose
Update user subscription status based on payment status.

### Trigger
- **Type**: Webhook
- **Method**: POST
- **Path**: `/subscription-update`

### Webhook Payload
```json
{
  "user_id": "uuid",
  "subscription_id": "uuid",
  "status": "active"
}
```

### Workflow Steps

1. **Webhook Trigger Node**
   - Method: POST
   - Path: `/subscription-update`

2. **Supabase Node - Update Subscription**
   - Table: `user_subscriptions`
   - Operation: Update
   - Filter: `id` = `{{ $json.subscription_id }}`
   - Update: `status` = `{{ $json.status }}`

3. **IF Node - Check Status**
   - Condition: `{{ $json.status == 'active' }}`
   - If true: Send activation message
   - If false: Send deactivation message

4. **Code Node - Format Status Message**
   ```javascript
   const isActive = $json.status == 'active'
   const message = isActive 
     ? '✅ Your subscription is now active!'
     : '❌ Your subscription has been deactivated.'
   
   return { message }
   ```

5. **Supabase Node - Fetch User Chat ID**
   - Table: `user4`
   - Filter: `id` = `{{ $json.user_id }}`

6. **Telegram Node - Send Status Update**
   - Chat ID: `{{ $json.chat_id }}`
   - Text: `{{ $json.message }}`

---

## Integration with Existing Session Notification Workflow

### Enhancement Required

Modify the existing session notification workflow to check subscription status before sending notifications.

### Additional Step in Session Notification Workflow

After fetching users, add:

1. **Supabase Node - Check Subscription Status**
   - Table: `user_subscriptions`
   - Join with `user4`
   - Filter: `user_id` in (list of users)
   - Filter: `status` = 'active'
   - Filter: `end_date` >= current date

2. **Code Node - Filter Active Subscribers**
   ```javascript
   const users = $input.all()
   const activeUsers = users.filter(user => 
     user.json.subscription && 
     user.json.subscription.status === 'active' &&
     new Date(user.json.subscription.end_date) >= new Date()
   )
   
   return activeUsers
   ```

3. **Continue** with existing message formatting and Telegram sending

---

## Testing the Workflows

### Test Payment Success

```bash
curl -X POST https://your-n8n-instance/webhook/payment-success \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-uuid",
    "payment_id": "test-payment-uuid",
    "invoice_id": "test-invoice-uuid",
    "amount": 1000,
    "plan_name": "Monthly",
    "invoice_number": "INV-123456"
  }'
```

### Test Payment Failed

```bash
curl -X POST https://your-n8n-instance/webhook/payment-failed \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-uuid",
    "payment_id": "test-payment-uuid",
    "error_message": "Payment failed"
  }'
```

### Test Invoice Resend

```bash
curl -X POST https://your-n8n-instance/webhook/payment-success \
  -H "Content-Type: application/json" \
  -d '{
    "type": "resend_invoice",
    "invoice_id": "test-invoice-uuid",
    "invoice_number": "INV-123456",
    "user_id": "test-user-uuid",
    "amount": 1000,
    "chat_id": "test-chat-id"
  }'
```

---

## Security Considerations

1. **Webhook Authentication**: Add authentication to webhooks using:
   - Header-based auth (API key in headers)
   - Query parameter auth
   - Or use n8n's built-in webhook authentication

2. **Rate Limiting**: Implement rate limiting on webhooks to prevent abuse

3. **Error Logging**: Log all errors for debugging and monitoring

4. **Data Validation**: Validate all incoming webhook payloads

5. **Sensitive Data**: Never include full payment details in Telegram messages

---

## Monitoring and Maintenance

1. **Execution Logs**: Monitor workflow execution logs regularly
2. **Error Tracking**: Set up error notifications for failed executions
3. **Performance**: Monitor workflow execution time
4. **Usage**: Track webhook usage patterns
5. **Updates**: Keep workflows updated with any system changes

---

## Next Steps

1. Create the workflows in your n8n instance
2. Test each workflow with sample data
3. Integrate with the backend APIs
4. Monitor initial executions
5. Adjust based on real-world usage
