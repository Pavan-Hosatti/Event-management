module.exports = {
  // 1. Where to look for your code files
  input: ['src/**/*.{js,jsx,ts,tsx}'], 

  // 2. Files/folders to skip during the scan
  ignore: ['src/i18n.js', 'src/serviceWorker.js', '**/node_modules/**'], 

  // 3. Where to put the generated JSON files (matches the loadPath in i18n.js)
  output: 'public/locales/$LOCALE/$NAMESPACE.json', 

  // 4. Languages we are working with
  locales: ['en', 'kn'], 
  defaultLng: 'en',
  defaultNs: 'translation',

  // 5. CRITICAL: Use the English string as the translation key
  // This avoids manually inventing thousands of keys (e.g., t('My Restaurant'))
  useKeysAsDefaultValue: true, 
  keySeparator: false, // Keep keys simple

  // 6. Tell the parser to look for content inside the t() function
  customTrans: [
    ['t', { defaults: true, content: '1' }],
  ],
};