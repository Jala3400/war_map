# Deployment Guide (Cloudflare Pages)

This project is configured to be deployed on **Cloudflare Pages** using the `@sveltejs/adapter-cloudflare`.

## Prerequisites

- A Cloudflare account.
- Your project pushed to a GitHub or GitLab repository.

## Option 1: Git Integration (Recommended)

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository.
4. Configure the build settings:
   - **Framework preset**: `SvelteKit`
   - **Build command**: `pnpm run build`
   - **Build output directory**: `.svelte-kit/cloudflare` (or `output` depending on adapter version, but Framework preset usually fills this).
5. Add Environment Variables (if needed):
   - `NODE_VERSION`: `20` (or higher)
6. Click **Save and Deploy**.

## Option 2: Command Line (Wrangler)

If you prefer deploying from your terminal:

1. Install Wrangler:

   ```bash
   pnpm add -D wrangler
   ```

2. Build the project:

   ```bash
   pnpm run build
   ```

3. Deploy to Pages:

   ```bash
   pnpm exec wrangler pages deploy .svelte-kit/cloudflare
   ```

## Peer-to-Peer Notes

The application uses `y-webrtc` for real-time collaboration.

- **Signaling**: It uses public signaling servers (`signaling.yjs.dev`, etc.).
- **Privacy**: Data is sent directly between browsers (P2P). No data is stored on a server unless you add a provider like `y-indexeddb` for local persistence or a `y-websocket` backend.
- **Room ID**: Shared sessions are created using the `?room=name` URL parameter. Simply share the URL with others to collaborate.
