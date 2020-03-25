module.exports = {
  title: 'redux-saga-requests',
  tagline: 'Redux requests made simpler',
  url: 'https://klis87.github.io/redux-saga-requests',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'klis87', // Usually your GitHub org/user name.
  projectName: 'redux-saga-requests', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'redux-saga-requests',
      // logo: {
      //   alt: 'redux-saga-requests Logo',
      //   src: 'img/logo.svg',
      // },
      links: [
        {
          to: 'docs/motivation',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          href: 'https://github.com/klis87/redux-saga-requests',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} redux-saga-requests. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
