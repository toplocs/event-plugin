# Integrating Event Plugin into Tribelike Deployment

## Option 1: As Submodule (Cleanest)

```bash
# In your tribelike fork
cd /path/to/michaelstingl/tribelike
git checkout gun
git submodule add -b event-plugin-p2p git@github.com:toplocs/event-plugin.git client/plugins/event-plugin
git commit -m "Add P2P event plugin as submodule"
git push fork gun
```

Then update the build process in `package.json`:

```json
{
  "scripts": {
    "build": "pnpm build:types && pnpm build:plugins && pnpm build:client && pnpm build:server",
    "build:plugins": "cd client/plugins/event-plugin && pnpm install && pnpm build-only"
  }
}
```

## Option 2: Copy Plugin Build Output

1. Build the plugin locally:
```bash
cd event-plugin
git checkout event-plugin-p2p
pnpm install
pnpm build-only
```

2. Copy to Tribelike static assets:
```bash
cp -r dist/* ../tribelike/client/public/plugins/event-plugin/
```

3. Update Gun registration to use local URL:
```javascript
gun.get('plugins').set({
  id: 'event-plugin',
  name: 'Events',
  url: '/plugins/event-plugin/assets/plugin.js'
})
```

## Option 3: Deploy Separately, Register in Tribelike

1. Deploy plugin to its own GitHub Pages:
   - Enable Pages on toplocs/event-plugin repo
   - Use event-plugin-p2p branch
   - URL: https://toplocs.github.io/event-plugin/

2. Register in Tribelike initialization:
```javascript
// In client/src/services/gun.ts or similar
gun.get('plugins').once(plugins => {
  if (!plugins?.['event-plugin']) {
    gun.get('plugins').set({
      id: 'event-plugin',
      name: 'Events',
      url: 'https://toplocs.github.io/event-plugin/assets/plugin.js'
    })
  }
})
```

## Option 4: Modify GitHub Actions Workflow

Update `.github/workflows/client_deploy.yml` to build plugins:

```yaml
- name: Checkout
  uses: actions/checkout@v4
  with:
    submodules: recursive  # If using submodules

- name: Build plugins
  run: |
    if [ -d "client/plugins" ]; then
      for plugin in client/plugins/*/; do
        if [ -f "$plugin/package.json" ]; then
          cd "$plugin"
          pnpm install
          pnpm build-only
          cp -r dist/* ../../public/plugins/$(basename "$plugin")/
          cd -
        fi
      done
    fi
    
- name: Build project
  run: pnpm build
```