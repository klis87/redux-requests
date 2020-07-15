/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
module.exports = {
  title: 'redux-requests',
  tagline:
    'Declarative AJAX requests and automatic network state management for Redux',
  url: 'https://github.com/klis87/redux-requests',
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
        src: 'img/logo.svg',
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
