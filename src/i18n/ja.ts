import type { Translation } from 'vanilla-cookieconsent';

export function jaTranslation(policyFooter: string): Translation {
  return {
    consentModal: {
      label: 'Cookie同意',
      title: 'アクセス解析について',
      description: 'このサイトでは、利用状況を把握し、サイトを改善するためにGoogle Analyticsを使用します。',
      acceptAllBtn: '分析を許可',
      acceptNecessaryBtn: '拒否',
      showPreferencesBtn: '詳細を見る',
      footer: policyFooter,
    },
    preferencesModal: {
      title: '同意設定',
      acceptAllBtn: '分析を許可',
      acceptNecessaryBtn: '拒否',
      savePreferencesBtn: '選択を保存',
      closeIconLabel: '閉じる',
      sections: [
        { title: '同意設定', description: '利用するCookieカテゴリを選択できます。広告、マーケティング、パーソナライズ目的のカテゴリはありません。' },
        { title: '必須', description: '同意状態の保存など、サイトの基本動作に必要です。', linkedCategory: 'necessary' },
        { title: 'アクセス解析', description: 'Google Analytics 4を使い、サイト改善のための利用状況を把握します。', linkedCategory: 'analytics' },
      ],
    },
  };
}
