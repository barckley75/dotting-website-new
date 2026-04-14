# dotting.cloud

Static website for Dotting - remote broadcast post-production infrastructure.

## Stack

Plain HTML, CSS, vanilla JavaScript. No frameworks, no Node.js, no build step.

- 7 HTML pages
- 3 languages (IT, EN, ES) with runtime switching
- Tailwind CSS (pre-built, no CDN)
- GDPR-compliant cookie consent (Italian DPA requirements)

## Deploy

Point Nginx (or any web server) at this directory:

```nginx
server {
    listen 80;
    server_name dotting.cloud;
    root /path/to/dotting-website;
    index index.html;

    location / {
        try_files $uri $uri.html $uri/ =404;
    }
}
```

Or open `index.html` directly in a browser.

## Pages

- `index.html` - Homepage with carousel
- `about.html` - Company info
- `remote-infrastructure.html` - Remote post-production service
- `ai-integration.html` - Chat2Editing AI service
- `custom-software.html` - Custom tools gallery
- `contact.html` - Contact
- `privacy.html` - Privacy policy
