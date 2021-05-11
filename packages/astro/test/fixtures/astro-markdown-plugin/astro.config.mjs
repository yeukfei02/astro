export default {
  extensions: {
    '.jsx': 'preact',
  },
  buildOptions: {
    sitemap: false,
  },
  experimental: {
    markdownOptions: {
      footnotes: false,
      gfm: false,
      plugins: [
        'remark-gemoji'
      ]
    }
  }
};
