# Google Chat Thread Switcher
Google Chat Extension to add a Thread Switcher

## Overview
Google Chat Thread Switcher is a Google Chrome extension.
Once installed on Google Chrome, it allows you to select and go threads in Google Chat.

## Who made it?
The base code is Jesse Jurman's [beta-chat-thread-picker](https://github.com/JRJurman/beta-chat-thread-picker).
I forked it and made a major modification to it.
That is [Google-Chat-Thread-Switcher](https://github.com/itagagaki/Google-Chat-Thread-Switcher).

## How to install it
1. Download Google Chat Thread Switcher.
2. Launch Google Chrome.
3. Open Chrome menu > Tools > Extensions.
4. Turn on Developer Mode (top right-hand corner).
5. Click [LOAD UNPACKAGED].
6. Select the Google Chat Thread Switcher folder.

## Usage
When you open Chat again after installation, a drop-down list appears in the upper right-hand corner, select a thread. Then it scrolls into the input field for that thread.
Unread thread titles are shown in bold.

Thread titles are automatically created from the first line of the first post in each thread, so when creating a new thread, it is recommended that the first line be just [title]. (See the source if you want to know the detailed rules).

When you click in a thread, the thread title will be displayed at the top of the chat room for one second.

Unfortunately, threads that are not loaded will not appear in the drop-down list. If you scroll through the chat room and a new thread is loaded, it will be reflected in the drop-down list. This is an unavoidable feature, but if you have solved this issue, please contribute to the GitHub repository.

Other improvements are also welcome.

## Notes
This extension is made possible by analyzing Google Chat, so if Google Chat changes, it may stop working.
I'll think about it then when it happens...

## 概要
Google Chat Thread Switcher は Google Chrome 拡張機能です。
Google Chrome にインストールすると、Google Chat でスレッドを選んで移動することができるようになります。Google Chat のスタンドアロンアプリでも機能を使うことができます。

## 誰が作ったか？
ベースのコードはJesse Jurman氏の[beta-chat-thread-picker](https://github.com/JRJurman/beta-chat-thread-picker)です。
これを私がフォークし、大きく改造して作ったのが[Google-Chat-Thread-Switcher](https://github.com/itagagaki/Google-Chat-Thread-Switcher)です。

## インストール方法
1. Google Chat Thread Switcher をダウンロードします。
2. Google Chrome を起動します。
3. Chrome メニュー → その他のツール → 拡張機能 を開きます。
4. デベロッパーモードをONにしてください（右上）
5. ［パッケージ化されていない拡張機能を読み込む］をクリックします。
6. Google Chat Thread Switcher のフォルダを選択します。

## 使用方法
インストール後あらためてChatを開くと、右上にドロップダウンリストが現れ、スレッドを選ぶと、そのスレッドの入力欄にスクロールします。

未読のあるスレッドのタイトルは太字で表示されます。

スレッドタイトルは、各スレッドの最初の書き込みの最初の行から自動的に作っていますので、新しいスレッドを作るときは、1行目を【タイトル】だけにするのがおススメです。（詳しいルールを知りたければソースを見てください）。

スレッド内をクリックするとチャットルームの上部にスレッドタイトルが1秒間表示されます。

残念なことに、ロードされていないスレッドはドロップダウンリストには表示されません。チャットルームをスクロールして新たなスレッドがロードされたらドロップダウンリストに反映されます。これは致し方のない仕様ですが、もしこのイシューを解決できたならぜひGitHubのリポジトリにコントリビュートしてください。

その他の改良も大歓迎です。

## ご注意
この拡張機能は Google Chat を解析して実現しているため、Google Chat が変わったら動かなくなる可能性があります。
その時はその時ということで…
