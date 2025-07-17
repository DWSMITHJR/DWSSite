# DWSSite

This is the frontend for Donald W. Smith Jr.'s personal website, which communicates with a separate API server for all backend functionality.

## Architecture Overview

The project has been refactored to use a client-server architecture:

- **Frontend (this repository)**: A static website that makes API calls to a separate backend server.
- **Backend (node-api-server)**: A separate Node.js/Express API server that handles all server-side logic.

## API Integration

The frontend communicates with the following API endpoints:

- `POST /api/verify`: Verify email and authentication
- `POST /api/signout`: Handle user sign out
- `GET /api/documents`: Retrieve document data
- `POST /api/track`: Track user interactions and analytics
- `POST /api/log/email-hash`: Log email hashes for verification
- `POST /api/diagnostics`: Log diagnostic information from the client

## Configuration

API configuration is managed in `public/js/config.js`, which defines the base URL and endpoint paths:

```javascript
const API_CONFIG = {
    BASE_URL: 'https://api.donaldwsmithjr.com',
    ENDPOINTS: {
        VERIFY: '/api/verify',
        SIGNOUT: '/api/signout',
        DOCUMENTS: '/api/documents',
        TRACK: '/api/track',
        LOG_EMAIL_HASH: '/api/log/email-hash',
        DIAGNOSTICS: '/api/diagnostics'
    },
    // ...
};
```

## Development

### Prerequisites

- Modern web browser with JavaScript enabled
- No Node.js or server-side dependencies required (all server functionality is handled by the API server)

### Running Locally

1. Clone this repository
2. Open `index.html` in a web browser
3. The site will make API calls to the production API server by default

### Local Development with API Server

For local development with a local API server:

1. Clone the `node-api-server` repository
2. Follow the setup instructions in the API server's README
3. Update `public/js/config.js` to point to your local API server:
   ```javascript
   BASE_URL: 'http://localhost:3001',
   ```

## Deployment

The frontend is deployed as static files. No server-side processing is required.

## Security

- All API requests include appropriate CORS headers
- Sensitive operations require authentication
- Client-side code does not contain any sensitive information or credentials

## Error Handling

API errors are handled by the `ApiService` class in `public/js/api.js`, which provides consistent error handling and user feedback.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
