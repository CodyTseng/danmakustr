import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

//@ts-ignore
const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: '__MSG_extension_name__' + (isDev ? ` ➡️ Dev` : ''),
  description: '__MSG_extension_description__',
  version: packageData.version,
  manifest_version: 3,
  icons: {
    128: 'img/logo-128.png',
  },
  options_page: 'src/pages/options.html',
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  action: {
    default_popup: 'src/pages/popup.html',
    default_icon: 'img/logo-128.png',
  },
  content_scripts: [
    {
      matches: ['http://www.youtube.com/*', 'https://www.youtube.com/*'],
      js: ['src/contentScript/index.ts'],
      run_at: 'document_end',
    },
  ],
  web_accessible_resources: [
    {
      resources: ['img/logo-128.png'],
      matches: [],
    },
  ],
  permissions: ['storage', 'tabs'],
  default_locale: 'en',
})
