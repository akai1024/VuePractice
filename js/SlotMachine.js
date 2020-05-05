var slotMachine = new Vue({
	el: '#SlotMachine',
	data: {
		eachBet: 10,
		maxBet: 200,

		bet: 10,
		win: 0,
		totalMoney: 1000,
		totalWin: 0,
		totalBet: 0,
		loan: 0,

		// 排列帶相關資訊
		ribbonSize: 3,
		ribbonLength: 3,
		// 圖標
		symbols: [
			[1, 'A'],
			[2, 'K'],
			[3, 'Q'],
			[4, 'J'],
			[5, '10'],
			[6, '9'],
		],
		// 圖標賠率
		symbolOdds: [
			['1-3', 15],
			['2-3', 10],
			['3-3', 8],
			['4-3', 5],
			['5-3', 3],
			['6-3', 1],
		],
		// 中獎線位置
		bingoIndex: [
			[0, 1, 2],
			[0, 4, 8],
			[3, 4, 5],
			[6, 4, 2],
			[6, 7, 8],
		],
		// 當前排列帶
		ribbons: [
			[1, 1, 1],
			[1, 1, 1],
			[1, 1, 1],
		],
		// 該局最終盤面
		screen: [],
		// 測試用的盤面
		debugScreen: null,

		// 是否正在演出
		isAnimation: false,
		// 動畫計時器
		animationTimer: null,
		// 動畫間隔
		animationTickGap: 100,
		// 當前動畫的ticker
		animationTicker: 0,
		// 動畫時間長度
		animationLength: 1500,
		// 快速轉輪
		isFastSpin: false,

		// 用畫布呈現盤面
		slotScreenContext: null,
		symbolSize: 50,
	},
	created() {
		window.addEventListener('keypress', this.keyPressEvt);
	},
	mounted() {
		// 設定畫布
		let canvas = this.$refs['SlotScreen'];
		canvas.width = this.symbolSize * this.ribbonLength;
		canvas.height = this.symbolSize * this.ribbonSize;

		let ctx = canvas.getContext('2d');
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		this.slotScreenContext = ctx;

		// 填上初始的盤面
		for (var rIdx = 0; rIdx < this.ribbons.length; rIdx++) {
			for (var cIdx = 0; cIdx < this.ribbons[rIdx].length; cIdx++) {
				this.drawSymbol(rIdx, cIdx, this.ribbons[rIdx][cIdx], false);
			}
		}
	},
	destroyed() {
		window.removeEventListener('keypress', this.keyPressEvt);
	},
	methods: {
		// 鍵盤事件
		keyPressEvt: function(e) {
			// SpaceBar
			if (e.keyCode == 32 && !this.isAnimation) {
				this.spin();
			}
		},
		// 畫圖標
		drawSymbol: function(rowIdx, colIdx, symbol, isBingo) {
			let symbolSize = this.symbolSize;
			let context = this.slotScreenContext;
			let x = symbolSize * colIdx;
			let y = symbolSize * rowIdx;
			// 填滿矩形
			if (isBingo) {
				context.fillStyle = "#df595b";
			} else {
				context.fillStyle = "#5a5a5a";
			}
			context.fillRect(x, y, symbolSize, symbolSize);
			// 框線
			context.strokeStyle = "black";
			context.lineWidth = 3;
			context.strokeRect(x, y, symbolSize, symbolSize);
			// 圖標內文
			let textX = x + symbolSize / 2;
			let textY = y + symbolSize / 2;
			context.fillStyle = "#629ee3";
			context.font = "40px Arial";
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillText(this.getShowSymbol(symbol), textX, textY);
		},
		// 設定下注
		setBet: function() {
			if (this.bet >= this.maxBet) {
				this.bet = this.eachBet;
			} else {
				this.bet += this.eachBet;
			}
		},
		// 借貸
		loanMoney: function() {
			this.loan += 1000;
			this.totalMoney += 1000;
		},
		// 扣下注金額
		subBet: function() {
			// 扣錢
			this.totalMoney -= this.bet;
			// 累加投注
			this.totalBet += this.bet;
		},
		// 增加贏錢
		addWin: function(win) {
			if (win <= 0) {
				return;
			}
			this.totalWin += win;
			this.totalMoney += win;
		},
		// 轉動盤面
		spin: function(isDebug) {
			if (this.totalMoney < this.bet) {
				alert('Not enough money');
				return;
			} else {
				this.subBet();
			}
			// 當前得分歸零
			this.win = 0;
			// 計算盤面
			var screen = null;
			if (isDebug) {
				// 測試用的盤面
				let debugScreen = this.getDebugScreen();
				if (debugScreen) {
					screen = debugScreen;
				}
			}
			
			if (screen) {
				this.screen = screen;
			} else {
				this.screen = this.calculateScreen();
			}

			this.createSpinAnimationTimer();
			console.log('screen: ' + this.screen);
		},
		// 取得測試盤面
		getDebugScreen: function() {
			var screen = this.debugScreen;
			if (this.isLegalScreenStr(screen)) {
				return screen.split(',');
			}
			return null;
		},
		// 是否合法的盤面字串
		isLegalScreenStr: function(screen) {
			if (screen) {
				let checkScreen = screen.split(',');
				let symbols = this.ribbonSize * this.ribbonLength;
				if (checkScreen.length == symbols) {
					return true;
				}
			}
			return false;
		},
		// 計算隨機盤面
		calculateScreen: function() {
			// console.log('calculateScreen...')
			var win = 0;

			// 取得盤面
			var screenSize = this.ribbonSize * this.ribbonLength;
			var screen = [];
			for (var i = 0; i < screenSize; i++) {
				var index = Math.floor(Math.random() * this.symbols.length);
				screen.push(this.symbols[index][0]);
			}
			return screen;
		},
		// 取得中獎線
		getBingoLines: function(screen) {
			var bingoLines = [];
			var bingoIndexes = [];
			// 每一條線
			for (var lineIndex = 0; lineIndex < this.bingoIndex.length; lineIndex++) {
				var indexArr = this.bingoIndex[lineIndex];
				var symbol = 0;
				var connectSize = 1;
				var lineIndexes = [];
				// 線上每一個位置
				for (var idx = 0; idx < indexArr.length; idx++) {
					var ribbonIdx = indexArr[idx];
					// 紀錄在盤面的位置
					lineIndexes.push(ribbonIdx);
					if (idx == 0) {
						symbol = screen[ribbonIdx];
						continue;
					}
					var curSymbol = screen[ribbonIdx];
					if (curSymbol == symbol) {
						connectSize++;
					} else {
						break;
					}
				}

				// 先排除少於3的
				if (connectSize >= 3) {
					bingoLines.push(symbol + '-' + connectSize);
					// 添加所有中獎位置
					bingoIndexes = bingoIndexes.concat(lineIndexes);
				}

			}
			return {
				bingoLines: bingoLines,
				bingoIndexes: bingoIndexes
			};
		},
		// 取得中獎金額
		getBingoMoney: function(bingoLines) {
			var bingoMoney = 0;
			// 查看每一條線
			for (var i = bingoLines.length - 1; i >= 0; i--) {
				var bingoKey = bingoLines[i];
				// 從中獎目錄尋找
				for (var j = this.symbolOdds.length - 1; j >= 0; j--) {
					var checkKey = this.symbolOdds[j][0];
					if (bingoKey == checkKey) {
						var lineMoney = this.bet * this.symbolOdds[j][1];
						bingoMoney += lineMoney;
						console.log(checkKey + ':' + lineMoney);
					}
				}
			}

			return bingoMoney;
		},
		// 重新設定顯示盤面
		arrangeRibbons: function(screen, bingoIndexes) {
			var ribbonIdx = 0;
			for (var idx = 0; idx < screen.length; idx++) {
				var idxInRibbon = idx % this.ribbonLength;
				if (idx != 0 && idxInRibbon == 0) {
					ribbonIdx++;
				}
				// 更新盤面
				this.ribbons[ribbonIdx][idxInRibbon] = screen[idx];
				// 畫盤面
				var isBingo = bingoIndexes && bingoIndexes.includes(idx);
				this.drawSymbol(ribbonIdx, idxInRibbon, screen[idx], isBingo);
			}
		},
		// 取得顯示的圖標
		getShowSymbol: function(symbol) {
			var symbols = this.symbols;
			for (symbolSet of symbols) {
				if (symbolSet[0] == symbol) {
					return symbolSet[1];
				}
			}
			return '?';
		},
		// 取得tick的間隔時間
		getTickerGap: function() {
			var tickGap = this.animationTickGap;
			if (this.isFastSpin) {
				tickGap = tickGap / 10;
			}
			return tickGap;
		},
		// 取得動畫時間
		getAnimationLength: function() {
			var length = this.animationLength;
			if (this.isFastSpin) {
				length = length / 10;
			}
			return length;
		},
		// 建立動畫演出timer
		createSpinAnimationTimer: function() {
			if (this.isAnimation) {
				return;
			} else {
				this.animationTicker = 0;
				this.isAnimation = true;
			}
			this.animationTimer = setInterval(this.animationTimerTick, this.getTickerGap());
		},
		// 動畫演出每一次tick
		animationTimerTick: function() {
			var animationTicker = this.animationTicker;
			// console.log('animationTimerTick...' + animationTicker);
			// 結束動畫與刷新資訊
			if (animationTicker >= this.getAnimationLength()) {
				clearInterval(this.animationTimer);
				this.isAnimation = false;
				this.showFinalDatas();
				return;
			} else {
				this.animationTicker += this.getTickerGap();
			}

			// 重整假的盤面
			this.arrangeRibbons(this.calculateScreen());
			// 強制重整
			this.$forceUpdate();
		},
		// 顯示最後畫面內容
		showFinalDatas: function() {
			var screen = this.screen;
			// 計算連線
			var bingos = this.getBingoLines(screen);
			console.log('bingos: ' + JSON.stringify(bingos));
			// 計算得分
			var winMoney = this.getBingoMoney(bingos.bingoLines);
			this.win = winMoney;
			console.log('winMoney: ' + winMoney);
			// 重整盤面
			this.arrangeRibbons(screen, bingos.bingoIndexes);
			// 累加得分
			this.addWin(winMoney);
		},

	}
});
