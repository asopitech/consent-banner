import type { Translation } from 'vanilla-cookieconsent';

export function enTranslation(policyFooter: string): Translation {
  return {
    consentModal: {
      label: 'Cookie consent',
      title: 'Analytics preferences',
      description: 'This site uses Google Analytics to understand usage and improve the site.',
      acceptAllBtn: 'Allow analytics',
      acceptNecessaryBtn: 'Reject',
      showPreferencesBtn: 'Learn more',
      footer: policyFooter,
    },
    preferencesModal: {
      title: 'Consent settings',
      acceptAllBtn: 'Allow analytics',
      acceptNecessaryBtn: 'Reject',
      savePreferencesBtn: 'Save choices',
      closeIconLabel: 'Close',
      sections: [
        { title: 'Consent settings', description: 'Choose the cookie categories used by this site. There are no advertising, marketing, or personalization categories.' },
        { title: 'Necessary', description: 'Required for core site behavior, including storing your consent state.', linkedCategory: 'necessary' },
        { title: 'Analytics', description: 'Allows Google Analytics 4 to help us understand usage and improve the site.', linkedCategory: 'analytics' },
      ],
    },
  };
}
