/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
module.exports = {
  title: 'redux-requests',
  tagline:
    'Declarative AJAX requests and automatic network state management for Redux',
  url: 'https://redux-requests.klisiczynski.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'klis87', // Usually your GitHub org/user name.
  projectName: 'redux-requests', // Usually your repo name.
  themeConfig: {
    prism: {
      theme: require('prism-react-renderer/themes/nightOwl'),
    },
    navbar: {
      hideOnScroll: true,
      title: 'redux-requests',
      logo: {
        alt: 'redux-saga-requests Logo',
        src: 'img/logo-small.png',
      },
      links: [
        {
          to: 'docs/introduction/motivation',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          href: 'https://github.com/klis87/redux-requests',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} redux-requests. Built with Docusaurus.`,
    },
    algolia: {
      apiKey: '661b4fb5395737a02a98e8cfbe70735e',
      indexName: 'redux-requests',

      // // Optional: see doc section bellow
      // contextualSearch: true,

      // Optional: Algolia search parameters
      // searchParameters: {},
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/klis87/redux-requests/edit/master/docusaurus/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
