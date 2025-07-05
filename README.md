# Digital Store - Netlify Deployment

This project has been converted from PHP to Netlify Functions for deployment on Netlify.

## Setup Instructions

### 1. Environment Variables
Set these environment variables in your Netlify dashboard:

\`\`\`
ATLANTIC_API_KEY=your_atlantic_api_key_here
FIREBASE_DATABASE_URL=https://store-velz-default-rtdb.firebaseio.com
LINK_BELAJAR_CODING=your_secret_link_here
LINK_EBOOK_JS=your_secret_link_here
LINK_GRUP_TELEGRAM=your_secret_link_here
LINK_MENTORING=your_secret_link_here
\`\`\`

### 2. Deploy to Netlify

#### Option A: GitHub Integration
1. Push this code to a GitHub repository
2. Connect your GitHub repo to Netlify
3. Set the build settings:
   - Build command: `npm install`
   - Publish directory: `.`
   - Functions directory: `netlify/functions`

#### Option B: Netlify CLI
\`\`\`bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
\`\`\`

### 3. Local Development
\`\`\`bash
# Install dependencies
npm install

# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Start local development server
netlify dev
\`\`\`

## File Structure
\`\`\`
├── index.html              # Main landing page
├── Payment.html           # Payment form
├── db.html               # Transaction checker
├── tf.html               # Transfer form
├── style.css             # Styles
├── script.js             # Frontend JavaScript
├── netlify.toml          # Netlify configuration
├── package.json          # Node.js dependencies
└── netlify/functions/    # Serverless functions
    ├── process-payment.js
    ├── check-payment.js
    └── transfer-ewallet.js
\`\`\`

## API Endpoints
- `/.netlify/functions/process-payment` - Create QRIS payment
- `/.netlify/functions/check-payment` - Check payment status
- `/.netlify/functions/transfer-ewallet` - Transfer to e-wallet

## Security Notes
- All sensitive data (API keys, secret links) are stored as environment variables
- CORS is properly configured for cross-origin requests
- Input validation is implemented in all functions

## Troubleshooting
1. If functions don't work, check the Netlify function logs
2. Ensure all environment variables are set correctly
3. Verify that the Atlantic API key is valid
4. Check Firebase database permissions
\`\`\`

```typescriptreact file="process_payment.php" isDeleted="true"
...deleted...
