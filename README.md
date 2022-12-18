# Google Chat Thread Switcher
Google Chat Extension to add a Thread (Topic) Switcher

## Overview
Google Chat Thread Switcher is a Google Chrome extension.
Once installed on Google Chrome, it allows you to select and go threads (topics) in Google Chat.

## Detailed explanation
Some Google Chat "Spaces" (used to be called "Chat Rooms") can have multiple threads, and some cannot. You can choose that when you create the Space.
This extension adds a drop-down list to a Space with multiple threads, where you can pick a Thread and move it around.

To complicate things, Google has changed the term "Thread" to "Topic." Following suit, I have changed this extension to display "Topic." But I don't want to change the extension name, so it remains "Google Chat Thread Switcher."

Further complicating, Google has implemented an additional "inline thread" feature for spaces that do not have threads (or rather multi-topic). Please do not confuse them.

## Who made it?
The base code is Jesse Jurman's [beta-chat-thread-picker](https://github.com/JRJurman/beta-chat-thread-picker).
I forked it and made a major modification to it.
That is [Google-Chat-Thread-Switcher](https://github.com/itagagaki/Google-Chat-Thread-Switcher).

## How to install it manually
1. Download Google Chat Thread Switcher.
2. Launch Google Chrome.
3. Open Chrome menu > More tools > Extensions.
4. Turn on Developer Mode (top right-hand corner).
5. Click [Load unpackaged].
6. A dialog window "Select the extension directory." will open. Select the folder you just expanded, go through the folders until you see a folder "resources" listed, and click [Select Folder].

## Usage
After installing this extension, when you open a space with threads in Chat, a drop-down list will appear in the upper right corner, and when you click on it, you will see a list of loaded thread titles. If you select a thread there, it will scroll to the input field for that thread.

In the drop-down list, the titles of unread threads will be displayed in bold.

Thread titles are automatically created from the first line of the first post in each thread, so when creating a new thread, it is recommended that the first line be just [title]. (See the source if you want to know the detailed rules).

When you click in a thread, the thread title will be shown at the top of the chat room for one second.

Unfortunately, threads that are not loaded will not appear in the drop-down list. If you scroll through the chat room and a new thread is loaded, it will be reflected in the drop-down list. For this purpose, I have provided a "Upper end (to fetch more topics)" function at the beginning of the drop-down list. This is an unavoidable feature, but if you have solved this issue, please contribute to the GitHub repository.

Other improvements are also welcome.

## Notes
This extension is made possible by analyzing Google Chat, so if Google Chat changes, it may stop working.
I'll think about it then when it happens...

## 概要
Google Chat Thread Switcher は Google Chrome 拡張機能です。
Google Chrome にインストールすると、Google Chat でスレッド（トピック）を選んで移動することができるようになります。

## 詳細な説明
Google チャットの「スペース」（以前は「チャットルーム」と呼ばれていました）には、複数のスレッドを持つことができるものと、そうでないものとがあります。スペース作成時にそれを選択することができます。
この拡張機能は、複数のスレッドを持つスペースにドロップダウンリストを追加し、そこでスレッドを選んで移動させることができるようにします。

複雑なことに、Googleは「スレッド」という用語を「トピック」に変更しました。それに倣って、この拡張機能でも「トピック」と表示するように変更しました。しかし拡張機能の名前は変えたくないので「Google Chat Thread Switcher」のままです。

さらにややこしいことに、Googleはスレッド（というかマルチトピック）を持たないスペースに「インラインスレッド」という機能を追加実装しています。混同しないようご注意ください。

## 誰が作ったか？
ベースのコードはJesse Jurman氏の[beta-chat-thread-picker](https://github.com/JRJurman/beta-chat-thread-picker)です。
これを私がフォークし、大きく改造して作ったのが[Google-Chat-Thread-Switcher](https://github.com/itagagaki/Google-Chat-Thread-Switcher)です。

## 手動インストール方法
1. Google Chat Thread Switcher をダウンロードします。
2. Google Chrome を起動します。
3. Chrome メニュー → その他のツール → 拡張機能 を開きます。
4. デベロッパーモードをONにしてください（右上）
5. ［パッケージ化されていない拡張機能を読み込む］をクリックしてください。
6. 「拡張機能のディレクトリを選択してください。」というダイアログウィンドウが開きます。そこで先ほど展開したフォルダーを選択し、resources というフォルダーが一覧に見えるところまでフォルダーを進んで、［フォルダーの選択］をクリックしてください。

## 使用方法
この拡張機能をインストールしてChatでスレッドのあるスペースを開くと、右上にドロップダウンリストが現れ、クリックするとロード済みスレッドのタイトルの一覧が表示されます。そこでスレッドを選ぶと、そのスレッドの入力欄にスクロールします。

ドロップダウンリストでは、未読スレッドのタイトルは太字で表示されます。

スレッドタイトルは、各スレッドの最初の書き込みの最初の行から自動的に作っていますので、新しいスレッドを作るときは、1行目を【タイトル】だけにするのがおススメです。（詳しいルールを知りたければソースを見てください）。

スレッド内をクリックするとチャットルームの上部にスレッドタイトルが1秒間表示されます。

残念なことに、ロードされていないスレッドはドロップダウンリストには表示されません。チャットルームをスクロールして新たなスレッドがロードされたらドロップダウンリストに反映されます。そのためにドロップダウンリストの最初に「上端へ（もっとトピックを読み込む）」という機能を用意してあります。これは致し方のない仕様ですが、もしこのイシューを解決できたならぜひGitHubのリポジトリにコントリビュートしてください。

その他の改良も大歓迎です。

## ご注意
この拡張機能は Google Chat を解析して実現しているため、Google Chat が変わったら動かなくなる可能性があります。
その時はその時ということで…
