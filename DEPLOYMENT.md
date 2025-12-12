# DDR Public Deployment Guide

## ⚠️ CRITICAL: Auth0 Configuration

This application requires Auth0 authentication. **The Auth0 credentials MUST be present at build time** - they are baked into the JavaScript bundle, not loaded at runtime.

## Quick Deployment

```bash
# 1. Set Auth0 environment variables
export VITE_AUTH0_DOMAIN="dev-i4m880asz7y6j5sk.us.auth0.com"
export VITE_AUTH0_CLIENT_ID="1tKb110HavDT3KsqC5P894JEOZ3fQXMm"
export VITE_AUTH0_AUDIENCE="https://api.ddrarchive.org"

# 2. Run deployment script
./deploy.sh
```

The script will:
- ✅ Validate Auth0 environment variables are set
- ✅ Build with Auth0 credentials
- ✅ Verify Auth0 is in the bundle
- ✅ Deploy to production server
- ✅ Restart container
- ✅ Verify CSP headers are correct

## Manual Deployment

If you need to deploy manually:

```bash
# Build with Auth0 credentials
VITE_AUTH0_DOMAIN="dev-i4m880asz7y6j5sk.us.auth0.com" \
VITE_AUTH0_CLIENT_ID="1tKb110HavDT3KsqC5P894JEOZ3fQXMm" \
VITE_AUTH0_AUDIENCE="https://api.ddrarchive.org" \
npm run build

# Verify Auth0 is in the bundle
grep -q "dev-i4m880asz7y6j5sk.us.auth0.com" dist/assets/index-*.js && echo "✅ Auth0 found" || echo "❌ Auth0 missing!"

# Deploy
scp -r dist/* root@134.209.182.97:/root/ddr-public/dist/
scp nginx.conf root@134.209.182.97:/root/ddr-public/nginx.conf

# Restart container
ssh root@134.209.182.97 "docker rm -f ddr-public && docker run -d --name ddr-public --restart unless-stopped --network ddr-archive_default -v /root/ddr-public/nginx.conf:/etc/nginx/conf.d/default.conf:ro -v /root/ddr-public/dist:/usr/share/nginx/html:ro -p 8080:80 nginx:alpine"
```

## Troubleshooting

### "Authentication Error: Failed to fetch"

This means Auth0 cannot connect. Check:

1. **CSP Headers**: Only ONE Content-Security-Policy header should be present
   ```bash
   curl -I https://ddrarchive.org | grep -c "content-security-policy:"
   # Should output: 1
   ```

2. **Auth0 in CSP**: The CSP must include `https://*.auth0.com`
   ```bash
   curl -I https://ddrarchive.org | grep "auth0"
   # Should show: child-src, connect-src, and frame-src with auth0
   ```

3. **Auth0 in Bundle**: Check if Auth0 domain is in the JavaScript
   ```bash
   curl -s https://ddrarchive.org/assets/index-*.js | grep -o "dev-i4m880asz7y6j5sk.us.auth0.com"
   # Should output the domain
   ```

### Multiple CSP Headers

If you see 2 CSP headers, Caddy is adding one. The Caddyfile location is:
```
/root/~/ddr-archive/Caddyfile
```

Note the literal `~/` directory - NOT home expansion!

Ensure the `ddrarchive.org` block does NOT include a `header { Content-Security-Policy ... }` directive.

### Container Network Issues

The container MUST be on the `ddr-archive_default` network:
```bash
ssh root@134.209.182.97 "docker inspect ddr-public | grep -A5 Networks"
# Should show: "ddr-archive_default"
```

## Server Configuration

### nginx.conf
The CSP is set in `/root/ddr-public/nginx.conf`:
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net blob:; worker-src 'self' blob:; child-src 'self' blob: https://*.auth0.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com https://unpkg.com https://cdn.jsdelivr.net; connect-src 'self' https://api.ddrarchive.org https://ddrarchive.org wss://api.ddrarchive.org https://*.digitaloceanspaces.com https://*.auth0.com https://unpkg.com https://cdn.jsdelivr.net; frame-src https://*.auth0.com; frame-ancestors 'none';" always;
```

**Critical CSP directives for Auth0:**
- `child-src https://*.auth0.com` - For Auth0 Universal Login iframe
- `connect-src https://*.auth0.com` - For Auth0 API calls (token exchange)
- `frame-src https://*.auth0.com` - For Auth0 embedded login

### Caddyfile
Location: `/root/~/ddr-archive/Caddyfile`

The `ddrarchive.org` block should be minimal and NOT set CSP:
```caddyfile
ddrarchive.org {
    # Route backend API endpoints FIRST
    handle /id/* {
        reverse_proxy backend:8000
    }
    handle /iiif/* {
        reverse_proxy backend:8000
    }
    handle /graphql* {
        reverse_proxy backend:8000
    }
    # ... other backend routes ...
    
    # Public site - nginx handles all security headers
    handle {
        reverse_proxy ddr-public:80 {
            health_uri /
            health_interval 30s
            health_timeout 5s
        }
    }
}
```

**DO NOT** add `import security_headers` or any `header { Content-Security-Policy ... }` block to this section!

## Production Checklist

Before deploying:
- [ ] Auth0 environment variables are exported
- [ ] Build includes Auth0 credentials (check bundle)
- [ ] Only 1 CSP header is returned
- [ ] CSP includes `https://*.auth0.com` in child-src, connect-src, frame-src
- [ ] Container is on `ddr-archive_default` network
- [ ] nginx.conf has correct CSP with Auth0
- [ ] Caddyfile does NOT set CSP for ddrarchive.org

After deploying:
- [ ] Test in incognito window
- [ ] Auth0 login redirects correctly
- [ ] No CSP errors in browser console
- [ ] Application loads after authentication
