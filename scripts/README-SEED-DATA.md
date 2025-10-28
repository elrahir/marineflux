# Mock Data Seeding Guide - MarineFlux

## Overview

The `seed-mock-data.ts` script populates your Firestore database with realistic maritime business data for testing and development purposes.

## What Gets Seeded

The script creates a complete, realistic database scenario including:

### 📊 Users
- **20 Shipowners** with:
  - Company profiles (Turkish maritime company names)
  - 2 vessels each with realistic maritime details
  - Contact information (phone, address, city)
  - Active orders and total spending metrics

- **20 Suppliers** with:
  - Mixed supplier types (Product suppliers & Service providers)
  - Categories (11 supplier categories + 9 service provider categories)
  - Ratings (3.5-5 stars) and review counts
  - Verification status
  - Professional descriptions and websites

### 📝 RFQs (Requests for Quotation)
- **30-40 RFQs** with:
  - Realistic maritime supply titles and descriptions
  - Mix of product supplies and services
  - Vessel information linked to shipowners
  - Various statuses (open, closed, awarded)
  - Deadlines and quotation counts

### 💰 Quotations
- **~200 Quotations** with:
  - 5-7 quotations per RFQ
  - Realistic pricing ($5,000-$55,000)
  - Various delivery times
  - Professional notes
  - Supplier ratings included
  - Mixed statuses (pending, accepted, rejected)

### 📦 Orders
- **100 Orders** with:
  - Links to RFQs, quotations, shipowners, and suppliers
  - Order timeline tracking (pending → confirmed → in_progress → completed)
  - Payment status (pending, paid)
  - Realistic amounts and descriptions

### 💬 Chats & Messages
- **50+ Chat conversations** with:
  - Professional maritime business dialogues
  - 5-15 messages per conversation
  - Read/unread status
  - Realistic timestamps

### ⭐ Reviews
- **50+ Supplier reviews** with:
  - Ratings (4-5 stars, skewed to positive)
  - Professional testimonials
  - Links to orders and users

## Prerequisites

Before running the seed script:

1. **Firestore Project Configured**
   ```bash
   # Ensure you have the correct Firebase project set up
   # Check your .env.local file for Firebase configuration
   ```

2. **Service Account Key**
   ```bash
   # Verify serviceAccountKey.json exists in project root
   ls -la serviceAccountKey.json
   ```

3. **Dependencies Installed**
   ```bash
   npm install
   ```

## Usage

### Option 1: Using npm script (Recommended)

```bash
npm run seed-data
```

### Option 2: Direct ts-node execution

```bash
npx ts-node scripts/seed-mock-data.ts
```

### Option 3: Using Node (if compiled to JS)

```bash
node scripts/seed-mock-data.ts
```

## Expected Output

```
============================================================
🌱 MARINEFLUX MOCK DATA SEEDING
============================================================

🚢 Creating Shipowner Users...
  ✅ Created shipowner: Akdeniz Denizcilik A.Ş.
  ✅ Created shipowner: Ege Gemi İşletmeleri
  [... 13 more shipowners ...]

📦 Creating Supplier Users...
  ✅ Created supplier: Deniz Tedarik (spares)
  ✅ Created supplier: Gemi Makina (fire-safety)
  [... 48 more suppliers ...]

📝 Creating RFQs...
  ✅ Created RFQ: Urgent Engine Oil Supply
  ✅ Created RFQ: Ship Painting Required
  [... more RFQs ...]

💰 Creating Quotations...
  ✅ Created quotation: Deniz Tedarik - $12,500
  ✅ Created quotation: Gemi Makina - $18,750
  [... more quotations ...]

📦 Creating Orders...
  ✅ Created order: Urgent Engine Oil Supply - Status: confirmed
  ✅ Created order: Ship Painting Required - Status: in_progress
  [... more orders ...]

💬 Creating Chats and Messages...
  ✅ Created chat 1 with 8 messages
  ✅ Created chat 2 with 12 messages
  [... more chats ...]

⭐ Creating Reviews...
  ✅ Created review: Deniz Tedarik - Rating: 5/5
  ✅ Created review: Gemi Makina - Rating: 4/5
  [... more reviews ...]

============================================================
✨ SEEDING COMPLETED SUCCESSFULLY!
============================================================

📊 Summary:
  ✅ Shipowners: 15
  ✅ Suppliers: 50
  ✅ RFQs: 30-40
  ✅ Chats/Messages: 25+
  ✅ Reviews: 30+

🎉 Database is now populated with realistic maritime data!
```

## Firestore Collections Created

The script populates the following Firestore collections:

| Collection | Count | Description |
|-----------|-------|-------------|
| `users` | 40 | All users (shipowners + suppliers) |
| `shipowners` | 20 | Shipowner profiles |
| `suppliers` | 20 | Supplier profiles |
| `rfqs` | 30-40 | Requests for quotation |
| `quotations` | ~200 | Supplier quotations |
| `orders` | 100 | Placed orders |
| `chats` | 50+ | Chat conversations |
| `messages` | 250-750 | Chat messages |
| `reviews` | 50 | Supplier reviews |

## Testing Credentials

After seeding, you can log in with any of the created users:

### Shipowner Accounts
```
Email: shipowner1@marineflux.com
Password: test123

Email: shipowner2@marineflux.com
Password: test123

... (shipowner3 through shipowner15)
```

### Supplier Accounts
```
Email: supplier1@marineflux.com
Password: test123

Email: supplier2@marineflux.com
Password: test123

... (supplier3 through supplier50)
```

**Note:** You'll need to create these users first using the registration flow or the seed-users script.

## Customization

To customize the seeding:

1. **Change the number of users:**
   ```typescript
   const SHIPOWNERS = 15;  // Change this
   const SUPPLIERS = 50;   // Change this
   ```

2. **Add/modify company names:**
   Edit the arrays at the top of the script:
   ```typescript
   const shipownerNames = [ /* ... */ ];
   const supplierPrefixes = [ /* ... */ ];
   const supplierSuffixes = [ /* ... */ ];
   ```

3. **Modify RFQ titles/descriptions:**
   Edit the `rfqTitles` and `rfqDescriptions` objects

4. **Adjust pricing ranges:**
   Update the pricing calculations:
   ```typescript
   price: Math.floor(Math.random() * 50000) + 5000,  // $5,000-$55,000
   ```

## Troubleshooting

### Error: "Cannot find module 'firebase-admin'"
```bash
npm install firebase-admin --save-dev
```

### Error: "PERMISSION_DENIED: Missing or insufficient permissions"
- Check your Firebase project permissions
- Ensure serviceAccountKey.json has correct credentials
- Verify Firestore security rules allow writes

### Error: "ENOENT: no such file or directory, open 'serviceAccountKey.json'"
- Download the service account key from Firebase Console
- Place it in the project root directory
- Never commit this file to Git

### Script takes too long
- This is normal for ~500+ documents
- Firestore write operations are rate-limited
- If stuck, check Firestore console for activity

## Performance Notes

- **Execution Time:** 2-5 minutes depending on internet speed
- **API Calls:** ~600+ write operations
- **Data Size:** ~5-10 MB
- **Cost:** Minimal (under $0.01 with Firestore free tier)

## Next Steps

After seeding:

1. **Log in to the app:**
   ```bash
   npm run dev
   # Open http://localhost:3000/tr/login
   ```

2. **Test different user roles:**
   - Log in as a shipowner to create RFQs
   - Log in as a supplier to view and bid on RFQs
   - Check order tracking and messaging

3. **Verify data in Firestore Console:**
   - Open Firebase Console
   - Navigate to Firestore Database
   - Check each collection for seeded data

4. **Develop and test features:**
   - Test filtering and search
   - Test order workflows
   - Test messaging system
   - Test quotation comparison

## Clearing Data

To start fresh and re-seed:

```bash
# In Firebase Console:
# 1. Go to Firestore Database
# 2. Select each collection
# 3. Delete all documents
# 4. Then run: npm run seed-data
```

Or uncomment the clear function in the script (if implemented):

```typescript
// Uncomment in seedDatabase():
// await clearDatabase();
```

## Related Scripts

- **seed-users.ts** - Create just the users with API calls
- **delete-all-users.ts** - Delete all users from Firebase Auth
- **setup-test-data.ts** - Alternative setup script

## Order Timeline Details

### Enhanced Order Tracking

Each order now includes a comprehensive timeline that tracks all stages:

**Order Statuses:**
- `pending_supplier_approval` - Initial order created
- `pending_payment` - Supplier approved, awaiting payment
- `payment_awaiting_confirmation` - Payment made, awaiting confirmation
- `paid` - Payment confirmed
- `pending_shipowner_confirmation` - Awaiting shipowner confirmation
- `confirmed` - Order confirmed
- `in_progress` - Order being prepared
- `shipped` - Order shipped
- `delivered` - Order delivered
- `completed` - Order completed successfully

**Payment Statuses:**
- `pending` - Payment not made yet
- `payment_awaiting_confirmation` - Payment made, needs confirmation
- `paid` - Payment confirmed
- `refunded` - Payment refunded

### Calendar Integration

All order timeline events are now visible on the **Monthly Timeline Calendar** in the supplier dashboard:
- 🟢 **Green** - Payment events
- 🟣 **Purple** - Preparation (in_progress)
- 🔵 **Blue** - Shipping/Delivery
- 🟢 **Emerald** - Completed
- 🔴 **Red** - Cancelled

This provides a visual overview of all order activities across a 4-week period (1 week before + 3 weeks after today).

## Support

For issues or questions:
1. Check the script output for errors
2. Review Firestore console for data validation
3. Check Firebase project permissions
4. Ensure all environment variables are set

---

**Last Updated:** October 27, 2025
**Version:** 2.0.0
**Compatible with:** MarineFlux v0.8.0+
