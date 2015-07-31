wireview.js
================================

<a href="http://begoingto.jp/wireview/" target="_blank">view demo page</a>

##How to use
###1. wireview.jsをダウンロードする
<a href="https://github.com/szkjp/wireview/archive/master.zip">Download on github</a>

###2. headタグを記述
jsとcssのディレクトリは保存した場所に合わせて、適宜変更してください。
```html
<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
<script src="https://code.createjs.com/createjs-2015.05.21.min.js"></script>
<script src="assets/js/plugins/jquery.transit.min.js"></script>
<script src="assets/js/jquery.wireview.js"></script>
<link rel="stylesheet" type="text/css" href="asset/css/jquery.wireview.css" />
```

###3. jsを記述
```html
$(function() {
	$('section, div').wireview();
});
```
