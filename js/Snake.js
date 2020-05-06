var snake = new Vue({
	el: '#Snake',
	data: {

		// 配置相關的數值
		fieldCanvas: null,
		fieldCtx: null,
		fieldWidth: 25,
		fieldHeight: 25,
		bodyWidth: 20,
		speedUpGap: 5,
		fieldColor: "#d6d6d6",
		ObjectColor: "#5a5a5a",
		// 方向 [dX, dY, 反向]
		directions: {
			right: [1, 0, 'left'],
			left: [-1, 0, 'right'],
			up: [0, -1, 'down'],
			down: [0, 1, 'up'],
		},

		// 蛇身, 頭是body[0]
		body: [
			[2, 0],
			[1, 0],
			[0, 0],
		],
		// 面向
		faced: 'right',
		nextFaced: 'right',
		timer: null,
		speed: 1,
		isGaming: false,
		isGameOver: false,
		food: null,
		score: 0,
		highScore: 0,

	},
	created() {
		window.addEventListener('keydown', this.keyPressEvt);
		window.addEventListener('keypress', this.keyPressEvt);
	},
	mounted() {
		// 設定畫布
		let canvas = this.$refs['field'];
		canvas.width = this.fieldWidth * this.bodyWidth;
		canvas.height = this.fieldHeight * this.bodyWidth;
		let ctx = canvas.getContext('2d');
		this.fieldCanvas = canvas;
		this.fieldCtx = ctx;

		// 第一次畫
		this.render();
	},
	beforeDestroy() {
		clearInterval(this.timer);
		window.removeEventListener('keydown', this.keyPressEvt);
		window.removeEventListener('keypress', this.keyPressEvt);
	},
	methods: {
		// 畫畫面
		render() {
			// 清空
			let ctx = this.fieldCtx;
			ctx.fillStyle = this.fieldColor;
			ctx.fillRect(0, 0, this.fieldCanvas.width, this.fieldCanvas.height);

			// 畫身體
			for (var idx = 0; idx < this.body.length; idx++) {
				let pos = this.body[idx];
				this.drawBlock(ctx, this.ObjectColor, pos[0], pos[1]);
			}
		},
		// 畫格子
		drawBlock(context, color, x, y) {
			let bodyWidth = this.bodyWidth;
			context.fillStyle = color;
			context.fillRect(x * bodyWidth, y * bodyWidth, bodyWidth, bodyWidth);
		},
		// 啟動遊戲
		start() {
			this.timer = setInterval(this.timerTick, 500 / this.speed);
			this.isGaming = true;
			this.food = this.createFood();
			this.drawBlock(this.fieldCtx, this.ObjectColor, this.food[0], this.food[1]);
		},
		// 新的一局
		newGame() {
			// 初始化data
			this.body = [
				[2, 0],
				[1, 0],
				[0, 0],
			];
			this.faced = 'right';
			this.nextFaced = 'right';
			this.timer = null;
			this.speed = 1;
			this.isGaming = false;
			this.isGameOver = false;
			this.food = null;
			this.score = 0;

			// 重新繪製場景
			this.render();
		},
		// 每次timerTick
		timerTick() {
			// 往面向方向前進
			var body = this.body;
			var head = body[0];
			let direction = this.getDirection(this.nextFaced);
			var newHead = [0, 0];
			newHead[0] = head[0] + direction[0];
			newHead[1] = head[1] + direction[1];
			// console.log(newHead);
			// 判斷是否在邊界或碰觸到自己
			if (this.isReachEdge(newHead) || this.isHitSelf(newHead)) {
				this.gameOver();
				return;
			}
			// 判斷是否吃到食物
			var isGainLength = false;
			if (this.isHitFood(newHead)) {
				isGainLength = true;
				this.score++;
				// 每得分到一個程度速度加快
				if (this.score % this.speedUpGap == 0) {
					this.speed++;
					clearInterval(this.timer);
					this.timer = setInterval(this.timerTick, 500 / this.speed);
				}
				// 如果自己長度跟場景一樣大，表示完全結束了
				if (this.body.length + 1 == this.fieldWidth * this.fieldHeight) {
					alert('YouCompleteTheGame!');
					this.gameOver();
					return;
				} else {
					this.food = this.createFood(newHead);
					// 畫上新的食物
					this.drawBlock(this.fieldCtx, this.ObjectColor, this.food[0], this.food[1]);
				}
			}

			// 更新當前面向
			this.faced = this.nextFaced;
			// 把新的頭放在身體最前面
			body.unshift(newHead);
			// 畫上新的頭
			this.drawBlock(this.fieldCtx, this.ObjectColor, newHead[0], newHead[1]);
			
			// 如果沒吃到食物移除尾巴
			if (!isGainLength) {
				var tail = body.pop();
				this.drawBlock(this.fieldCtx, this.fieldColor, tail[0], tail[1]);
			}
		},
		// 是否碰撞到場地邊緣
		isReachEdge(head) {
			let x = head[0];
			let y = head[1];
			return x >= this.fieldWidth || x < 0 || y >= this.fieldHeight || y < 0;
		},
		// 是否碰撞到自己身體
		isHitSelf(head) {
			// 忽略頭後面兩格與最後一格(理論上這幾格不可能碰撞)
			for (var idx = 2; idx < this.body.length - 1; idx++) {
				let check = this.body[idx];
				// 完全重合
				if (head[0] == check[0] && head[1] == check[1]) {
					return true;
				}
			}
			return false;
		},
		// 取得當前面向的參數
		getDirection(direction) {
			var dir = null;
			switch (direction) {
				case 'right':
					{
						dir = this.directions.right;
						break;
					}
				case 'left':
					{
						dir = this.directions.left;
						break;
					}
				case 'up':
					{
						dir = this.directions.up;
						break;
					}
				case 'down':
					{
						dir = this.directions.down;
						break;
					}
				default:
					{
						console.log('wrong faced: ' + this.faced);
					}
			}
			return dir;
		},
		// 遊戲結束
		gameOver() {
			if (this.score > this.highScore) {
				this.highScore = this.score;
			}
			this.isGaming = false;
			this.isGameOver = true;
			clearInterval(this.timer);
			alert('GameOver');
		},
		// 鍵盤事件
		keyPressEvt(e) {
			let keyCode = e.keyCode;
			if (this.isGaming) {
				// right
				if (keyCode == 39) {
					this.changeFaced('right');
				}
				// left
				else if (keyCode == 37) {
					this.changeFaced('left');
				}
				// up
				else if (keyCode == 38) {
					this.changeFaced('up');
				}
				// down
				else if (keyCode == 40) {
					this.changeFaced('down');
				}
			} else {
				// space也可以當作啟動
				if (keyCode == 32) {
					this.start();
				}
			}
		},
		// 改變面向
		changeFaced(direction) {
			// console.log('changeFaced from ' + this.faced + ' to ' + direction);
			let oppsiteDir = this.getDirection(this.faced)[2];
			// 與當前面向或是反向相同則無效
			if (this.faced == direction || direction == oppsiteDir) {
				return;
			}
			this.nextFaced = direction;
		},
		// 是否吃到食物
		isHitFood(head) {
			let food = this.food;
			if (!food) {
				return false;
			}
			return head[0] == food[0] && head[1] == food[1];
		},
		// 產生食物(使用遞迴避開身體部位)
		createFood(head) {
			var x = Math.floor(Math.random() * this.fieldWidth);
			var y = Math.floor(Math.random() * this.fieldHeight);
			let newFood = [x, y];
			if (head) {
				if (newFood[0] == head[0] && newFood[1] == head[1]) {
					return this.createFood(head);
				}
			}
			// 不能是身體上的一格
			for (var idx = 0; idx < this.body.length; idx++) {
				let check = this.body[idx];
				// 完全重合
				if (newFood[0] == check[0] && newFood[1] == check[1]) {
					return this.createFood(head);
				}
			}
			return newFood;
		},
	},
});
