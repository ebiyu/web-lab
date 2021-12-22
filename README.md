# ebi's web lab

ブラウザ上で動くプログラムの雑多な置き場です。過去に書いたコードも突っ込んであるので、コードの品質がバラバラなのはご了承ください。

## ビルド方法

```sh
yarn # 依存パッケージ導入
yarn start # 開発サーバー https://localhost:8080
yarn watch # ファイルを監視
yarn build # productionビルド
```

## lint, フォーマット

```sh
yarn lint
yarn format
```

## 仕様

webpack でビルドしています。

性質上、各ページが独立に動くので、基本的に各 html ファイルごとにそれぞれ対応する css, js/ts のみを読み込むようにしています。
html と同じファイル名の js/css が読み込まれます。優先順位は js: ts->js, css: scss->css です。

`common.js`, `common.scss`は常に読み込まれ、scss を使っている場合は`global-imports.scss`も読み込まれます。
