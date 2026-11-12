# DCRS IP Feedback

A Netlify-hosted feedback tool for Insolvency Practitioners to provide feedback on the new DCRS service.

## What this MVP includes

- Public QR-coded feedback page
- Chat and voice feedback modes
- Email capture for each response
- Local admin dashboard access controlled by a token
- Netlify function layer for structured feedback entry and secure integration points for ElevenLabs
- 30-day retention policy model for submissions

## Local development

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the local app

   ```bash
   npm run dev
   ```

3. Open the local URL in the browser

   ```bash
   http://localhost:5173
   ```

## Netlify deployment

1. Connect the repository to Netlify.
2. Set the build command to:

   ```bash
   npm run build
   ```

3. Set the publish directory to:

   ```bash
   dist
   ```

4. Add these environment variables in Netlify:

   ```bash
   ELEVENLABS_API_KEY=
   ELEVENLABS_AGENT_ID=
   ADMIN_TOKEN=
   ```

5. Deploy the site.

## Security and privacy notes

- Submissions are stored in a Netlify Blob store and are intended to be retained for a maximum of 30 days.
- Use the admin token in the dashboard for local access and move to Netlify Identity or another access control system before public release.
- The ElevenLabs voice route is intentionally server-side only. Do not expose the API key in the browser.
- Only collect the minimum required information: an email address and the answers to the feedback questions.

## Suggested next steps

- Replace the temporary token-based admin access with Netlify Identity or Auth0.
- Connect the voice mode to a production ElevenLabs conversation agent using a signed URL flow.
- Add a proper sentiment analysis pipeline and dashboard from the stored feedback data.
- Add the actual DCRS questions and branding provided later.

## Project structure

```text
.
├── netlify
│   └── functions
│       ├── dashboard.js
│       ├── elevenlabs.js
│       └── feedback.js
├── src
│   ├── App.jsx
│   ├── main.jsx
│   ├── styles.css
│   └── ...
├── index.html
├── netlify.toml
├── package.json
├── vite.config.js
└── README.md
```

## Important note

This project is an MVP starter. It gives you the app shell, security pattern, and route structure needed to build the final tool.

The final production implementation should use stronger identity controls, secure database retention policies, and approved sentiment analysis tooling before it is used with live feedback from Insolvency Practitioners.

