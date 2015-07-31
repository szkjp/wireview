// ==========================================
// jquery.wireview.js v1.0
//
// Naoya Suzuki
// http://blog.begoingto.jp/
// Licensed under the MIT License
// ==========================================
(function($) {
	$.fn.wireview = function(options) {


		//=====================================
		// 設定
		//=====================================
		// default setting
		var settings = $.extend({
			// 基本設定
			autoStart: true,				// 自動再生するか否か
			isScroll: false,				// アニメーション中にスクロールを許可するか否か
			isHover: false,					// 要素マウスオーバーで実行するか否か
			// 上に乗せるレイヤーの設定
			isLayer: true,					// 上にレイヤーをのせるか否か
			layerHideSpeed: 1300,			// レイヤーが消える速度
			// 四角形の設定
			isRect: true,					// 四角形のアニメーションを行うかどうか
			isRectWhile: false,				// 表示したままか否か
			rectSpeed: 1500,				// アニメーション速度
			rectStartScale: 1,				// アニメーション開始時のスケールサイズ
			rectColor: 'transparent',		// 枠線の色
			rectStrokeSize: 1,				// 枠線の太さ
			rectFillColor: '#f5f5f5',		// 塗りつぶしの色
			rectInitX: 0,					// 四角形の初期位置に調整する場合
			rectInitY: 0,					// 四角形の初期位置に調整する場合
			rectInitWidth: 0,				// 四角形の初期位置に調整する場合
			rectInitHeight: 0,				// 四角形の初期位置に調整する場合
			rectFillWidthMax: 950,			// 設定サイズ以上なら塗りつぶしをしない
			rectFillHeightMax: 950,			// 設定サイズ以上なら塗りつぶしをしない
			rectFillRandPer: 30,			// 塗りつぶしランダムの割合(20なら20%)
			//rectShowEase: 'circOut',		// 四角形表示時のイージング 未実装
			rectLastPosRandYMin: 30,		// 四角形が消える際のY座標のずれ最小値
			rectLastPosRandYMax: 60,		// 四角形が消える際のY座標のずれ最大値
			rectLastTimeMin: 500,			// 四角形が消えるときの最小時間
			rectLastTimeMax: 1500,			// 四角形が消えるときの最大時間
			// ボーダーの設定
			isLine: true,					// ボーダーのアニメーションを行うかどうか
			isLineWhile: false,				// 表示したままか否か
			lineSpeed: 1500,				// アニメーション速度
			lineColor: '#999',				// 枠線の色
			lineStrokeSize: 1,				// 枠線の太さ
			//lineShowEase: 'circOut',		// 線の表示時のイージング 未実装
			lineInitX: 0,					// 線の初期位置に調整する場合
			lineInitY: 0,					// 線の初期位置に調整する場合
			lineInitWidth: 0,				// 線の初期位置に調整する場合
			lineInitHeight: 0,				// 線の初期位置に調整する場合
			linePositionGapMin: 1,			// 線の配置ずれの最小値
			linePositionGapMax: 4,			// 線の配置ずれの最大値
			lineGapMin: 3,					// 線の長さのずれの最小値
			lineGapMax: 10,					// 線の長さのずれの最大値
			lineAlphaGapMin: 0.2,			// 線の透明度のずれの最小値(0〜1.0)
			lineAlphaGapMax: 1.0,			// 線の透明度のずれの最小値(0〜1.0)
			lineHoverTimeMin: 500,			// ホバー時の最小時間
			lineHoverTimeMax: 600,			// ホバー時の最大時間
			lineHoverWidthRandMin: 1.05,	// ホバー時のスケールサイズ
			lineHoverWidthRandMax: 1.15,	// ホバー時のスケールサイズ
			lineHoverHeightRandMin: 1.2,	// ホバー時のスケールサイズ
			lineHoverHeightRandMax: 1.6,	// ホバー時のスケールサイズ
			lineLastTimeMin: 500,			// 線が消えるときの最小時間
			lineLastTimeMax: 1500,			// 線が消えるときの最大時間
			// 二重線の設定
			isLineDouble: true,				// 二重線を引くかどうか
			lineDoubleBaseWidth: 0.95,		// 二重線の長さの基準値(1で100%)
			lineDoubleBaseHeight: 0.80,		// 二重線の長さの基準値(1で100%)
			// 薄いボーダーの設定
			isLineAlpha: true,				// 薄い線を引くかどうか
			lineAlphaBaseWidth: 1.05,		// 下に引く薄い線の長さの基準値(1で100%)
			lineAlphaBaseHeight: 1.20,		// 下に引く薄い線の長さの基準値(1で100%)
			// アニメーションの設定
			startDelay: 500,				// アニメーション開始までのディレイ
			hideWait: 800,					// フレームを消すまでの待機時間
			// コールバック
			endBeforeAnimation: function () {	// アニメーション後、消える直前のコールバック
			},
			endAnimation: function () {			// アニメーション後、消えた直後のコールバック
			},
		}, options);

		// const
		ra = Math.floor(Math.random() * 100000); // TODO:確実に重複しないランダム生成に変更する
		const LAYER_NAME = 'wireview-layer';
		const CANVAS_NAME = 'wireview-canvas'+ra;
		const CANVAS_CLASS = 'wireview-canvas';

		// global var
		var $target = this;
		var $layer;
		var $canvas;
		var endTimer;



		//=====================================
		// 基本処理
		//=====================================
		// イベント実行までラグがあるので非表示にしておく
		//$('body').hide();

		/**
		 * ロード後に実行
		 */
		window.addEventListener('load', function(){
			window.removeEventListener('load', arguments.callee);
			init();
			if (settings.autoStart === true){
				run();
			} else {
				$('body').css('visibility', 'visible');
			}
		}, false);

		/**
		 * public method
		 * ワイヤーアニメーション再生
		 */
		this.startAnimation = function() {
			// すぐにstartAnimationを実行するとDOM要素構築前に実行されてしまうため、判定処理を加える
			if ($layer) {
				run();
			} else {
				window.addEventListener('load', function(){
					window.removeEventListener('load', arguments.callee);
						run();
				}, false);
			}
		}

		/**
		 * マウスオーバーで実行
		 */
		if (settings.isHover === true) {
			$target.on('mouseenter', function() {
				$target =$(this);
				run();
			});
		}



		//=====================================
		// 初期処理
		//=====================================
		var init = function() {

			run();

			/**
			 * 実行
			 */
			function run() {
				createLayer();
				createCanvas();
				$layer.hide();
				$canvas.addClass('hide');
				//$('body').show();
			}

			/**
			 * 上に置くレイヤーの初期化
			 */
			function createLayer() {
				if ($('#' +LAYER_NAME)[0]) {
					$layer = $('#'+LAYER_NAME);
					return;
				}
				$('body').prepend('<div id="'+LAYER_NAME+'"></div>');
				$layer = $('#'+LAYER_NAME);
				$layer.css({
					'height': $(document).height()
					//'height': $(window).height()
				});
			}


			/**
			 * canvasタグの追加
			 */
			function createCanvas() {
				if ($('#' +CANVAS_NAME)[0]) {
					$canvas = $('#'+CANVAS_NAME);
					return;
				}
				$('body').prepend('<canvas id="'+CANVAS_NAME+'" class="'+CANVAS_CLASS+'"></canvas>');
				$canvas = $('#'+CANVAS_NAME);
				$canvas
					.attr('width', $(document).width())
					.attr('height', $(document).height());
				if (settings.isRectWhile === true) {
					//$canvas.css('z-index', 0);
				}
				$canvas.css('z-index', 10101);
			}
		}


		//=====================================
		// create.js関連の処理
		//=====================================
		var run = function() {
			// global var
			var wires = new Array();
			var cj = createjs, stage;
			var shapes = new Array();
			var lines = new Array();
			var compCurrent = 0;
			var endCurrent = 0;
			var compMax = 0;

			init();


			/**
			 * ホバー時の処理
			 */
			if (settings.isHover === true) {
				// ホバー
				$target.on('mouseenter', function() {
					var ran;
					var ease = cj.Ease.cubicOut;
					for(var i = 0; i < lines.length; i++) {
						// マウスオーバーしたDOM要素の判定
						if ($(this).context === lines[i].elem) {
							time = Math.floor(Math.random() * (settings.lineHoverTimeMax - settings.lineHoverTimeMin) + settings.lineHoverTimeMin);
							Object.keys(lines[i]).forEach(function (key) {
								var sX = 1;
								var sY = 1;
								if (lines[i][key].pos === 'topBottom') {
									sX = Math.random() * (settings.lineHoverWidthRandMax - settings.lineHoverWidthRandMin) + settings.lineHoverWidthRandMin;
									tweenMouse(cj, lines[i][key], sX, sY, time);
								} else if (lines[i][key].pos === 'rightLeft') {
									sY = Math.random() * (settings.lineHoverHeightRandMax - settings.lineHoverHeightRandMin) + settings.lineHoverHeightRandMin;
									tweenMouse(cj, lines[i][key], sX, sY, time);
								}
							});
						}
					}
				});

				// ホバーアウト
				$target.on('mouseleave', function() {
					var ran;
					for(var i = 0; i < lines.length; i++) {
						// マウスオーバーしたDOM要素の判定
						if ($(this).context === lines[i].elem) {
							time = Math.floor(Math.random() * (settings.lineLastTimeMax - settings.lineLastTimeMin) + settings.lineLastTimeMin);
							Object.keys(lines[i]).forEach(function (key) {
								var sX = 1;
								var sY = 1;
								tweenMouse(cj, lines[i][key], sX, sY, time);
							});
						}
					}
				});
			}

			/**
			 * マウスホバー時の共通アニメーション
			 */
			function tweenMouse(cj, obj, sX, sY, time) {
				var ease = cj.Ease.cubicOut;
				cj.Tween
					.get(obj, {loop: false, override: true})
					.to({scaleX: sX, scaleY: sY}, time, ease)
					.call(function() {
						//stage.removeChild(lines[i]);
						//tickEnd();
					});
			}



			/***
			 * 初期処理
			 */
			function init() {
				// canvas表示中は実行せずに終了
				if (!$canvas.hasClass('hide')) {
					return;
				}

				// スクロール禁止
				if (settings.isScroll === false) {
					$('body').css('overflow', 'hidden');
				}

				clearTimeout(endTimer);

				// 設定値でレイヤーの非表示/表示
				if (settings.isLayer === true) {
					$layer.removeClass('hide').show();
				}

				$layer.css('opacity', 1);
				$canvas.removeClass('hide');
				$canvas.css('z-index', 10101);

				$('body').css('visibility', 'visible');

				getDom();
				setTimeout(function () {
					run();
				}, settings.startDelay);
			}

			/**
			 * 描画対象の要素を取得
			 * グローバル変数に格納する
			 */
			function getDom() {
				var bounds;
				var elem = $target;
				for (var i = 0; i < elem.length + 1; i++) {
					if (elem[i]){
						bounds = elem[i].getBoundingClientRect();
						wires[i] = {
							elem: elem[i],
							x: bounds.left,
							y: bounds.top,
							toX: bounds.left,
							toY: bounds.top,
							w: bounds.width,
							h: bounds.height
						};
					}
				}
			}

			/**
			 * 処理実行
			 */
			function run() {
				stage = new cj.Stage(CANVAS_NAME);

				// DOM要素分ループさせる
				for(var i = 0; i < wires.length; i++) {
					if (settings.isRect) {
						shapes[i] = drawBorder(wires[i].x, wires[i].y, wires[i].w, wires[i].h, settings.rectColor);
						shapes[i].elem = wires[i].elem;
					}
					if (settings.isLine) {
						lines[i] = drawLines(wires[i].x, wires[i].y, wires[i].w, wires[i].h, settings.lineColor);
						lines[i].elem = wires[i].elem;
					}
				}

				// アニメーション
				cj.Ticker.setFPS(60);
				cj.Ticker.addEventListener('tick', tickHandler);
				//stage.update();
				tween();
			}

			/**
			 * トゥイーンアニメーション
			 */
			function tween() {
				var ease = cj.Ease.cubicIn;

				if (settings.isRect) {
					for(var i = 0; i < shapes.length; i++) {
						cj.Tween
							.get(shapes[i], {loop: false, override: true})
							.to({alpha: 1, scaleX: 1, scaleY: 1}, settings.rectSpeed, ease)
							.call(tickComp);
					}
				}

				if (settings.isLine) {
					for(var i = 0; i < lines.length; i++) {
						Object.keys(lines[i]).forEach(function (key) {
							cj.Tween
								.get(lines[i][key], {loop: false, override: true})
								.to({scaleX: 1, scaleY: 1}, settings.lineSpeed, ease)
								.call(tickComp);
						});
					}
				}
			}

			/**
			 * 矩形描画
			 * @return shape
			 */
			function drawBorder(x, y, w, h, color) {
				// スクロール位置でずれるので調整
				y = y + $(window).scrollTop();

				// パスの仕様上0.5pxずらさないとアンチエイリアスがかかり線が太くなる
				x = Math.round(x + settings.rectInitX) + 0.5;
				y = Math.round(y + settings.rectInitY) + 0.5;
				w = Math.round(w + settings.rectInitWidth);
				h = Math.round(h + settings.rectInitHeight);

				shape = new cj.Shape();
				shape.graphics.beginStroke(color);

				// ランダムで塗りつぶし
				ran = Math.random() * 100;
				if (ran < settings.rectFillRandPer && w < settings.rectFillWidthMax && h < settings.rectFillHeightMax){
					shape.graphics.beginFill(settings.rectFillColor);
				}

				shape.graphics.setStrokeStyle(settings.rectStrokeSize); // 太さが1以下ができないぽい
				shape.graphics.drawRect(0, 0, w, h);
				shape.x = x;
				shape.y = y;
				shape.alpha = 0;
				shape.scaleX = settings.rectStartScale;
				shape.scaleY = settings.rectStartScale;
				stage.addChild(shape);

				compMax++;

				return shape;
			}

			/**
			 * 線をまとめて描画
			 * @return array
			 */
			function drawLines(x, y, w, h, color) {
				// パスの仕様上0.5pxずらさないとアンチエイリアスがかかり線が太くなる
				x = Math.round(x + settings.lineInitX) + 0.5;
				y = Math.round(y + settings.lineInitY) + 0.5;
				w = Math.round(w + settings.lineInitWidth);
				h = Math.round(h + settings.lineInitHeight);

				var array = new Array();
				var ran;
				var extW = Math.round(w / settings.lineAlphaBase);
				var extH = Math.round(w / settings.lineAlphaBase);

				// top, right, bottom, left
				Array.prototype.push.apply(array, drawTopBottomLine(x, y, w, 0, color, 1));
				Array.prototype.push.apply(array, drawRightLeftLine(x, y, w, h, color, -1));
				Array.prototype.push.apply(array, drawTopBottomLine(x, y, w, h, color, -1));
				Array.prototype.push.apply(array, drawRightLeftLine(x, y, 0, h, color, 1));

				return array;
			}

			/**
			 * ランダムな線のパラメータを生成
			 * return array[mx, my, ma, alpha]
			 */
			function getRandomLineVars(x, y) {
				mx = x + Math.floor(Math.random() * settings.linePositionGapMax - settings.linePositionGapMin + 1) + settings.linePositionGapMin;
				my = y + Math.floor(Math.random() * settings.linePositionGapMax - settings.linePositionGapMin + 1) + settings.linePositionGapMin;
				ma = Math.floor(Math.random() * settings.lineGapMax - settings.lineGapMin + 1) + settings.lineGapMin;
				alpha = Math.random() * (settings.lineAlphaGapMax - settings.lineAlphaGapMin) + settings.lineAlphaGapMin;
				return {
					mx: mx,
					my: my,
					ma: ma,
					alpha: alpha
				}
			}

			/**
			 * TODO: 汎用性の低い処理なんとかならないものか...
			 * 上下ライン描画
			 * @params
			 *		lineDoublePos: -1 or 1
			 *			-1なら逆方向、1なら順方向に二重線を引く
			 * @return array
			 */
			function drawTopBottomLine(x, y, w, h, color, lineDoublePos) {
				var d = 2 * lineDoublePos;
				ran = getRandomLineVars(x, y);
				var array = new Array();
				array.push(drawLine(ran.mx - ran.ma, ran.my + h, ran.mx + w + ran.ma * 3, ran.my + h, 0, 1, ran.mx, 0, color, ran.alpha));
				if (settings.isLineDouble === true) {
					var mw = Math.round(w * settings.lineDoubleBaseWidth);
					var mx = ran.mx + (w - mw) / 2;
					array.push(drawLine(mx - ran.ma, ran.my + h + d, ran.mx + mw + ran.ma * 3, ran.my + h + d, 0, 1, mx, 0, color, ran.alpha / 2));
				}
				if (settings.isLineAlpha === true) {
					var mw = Math.round(w * settings.lineAlphaBaseWidth);
					var mx = ran.mx + (w - mw) / 2;
					array.push(drawLine(mx - ran.ma, ran.my + h, ran.mx + mw + ran.ma * 3, ran.my + h, 0, 1, mx, 0, color, ran.alpha / 2));
				}

				return array;
			}

			/**
			 * TODO: 汎用性の低い処理なんとかならないものか...
			 * 左右ライン描画
			 * @params
			 *		lineDoublePos: -1 or 1
			 *			-1なら逆方向、1なら順方向に二重線を引く
			 * @return array
			 */
			function drawRightLeftLine(x, y, w, h, color, lineDoublePos) {
				var d = 2 * lineDoublePos;
				ran = getRandomLineVars(x, y);
				var array = new Array();
				array.push(drawLine(ran.mx + w, ran.my - ran.ma, ran.mx + w, ran.my + h + ran.ma * 3, 1, 0, 0, ran.my, color, ran.alpha));
				if (settings.isLineDouble === true) {
					var mh = Math.round(h * settings.lineDoubleBaseHeight);
					var my = ran.my + (h - mh) / 2;
					array.push(drawLine(ran.mx + w + d, my - ran.ma, ran.mx + w + d, my + mh + ran.ma * 3, 1, 0, 0, my, color, ran.alpha / 2));
				}
				if (settings.isLineAlpha === true) {
					var mh = Math.round(h * settings.lineAlphaBaseHeight);
					var my = ran.my + (h - mh) / 2;
					array.push(drawLine(ran.mx + w, my - ran.ma, ran.mx + w, my + mh + ran.ma * 3, 1, 0, 0, my, color, ran.alpha / 2));
				}

				return array;
			}

			/**
			 * TODO:引数が多すぎ。オブジェクトで渡した方がまだマシかも
			 * 線描画
			 * @return shape
			 */
			function drawLine(x, y, toX, toY, scaleX, scaleY, regX, regY, color, alpha) {
				// スクロール位置でずれるので調整
				y = y + $(window).scrollTop();
				toY = toY + $(window).scrollTop();
				regY = (regY === 0) ? 0 : regY + $(window).scrollTop();

				shape = new cj.Shape();
				shape.graphics.setStrokeStyle(settings.lineStrokeSize); // 太さが1以下ができないぽい
				shape.graphics.beginStroke(color);
				shape.graphics.moveTo(x, y);
				shape.graphics.lineTo(toX, toY);
				alpha = (alpha === undefined) ? 1 : alpha;
				shape.alpha = alpha;
				shape.regX = regX;
				shape.regY = regY;
				if (scaleX === 0){
					shape.x = x;
					shape.pos = 'topBottom';
				}
				if (scaleY === 0){
					shape.y = y;
					shape.pos = 'rightLeft';
				}
				shape.scaleX = scaleX;
				shape.scaleY = scaleY;
				shape.graphics.endStroke();
				stage.addChild(shape);

				compMax++;

				return shape;
			}

			/**
			 * tickハンドラ
			 * FPSに設定した毎に呼ばれる
			 */
			function tickHandler(event) {
				stage.update();
			}

			/**
			 * トゥイーン完了後処理
			 * 全ての矩形のアニメーションが完了したらend関数を呼ぶ
			 */
			function tickComp() {
				// TODO:処理複雑になるので自動終了させている
				// マウスオーバーtrueのときは自動で終了させない
				//if (settings.isHover === true) {
				//	return;
				//}

				compCurrent++;
				if (compCurrent >= compMax) {
					end();
				}
			}

			/**
			 * トゥイーン完了後処理
			 * 全ての矩形のアニメーションが消えたらcanvasをdisplay: none;
			 */
			function tickEnd() {
				// TODO:処理複雑になるので自動終了させている
				// マウスオーバーtrueのときは自動で終了させない
				//if (settings.isHover === true) {
				//	return;
				//}

				endCurrent++;
				if (endCurrent >= compMax) {
					stage.clear();
					$canvas.addClass('hide');
				}
			}

			/**
			 * 描画した矩形を徐々に消す
			 */
			function hideDraw() {
				var ran;
				var ease = cj.Ease.cubicOut;

				if (settings.isRectWhile === false) {
					for(var i = 0; i < shapes.length; i++) {
						time = Math.floor(Math.random() * (settings.rectLastTimeMax - settings.rectLastTimeMin) + settings.rectLastTimeMin);
						pos = Math.round(Math.random() * (settings.rectLastPosRandYMax - settings.rectLastPosRandYMin)) + settings.rectLastPosRandYMin;
						if (Math.random() > 0.5) {
							pos = -pos;
						}
						cj.Tween
							.get(shapes[i], {loop: false, override: true})
							.wait(500)
							.to({alpha: 0, scaleX: 1, scaleY: 1, y: shapes[i].y + pos}, time, ease)
							.call(function() {
								stage.removeChild(shapes[i]);
								tickEnd();
							});

					}
				}

				if (settings.isLineWhile === false) {
					for(var i = 0; i < lines.length; i++) {
						time = Math.floor(Math.random() * (settings.lineLastTimeMax - settings.lineLastTimeMin) + settings.lineLastTimeMin);
						Object.keys(lines[i]).forEach(function (key) {
							cj.Tween
								.get(lines[i][key], {loop: false, override: true})
								.to({alpha: 0}, time, ease)
								.call(function() {
									stage.removeChild(lines[i]);
									tickEnd();
								});
						});
					}
				}
			}

			/**
			 * 枠線終了処理
			 */
			var isEnd = false;
			function end() {
				if (isEnd === true) {
					return;
				}

				isEnd = true;

				// 終了手前のコールバック呼び出し
				settings.endBeforeAnimation();

				endTimer = setTimeout(function () {
					hideDraw();
					hideLayer();

					// transit.jsのコールバックがきかない？ので力技で実装
					setTimeout(function() {
						$layer.hide();
						$canvas.css('z-index', -1);

						// 終了時のコールバック呼び出し
						settings.endAnimation();
					}, settings.layerHideSpeed);

					$('body').css('overflow', 'auto'); // スクロール禁止を解除
				}, settings.hideWait);
			}

			/**
			 * レイヤーが消えるアニメーション
			 * 独自にアニメーションを実装したい場合はここをいじる
			 */
			function hideLayer() {
				$layer.transition({
					'opacity': 0,
					// 'top': 100 // こんな風にな！
				}, settings.layerHideSpeed, 'ease-out');
			}
		}




		// メソッドチェーン対応
		return this;
	};
})(jQuery);
