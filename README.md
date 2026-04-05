# OauthHandler

A lightweight, front-end OAuth 2.0 redirect handler built with vanilla HTML, CSS, and JavaScript. Designed specifically for the **YouTube Data API v3** via Google OAuth 2.0, OauthHandler parses and displays the credentials and scopes returned by Google's authorization server — making it easy to inspect, copy, and integrate tokens into your broader application framework.


## Overview

When a user authorizes your application through Google's OAuth 2.0 consent screen, Google redirects them back to a pre-registered **redirect URI** with credentials appended to the URL — either as query parameters or a URL hash fragment. OauthHandler sits at that redirect URI and takes care of the rest: it automatically detects which OAuth flow was used, extracts the relevant parameters, and presents them in a clean frosted-glass UI with one-click copy actions.

No backend required. No dependencies. Drop the three files into any static host or local server and point your Google Cloud Console redirect URI at it.


## Features

- **Multi-flow detection** — Automatically identifies and handles all three standard OAuth 2.0 response types:
  - Authorization Code Flow (`?code=...`)
  - Implicit Grant Flow (`#access_token=...`)
  - Error / Denied Access responses (`?error=...`)
- **Parameter display** — Surfaces `code`, `access_token`, `token_type`, `expires_in`, `scope`, `state`, `refresh_token`, and `error_description` in clearly labelled cards
- **One-click copy** — Copy individual tokens or dump all parameters as formatted JSON to your clipboard
- **Raw parameter inspector** — Expandable accordion showing every raw key-value pair received in the URL, useful for debugging unexpected responses
- **Animated frosted-glass UI** — Smooth entrance animations, pulsing status indicators, and a backdrop-blur glass card with animated background orbs
- **Zero dependencies** — Pure HTML, CSS, and JavaScript. No frameworks, no npm, no build step


## File Structure

```
OauthHandler/
├── index.html       # Main redirect page (rename from youtube-oauth-redirect.html if preferred)
├── style.css        # All styles — frosted glass UI, animations, layout
└── script.js        # OAuth parameter parsing and DOM rendering logic
```

All three files must reside in the **same directory** so the HTML can resolve the relative `style.css` and `script.js` references correctly.


## Setup

### 1. Register your redirect URI

In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), open your OAuth 2.0 Client ID and add the URL where you will host these files as an **Authorized Redirect URI**.

Example:
```
https://yourdomain.com/oauth/redirect
http://localhost:8080/oauth/redirect
```

### 2. Host the files

Serve the three files from any static host — GitHub Pages, Netlify, Vercel, Apache, Nginx, or even a local dev server:

```bash
# Quick local test with Python
python3 -m http.server 8080

# Or with Node's http-server
npx http-server -p 8080
```

Then navigate to `http://localhost:8080` and confirm the page loads.

### 3. Initiate the OAuth flow

Build your authorization URL and send users to it. A typical YouTube Data API v3 authorization URL looks like:

```
https://accounts.google.com/o/oauth2/v2/auth
  ?client_id=YOUR_CLIENT_ID
  &redirect_uri=https://yourdomain.com/oauth/redirect
  &response_type=code
  &scope=https://www.googleapis.com/auth/youtube.readonly
  &access_type=offline
  &state=YOUR_STATE_TOKEN
```

After the user grants permission, Google will redirect back to your redirect URI with the authorization code or token appended.

## OAuth Flow Reference

### Authorization Code Flow

Google appends credentials as **query parameters**:

```
https://yourdomain.com/oauth/redirect
  ?code=4/0AfJohXn...
  &scope=https://www.googleapis.com/auth/youtube.readonly
  &state=YOUR_STATE_TOKEN
```

OauthHandler will display the `code`, `scope`, and `state`. You must exchange the `code` server-side (using your client secret) for an access token and optional refresh token. **Never expose your client secret in front-end code.**

### Implicit Grant Flow

Google appends credentials as a **URL hash fragment**:

```
https://yourdomain.com/oauth/redirect
  #access_token=ya29.A0ARrd...
  &token_type=Bearer
  &expires_in=3599
  &scope=https://www.googleapis.com/auth/youtube.readonly
```

OauthHandler reads the hash and surfaces the `access_token`, `token_type`, `expires_in`, `scope`, and `state`. Note: implicit grant does not issue a refresh token and is considered less secure than the authorization code flow.

### Error Response

If the user denies access or an error occurs, Google redirects with:

```
https://yourdomain.com/oauth/redirect
  ?error=access_denied
  &error_description=The+user+denied+access
```

OauthHandler detects the error, switches the status indicator to red, and displays the error code and description clearly.


## Supported YouTube API Scopes

Below are the most commonly used scopes for the YouTube Data API v3. Add one or more to your authorization URL:

| Scope | Access Level |
|---|---|
| `youtube.readonly` | Read-only access to a user's YouTube account |
| `youtube` | Full read/write access to a user's YouTube account |
| `youtube.upload` | Permission to upload videos |
| `youtube.force-ssl` | Manage your YouTube account (requires HTTPS) |
| `youtubepartner` | YouTube partner and CMS account access |

Full scope list: [YouTube Data API — Authorization Scopes](https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps#identify-access-scopes)


## Integrating with Your Framework

Once OauthHandler captures the authorization code, you can forward it to your server for token exchange. A common pattern is to use `postMessage` to send the code back to the opener window:

```javascript
// Add to script.js after the code is captured
if (window.opener) {
  window.opener.postMessage({ code, state, scope }, 'https://yourapp.com');
  window.close();
}
```

Or redirect to your back-end exchange endpoint:

```javascript
window.location.href = `https://yourapi.com/auth/exchange?code=${code}&state=${state}`;
```

---

## Browser Compatibility

OauthHandler uses standard modern browser APIs:

| Feature | Required For |
|---|---|
| `URLSearchParams` | Parsing query string and hash parameters |
| `backdrop-filter` | Frosted glass card effect |
| `navigator.clipboard` | One-click copy buttons |
| CSS custom properties | Theming and variables |

All major evergreen browsers (Chrome, Firefox, Edge, Safari 15.4+) are supported. `backdrop-filter` requires a `-webkit-` prefix on older Safari versions — this is already included in `style.css`.

## Security Notes

- **Never use implicit grant in production.** The authorization code flow with PKCE is the recommended approach for single-page and public clients.
- **Validate the `state` parameter** on every redirect to protect against CSRF attacks. The `state` value should be a random token generated before initiating the flow and verified server-side upon return.
- **Do not store tokens in `localStorage`.** Prefer short-lived in-memory storage or secure `HttpOnly` cookies managed by your server.
- OauthHandler is a **development and debugging utility** by design. Restrict access or remove it from production environments once your integration is verified.

## License
This project is protected by GNU LESSER GENERAL PUBLIC LICENSE v2.1.
> This library is free software; you can redistribute it and/or
> modify it under the terms of the GNU Lesser General Public
> License as published by the Free Software Foundation; either
> version 2.1 of the License, or (at your option) any later version.
>
> This library is distributed in the hope that it will be useful,
> but WITHOUT ANY WARRANTY; without even the implied warranty of
> MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
> Lesser General Public License for more details.
> 
> You should have received a copy of the GNU Lesser General Public
> License along with this library; if not, write to the Free Software
> Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301
> USA

Copyright © 2025 **Otaku Central**. All rights reserved.
