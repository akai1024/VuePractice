var snake = new Vue({
	el: '#Monopoly',
	data: {

		// 場景設定
		blockWidth: 50,
		boardCanvas: null,
		boardCtx: null,
		fieldColor: "#baff81",
		fieldColumns: FieldColumns,
		fieldRows: FieldRows,
		path: Path2, // 可購置產的地圖路線
		pathColor: '#e6e6e6',
		streetMarkWidth: 20,
		streetMarkColors: StreetMarkColors,
		publicPropertyColor: '#848484',
		propertyMarkWidth: 10,
		propertyMaxLevel: 4,
		playerMarkWidth: 15,

		// 遊戲設定
		playerSize: 4,
		initialMoney: 1000,
		playerColors: ['#ffdd1d', '#f4241c', '#10b555', '#fa5cff'],
		maxStreetInRowSize: 8, // 街道最大長度
		roundBonus: 100, // 通過起點的紅利金

		// 遊戲局資料
		pathRoute: [],
		players: [],
		brokePlayers: [],
		playerMap: null,
		isGaming: false,
		turnIdx: -1,
		isBuying: false,
		isNeedResetCity: false,

	},

	mounted() {
		// 設定畫布
		let canvas = this.$refs['board'];
		let blockWidth = this.blockWidth;
		canvas.width = this.fieldColumns * blockWidth;
		canvas.height = this.fieldRows * blockWidth;
		let ctx = canvas.getContext('2d');
		this.boardCanvas = canvas;
		this.boardCtx = ctx;
		// 畫場景
		for (var row = 0; row < this.fieldRows; row++) {
			for (var col = 0; col < this.fieldColumns; col++) {
				var color = this.fieldColor;
				// 路徑顏色
				let pNum = this.path[row][col];
				if (pNum > 0) {
					color = this.pathColor;
				}
				this.drawBlock(col, row, color);
			}
		}

		// 重置城市
		this.resetCity();
	},
	methods: {
		drawBlockWithProperty(property) {
			let col = property.col;
			let row = property.row;
			let type = property.type;
			let owner = property.owner;
			let level = property.level;
			let value = property.value;
			let players = property.players;

			var blockColor = this.publicPropertyColor;
			var isPrivate = false;
			if (type == PropertyType_Private) {
				blockColor = this.pathColor;
				var streetColor = this.streetMarkColors[property.streetId];
				isPrivate = true;
			}
			// 塗上格子底色
			this.drawBlock(col, row, blockColor);
			if (isPrivate) {
				// 塗上街道標記
				this.drawStreetMark(col, row, streetColor);
				// 塗上等級
				this.drawPropertyLevel(col, row, owner, level);
			}

			if (type == PropertyType_StartPoint) {
				// 畫上起點
				this.drawInfos(col, row, 'Start');
			} else {
				// 塗上價值
				this.drawValue(col, row, value);
			}

			// 塗上玩家記號
			for (var pIdx = 0; pIdx < players.length; pIdx++) {
				this.drawPlayerMark(col, row, players[pIdx], pIdx);
			}

		},
		drawBlock(col, row, color) {
			let blockWidth = this.blockWidth;
			let ctx = this.boardCtx;
			let x = col * blockWidth;
			let y = row * blockWidth;
			// 填色
			ctx.fillStyle = color;
			ctx.fillRect(x, y, blockWidth, blockWidth);
			// 畫格線
			ctx.strokeStyle = "black";
			ctx.lineWidth = 2;
			ctx.strokeRect(x, y, blockWidth, blockWidth);
		},
		drawValue(col, row, value) {
			this.drawInfos(col, row, '$' + value);
		},
		drawInfos(col, row, infos, color) {
			let blockWidth = this.blockWidth;
			let ctx = this.boardCtx;
			let x = col * blockWidth + blockWidth / 2;
			let y = row * blockWidth + blockWidth / 2;
			if (color) {
				ctx.fillStyle = color;
			} else {
				ctx.fillStyle = "#000000";
			}
			ctx.font = "12px Arial";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(infos, x, y);
		},
		shuffleStreetMarkColor() {
			var j, x, i;
			for (i = this.streetMarkColors.length - 1; i > 0; i--) {
				j = Math.floor(Math.random() * (i + 1));
				x = this.streetMarkColors[i];
				this.streetMarkColors[i] = this.streetMarkColors[j];
				this.streetMarkColors[j] = x;
			}
		},
		drawStreetMark(col, row, color) {
			let blockWidth = this.blockWidth;
			let streetMarkWidth = this.streetMarkWidth;
			let ctx = this.boardCtx;
			let x = col * blockWidth + (blockWidth - streetMarkWidth);
			let y = row * blockWidth;
			// 填色
			ctx.fillStyle = color;
			ctx.fillRect(x, y, streetMarkWidth, streetMarkWidth);
		},
		drawPropertyLevel(col, row, owner, level) {
			let blockWidth = this.blockWidth;
			let propertyMarkWidth = this.propertyMarkWidth;
			let ctx = this.boardCtx;
			let x = col * blockWidth
			let y = row * blockWidth + (blockWidth - propertyMarkWidth);
			for (var lv = 1; lv <= this.propertyMaxLevel; lv++) {
				var color = '#ffffff';
				if (level && level >= lv && owner) {
					color = owner.color;
				}
				ctx.fillStyle = color;
				ctx.fillRect(x, y, propertyMarkWidth, propertyMarkWidth);
				// 畫格線
				ctx.strokeStyle = "black";
				ctx.lineWidth = 2;
				ctx.strokeRect(x, y, propertyMarkWidth, propertyMarkWidth);
				// 往右移動定位
				x += propertyMarkWidth;
			}
		},
		drawPlayerMark(col, row, player, order) {
			let blockWidth = this.blockWidth;
			let playerMarkWidth = this.playerMarkWidth;
			let ctx = this.boardCtx;
			let marksInCol = 2;
			let mRol = order % marksInCol;
			let mCol = Math.floor(order / marksInCol);
			let x = col * blockWidth + mCol * playerMarkWidth;
			let y = row * blockWidth + mRol * playerMarkWidth;
			// 填滿玩家顏色
			ctx.fillStyle = player.color;
			ctx.fillRect(x, y, playerMarkWidth, playerMarkWidth);
			// 畫格線
			let lineWidth = 4;
			ctx.strokeStyle = "black";
			ctx.lineWidth = lineWidth;
			ctx.strokeRect(x + lineWidth / 2, y + lineWidth / 2, playerMarkWidth - lineWidth, playerMarkWidth - lineWidth);
		},
		// 重置整個城市
		resetCity() {
			this.isGaming = false;
			this.turnIdx = -1;
			// 建立四位玩家
			this.players = [];
			this.playerMap = new Map();
			this.brokePlayers = [];
			for (var idx = 0; idx < this.playerSize; idx++) {
				let player = new Player(idx, this.initialMoney, this.playerColors[idx]);
				this.players.push(player);
				this.playerMap.set(player.name, player);
			}

			// 根據路線添加財產
			this.pathRoute = [];
			for (var row = 0; row < this.fieldRows; row++) {
				for (var col = 0; col < this.fieldColumns; col++) {
					let pNum = this.path[row][col];
					if (pNum > 0) {
						// 可放置
						this.pathRoute.push(new Property(pNum, row, col));
					}
				}
			}

			// 按照path排序
			this.pathRoute.sort(function sortProperty(a, b) {
				var pathA = a.path;
				var pathB = b.path;
				if (pathA < pathB) return -1;
				if (pathA > pathB) return 1;
				if (pathA == pathB) return 0;
			});

			// 起點
			let startPoint = this.pathRoute[0];
			startPoint.setType(PropertyType_StartPoint);

			// 隨意放置任意數量街道
			this.shuffleStreetMarkColor();
			var pathIdx = 1; // 從1開始，因為第一格是起點
			var restPropertySize = this.pathRoute.length - 1; // 扣掉起點
			for (var streedId = 0; restPropertySize > 0; streedId++) {
				var isDoPublicCal = true;
				// 隨機計算街道長度，每一個街道至少要保持兩格以上
				let streetSize = Math.floor(Math.random() * this.maxStreetInRowSize) + 2;
				if (streetSize >= restPropertySize) {
					streetSize = restPropertySize;
					isDoPublicCal = false;
				}
				for (var n = 0; n < streetSize; n++) {
					let property = this.pathRoute[pathIdx];
					if (!property) {
						console.log(pathIdx);
					}
					property.setStreetId(streedId);
					property.setType(PropertyType_Private);
					// 下一格
					pathIdx++;
				}

				// 每個街道間有機率是公有財產
				if (isDoPublicCal) {
					let dice = Math.floor(Math.random() * 3);
					if (dice == 0) {
						let nxtProperty = this.pathRoute[pathIdx];
						nxtProperty.setType(PropertyType_Public);
						pathIdx++;
						restPropertySize--;
					}
				}

				restPropertySize = restPropertySize - streetSize;
				console.log('streetId:' + streedId + ', streetSize:' + streetSize + ', restPropertySize:' + restPropertySize);
			}

			console.log('resetCity finish, properties: ' + JSON.stringify(this.pathRoute));

			// 重新畫格子
			for (var pIdx = 0; pIdx < this.pathRoute.length; pIdx++) {
				this.drawBlockWithProperty(this.pathRoute[pIdx]);
			}
		},

		// 開始遊戲
		startGame() {
			if (this.isNeedResetCity) {
				this.resetCity();
			}
			// 起點
			let startPoint = this.pathRoute[0];
			for (var idx = 0; idx < this.players.length; idx++) {
				this.movePlayer(this.players[idx], startPoint);
			}

			console.log('startGame, properties: ' + JSON.stringify(this.pathRoute));
			this.isGaming = true;
			// 重新畫起點
			this.drawBlockWithProperty(startPoint);

			// 第一位玩家開始
			this.nextPlayer();
		},

		movePlayer(player, property) {
			if (player && property) {
				// 原位置
				let orgPath = player.path;
				if (orgPath) {
					let orgProperty = this.pathRoute[orgPath - 1];
					orgProperty.removePlayer(player);
					// 重畫原本的格子
					this.drawBlockWithProperty(orgProperty);
				}
				// 新位置
				player.setPos(property);
				property.addPlayer(player);
				// 重畫新格子
				this.drawBlockWithProperty(property);
			}
		},

		nextPlayer() {
			this.isBuying = false;
			this.turnIdx++;
			if (this.turnIdx >= this.players.length) {
				this.turnIdx = 0;
			}
		},

		getTurnPlayer() {
			return this.players[this.turnIdx];
		},

		getTurnPlayerName() {
			let player = this.getTurnPlayer();
			if (player) {
				return player.name
			}
			return 'unknown';
		},

		getTurnPlayerDiceSize() {
			let player = this.getTurnPlayer();
			if (player) {
				return player.diceSize
			}
			return 0;
		},

		playerSetDice() {
			this.getTurnPlayer().setDiceSize();
		},

		playerRollDice() {
			var player = this.getTurnPlayer();
			let moves = player.rollDice();
			let nextProperty = this.getNextProperty(player, moves);
			console.log('TurnPlayer: ' + player.name + ' moves ' + moves + ' to ' + JSON.stringify(nextProperty));

			// 顯示步數
			alert('You move ' + moves + ' steps foward!');
			// 移動玩家
			this.movePlayer(player, nextProperty);

			// 通過公共設施獎勵
			if (nextProperty.type == PropertyType_Public) {
				player.addMoney(nextProperty.value);
				// 隨機更換一次獎勵金
				nextProperty.rollValue();
			}

			// 過路費
			var fee = this.calculateFee(nextProperty, player);
			if (fee > 0) {
				player.subFee(fee);
				let owner = this.playerMap.get(nextProperty.owner.name);
				owner.addMoney(fee);
				alert('You step on others property, the fee is ' + fee);

				// 破產了
				if (player.isBroke()) {
					alert('Player ' + player.name + ' is broke!');
					nextProperty.removePlayer(player);
					this.playerBroke(player);
					return;
				}
			}

			// 如果下一格可以不能行動，結束回合
			if (nextProperty.isAvailable(player)) {
				this.isBuying = true;
			} else {
				this.nextPlayer();
			}
		},

		getNextProperty(player, moves) {
			var nextPath = player.path + moves;
			// 通過起點
			if (nextPath >= this.pathRoute.length) {
				nextPath = nextPath % this.pathRoute.length;
				player.addMoney(this.roundBonus);
			}
			return this.pathRoute[nextPath - 1];
		},

		isCanBuyOrUpgrade() {
			if (this.isBuying) {
				let player = this.getTurnPlayer();
				let property = this.pathRoute[player.path - 1];
				if (property.level < this.propertyMaxLevel) {
					return property.isAvailableForBuying(player);
				}
			}
			return false;
		},

		playerBuyOrUpgrade() {
			if (this.isCanBuyOrUpgrade()) {
				let player = this.getTurnPlayer();
				let property = this.pathRoute[player.path - 1];
				player.buyOrUpdate(property);
				property.setOwner(player);
				property.upgradeLevel();
				// 重新繪製
				this.drawBlockWithProperty(property);
			}
			// 結束回合
			this.nextPlayer();
		},

		playerGiveUpBuying() {
			// 結束回合
			this.nextPlayer();
		},

		calculateFee(property, player) {
			var fee = 0;
			if (property.isChargeFee(player)) {
				// 取得整條街該持有人的數量
				var streetCombo = 0;
				var levelBonus = 0;
				for (var p = 0; p < this.pathRoute.length; p++) {
					let checkProperty = this.pathRoute[p];
					if (checkProperty.streetId == property.streetId) {
						if (checkProperty.owner && checkProperty.owner.name == property.owner.name) {
							streetCombo++;
							levelBonus += checkProperty.level;
						}
					}
				}
				let levelCombo = property.level * levelBonus;
				fee = property.value * levelCombo * streetCombo;
			}
			return fee;
		},

		playerBroke(player) {
			this.resetPlayersProperties(player);
			this.players.splice(this.turnIdx, 1);
			this.brokePlayers.push(player);

			if (this.players.length == 1) {
				alert('GameOver! Winner is ' + this.players[0].name + '!');
				this.isGaming = false;
				this.isNeedResetCity = true;
				return;
			}
			this.nextPlayer();
		},

		resetPlayersProperties(player) {
			for (var p = 0; p < this.pathRoute.length; p++) {
				let checkProperty = this.pathRoute[p];
				if (checkProperty.owner && checkProperty.owner.name == player.name) {
					checkProperty.cleanOwner();
					this.drawBlockWithProperty(checkProperty);
				}
			}
		},
	},
});
