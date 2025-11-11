# Gemini Project Settings

This file contains settings and information about the project that are useful for the Gemini assistant.

## Project Information

*   **Project Name:** dws-portfolio
*   **Description:** Donald W. Smith Jr. Portfolio and Document Library. This is a professional portfolio for Donald W. Smith Jr., an Atlanta-based Global Solutions Architect specializing in cloud solution design, zero-trust security, and enterprise architecture.
*   **Repository:** https://github.com/DWSMITHJR/DWSSite

## Technologies Used

*   **Frontend:** HTML, CSS, JavaScript
*   **Backend:** Node.js, Express.js
*   **Deployment:** GitHub Actions, Netlify, Vercel
*   **Dependencies:**
    *   `@actions/core`
    *   `@actions/http-client`
    *   `cors`
    *   `express`
    *   `express-session`
    *   `fs-extra`
*   **Dev Dependencies:**
    *   `ncp`
    *   `nodemon`
    *   `rimraf`

## Development Scripts

*   `npm start`: Starts the server.
*   `npm run dev`: Starts the server with nodemon for development.
*   `npm run build`: Builds the project.
*   `npm run clean`: Cleans the public directory.

## Gemini Ignore Settings

This project uses a `.geminiignore` file to specify files and directories that should be ignored by Gemini. The typical settings for a `.geminiignore` file are similar to a `.gitignore` file. For example:

```
node_modules/
.vs/
dist/
logs/
```