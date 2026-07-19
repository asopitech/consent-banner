# Asopi Tech consent-banner

Google Analytics 4向けのセルフホスト型同意バナーです。これはGA4の同意UIとGoogleタグ制御ライブラリであり、法令適合性を保証するCMP、Google認定CMP、Cookieスキャナー、IAB TCF、広告タグ管理ツールではありません。

## 対象範囲

静的HTML、GitHub Pages、Astro/Jekyll/Hugo/MkDocs/Vite等で生成され、ページ遷移時にHTMLドキュメント全体が再読み込みされるサイトを対象にします。SPA、React Router、Vue Router、Angular Router、Next.jsのクライアント遷移、Astro View Transitions、History API遷移、仮想ページビュー、手動ページビュー送信には対応しません。

## Consent Mode方式

Basic Consent Mode相当です。未選択・拒否時は`gtag.js`を読み込まず、Google Analyticsへ通信せず、Cookieなしpingも送信しません。許可時だけConsent Mode v2を更新し、GA4を読み込みます。Advanced Consent Modeは実装していません。

扱う同意項目は`analytics_storage`、`ad_storage`、`ad_user_data`、`ad_personalization`です。許可時も広告関連3項目は常に`denied`で、分析許可を広告許可として扱いません。

## 導入

```html
<script
  src="https://assets.asopi.tech/consent/v1/consent.js"
  data-measurement-id="G-XXXXXXXXXX"
  data-policy-url="/privacy/"
  data-language="auto"
  data-consent-version="1"
  defer
></script>
```

CSSは標準で同じURL階層の`consent.css`を自動読込します。明示的に読み込む場合:

```html
<link rel="stylesheet" href="https://assets.asopi.tech/consent/v1/consent.css">
```

### Astro

```astro
<script
  is:inline
  src="https://assets.asopi.tech/consent/v1/consent.js"
  data-measurement-id={import.meta.env.PUBLIC_GA_MEASUREMENT_ID}
  data-policy-url="/privacy/"
  data-language="auto"
  data-consent-version="1"
  defer
></script>
```

生成HTMLに属性が期待どおり出力されることを確認してください。Astro View Transitions有効サイトは対象外です。

### GitHub Pages / 静的HTML

全HTMLページの`head`または`body`末尾に同じscriptタグを配置します。保存済み同意は各利用サイトのlocalStorageに保存され、`asopi.tech`、`assets.asopi.tech`、`asopitech.github.io`、別ドメイン間で共有されません。

## script属性

| 属性 | 必須 | デフォルト | 説明 |
| --- | ---: | --- | --- |
| `data-measurement-id` | 必須 | なし | `^G-[A-Z0-9]+$`のGA4 Measurement ID |
| `data-policy-url` | 任意 | なし | 同一オリジン相対URLまたはHTTPS URL |
| `data-language` | 任意 | `auto` | `auto`、`ja`、`en` |
| `data-theme` | 任意 | `auto` | `auto`、`light`、`dark` |
| `data-position` | 任意 | `bottom` | `top`または`bottom` |
| `data-storage-key` | 任意 | `asopitech.analytics-consent` | localStorageキー |
| `data-consent-version` | 任意 | `1` | 同意文面バージョン |
| `data-debug` | 任意 | `false` | 診断ログ |
| `data-auto-css` | 任意 | `true` | CSS自動読込 |
| `data-reload-on-revoke` | 任意 | `false` | 撤回後に再読込 |

## JavaScript API / CustomEvent

`window.AsopiConsent`を公開します。

```ts
getState(): "unknown" | "granted" | "denied";
getDetails(): { state: string; version: string; updatedAt: string | null; analyticsLoaded: boolean };
grant(): Promise<void>;
deny(): void;
reset(): void;
openSettings(): void;
closeSettings(): void;
onChange(callback): () => void;
```

`asopi-consent:ready`と`asopi-consent:change`を`CustomEvent`として発火します。

設定再表示例:

```html
<button id="analytics-settings" type="button">アクセス解析の設定</button>
<script>
document.querySelector("#analytics-settings")?.addEventListener("click", () => {
  window.AsopiConsent?.openSettings();
});
</script>
```

インラインscript禁止サイトでは既存JavaScriptファイルにイベント処理を追加してください。

## GA4処理とページビュー

初期化時はローカルの`dataLayer`と`gtag`を準備し、Consent defaultを4項目すべて`denied`にします。この時点でGoogleネットワークへ接続しません。保存済み許可がある場合、または利用者が許可した場合だけ、`analytics_storage`を`granted`に更新してから`gtag.js`を読み込み、`gtag('js', new Date())`、`gtag('config', measurementId)`を実行します。

標準の自動ページビューを使用します。ライブラリは独自の`page_view`イベントを送信せず、`send_page_view: false`も設定しません。各通常ページロードごとにGA4を一度だけ初期化する前提です。

既存GA4/GTM/他同意ライブラリの候補を検出し、同一Measurement IDの重複ロードを避けます。GTMを自動操作したり既存Googleタグを削除したりしません。

## 同意撤回とCookie削除

`granted`から`denied`に変更すると、Consent Modeを`denied`へ更新し、保存状態を更新し、`_ga`、`_ga_*`、`_gid`、`_gat`、`_gac_*`、`_gcl_*`の削除をbest-effortで試行します。撤回は将来の計測停止を目的とします。送信済みデータは削除されず、Cookie削除はブラウザ制約内のbest-effortで、一度読み込まれた外部JavaScriptの完全アンロードは保証しません。

## セキュリティ / CSP

DOMは`createElement`と`textContent`で生成し、翻訳値はプレーンテキストです。`data-policy-url`は`javascript:`、`data:`、HTTPSページ上の非HTTPS外部URLを拒否します。ライブラリはCSPを自動変更しません。

CSP例（完全な許可リストとは断定しません。既存CSPと実際の通信先を確認してください）:

```text
script-src 'self' https://assets.asopi.tech https://www.googletagmanager.com;
style-src 'self' https://assets.asopi.tech;
connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com;
```

## 検証

Tag Assistant、Network、Application、Cookieを確認し、初期状態が4項目すべて`denied`、許可後に`analytics_storage`のみ`granted`、広告関連3項目は`denied`、拒否時にGoogle通信とGA Cookieがないことを確認してください。

## ビルド・テスト・公開

```bash
npm ci
npm run lint
npm test
npm run build
npm run verify
npm run e2e
```

出力は`dist/consent/v1/consent.js`、`dist/consent/v1/consent.css`、`dist/CNAME`です。公開URLは`/consent/v1/`で、破壊的変更時は`/consent/v2/`にします。`latest`は本番導入で推奨しません。ライブラリバージョン`v1`と同意文面バージョン`data-consent-version="1"`は別物です。

GitHub Pagesは公式Actionsで`dist/`を公開します。DNS設定とGitHub Pagesのリポジトリ設定はコード変更とは別に実施してください。Actions内へGA4 Measurement IDは保存せず、アセット配信サイト自身にもGA4を導入しません。

プライバシーポリシーにはGoogle Analyticsの利用目的、送信データ、送信先、同意変更方法を利用サイトごとに記載し、重要な変更時は`data-consent-version`を更新してください。
