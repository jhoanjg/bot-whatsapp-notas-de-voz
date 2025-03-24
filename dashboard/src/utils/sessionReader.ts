// Mock implementation of sessionReader for browser environment
// This replaces the Node.js fs/path implementation with browser-compatible code

// Define the session file structure based on the observed files
interface SessionFile {
  _sessions: Record<string, SessionData>;
  version: string;
}

interface SessionData {
  registrationId: number;
  indexInfo: {
    created: number;
    used: number;
    baseKey: string;
    baseKeyType: number;
    closed: number;
    remoteIdentityKey: string;
  };
  // Other fields exist but we don't need them for our purpose
}

// Mock data to simulate WhatsApp accounts
const MOCK_WHATSAPP_ACCOUNTS = [
  {
    id: '573019548854',
    phoneNumber: '573019548854',
    name: 'WhatsApp 8854',
    status: 'active' as const,
    lastConnection: new Date(Date.now() - 1000 * 60 * 5).toLocaleString(), // 5 minutes ago
    webhookUrl: 'https://n8n.mulato.site/webhook-test/e386aeac-2661-49a1-97d6-476a7cfd64d1', // Default webhook
  },
  {
    id: '5491112345678',
    phoneNumber: '5491112345678',
    name: 'WhatsApp 5678',
    status: 'active' as const,
    lastConnection: new Date(Date.now() - 1000 * 60 * 30).toLocaleString(), // 30 minutes ago
    webhookUrl: 'https://n8n.mulato.site/webhook-account1/e386aeac-2661-49a1-97d6-476a7cfd64d1', // Account 1 webhook
  },
  {
    id: '5491187654321',
    phoneNumber: '5491187654321',
    name: 'WhatsApp 4321',
    status: 'inactive' as const,
    lastConnection: new Date(Date.now() - 1000 * 60 * 60 * 25).toLocaleString(), // 25 hours ago
    webhookUrl: 'https://n8n.mulato.site/webhook-account2/e386aeac-2661-49a1-97d6-476a7cfd64d1', // Account 2 webhook
  },
  {
    id: '5491198765432',
    phoneNumber: '5491198765432',
    name: 'WhatsApp 5432',
    status: 'active' as const,
    lastConnection: new Date(Date.now() - 1000 * 60 * 10).toLocaleString(), // 10 minutes ago
    webhookUrl: 'https://n8n.mulato.site/webhook-test/e386aeac-2661-49a1-97d6-476a7cfd64d1', // Default webhook
  }
];

// Function to extract phone number from session file name (kept for compatibility)
const extractPhoneNumber = (fileName: string): string | null => {
  const match = fileName.match(/session-(\d+)\.\d+\.json$/);
  return match ? match[1] : null;
};

// Main function to get all WhatsApp accounts
// In a real implementation, this would fetch data from an API endpoint
export const getWhatsAppAccounts = (sessionsDir: string) => {
  console.log(`Mock implementation called with directory: ${sessionsDir}`);
  
  // In a production environment, you would replace this with an API call
  // Example: return fetch('/api/whatsapp-accounts').then(res => res.json());
  
  return MOCK_WHATSAPP_ACCOUNTS;
};

// Note: In a real-world scenario, you would implement an API endpoint in your backend
// that reads the session files and exposes the data through a REST API.
// Then the frontend would fetch this data using fetch() or axios.
//
// Example backend endpoint (Express.js):
// app.get('/api/whatsapp-accounts', (req, res) => {
//   const accounts = getWhatsAppAccountsFromFiles('/path/to/bot_sessions');
//   res.json(accounts);
// });