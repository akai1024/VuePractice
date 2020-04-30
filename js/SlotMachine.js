var slotMachine = new Vue({
  el: '#SlotMachine',
  data: {
    // 每注金額
    eachBet: 10,
    // 最大下注額
    maxBet: 200,

    // 下注額
    bet: 10,
    // 當前金額
    totalMoney: 1000,
    // 總贏錢
    totalWin: 0,
    // 總下注
    totalBet: 0,
    // 貸款金額
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
    symbolOdds:[
    ['1-3', 15],
    ['2-3', 8],
    ['3-3', 5],
    ['4-3', 3],
    ['5-3', 1],
    ['6-3', 1],
    ],
    // 中獎線位置
    bingoIndex: [
    [0,1,2],
    [0,4,8],
    [3,4,5],
    [6,4,2],
    [6,7,8],
    ],
    // 當前排列帶
    ribbons:[
    [1,1,1],
    [1,1,1],
    [1,1,1],
    ],
  },
  methods: {
    // 將顯示的內文轉成人看的
    getSymbolText: function(symbol){
      for(var idx = 0; idx < this.symbols.length; idx++){
        var symbolNum = this.symbols[idx][0];
        if(symbolNum == symbol){
          return this.symbols[idx][1];
        }
      }
      return 'unknown';
    },
    // 設定下注
    setBet: function() {
      if(this.bet >= this.maxBet){
        this.bet = this.eachBet;
      } else {
        this.bet += this.eachBet;
      }
    },
    // 增加金額（貸款）
    addMoney: function() {
      this.loan += 1000;
      this.totalMoney += 1000;
    },
    // 下注扣錢
    subBet: function(){
      this.totalMoney -= this.bet;
    },
    // 增加贏錢
    addWin: function(win) {
      if(win <= 0){
        return;
      }
      this.totalWin += win;
      this.totalMoney += win;
    },
    // 轉動
    spin: function() {
      if(this.totalMoney < this.bet){
        alert('Not enough money');
        return;
      } else {
        this.subBet();
      }

      this.totalBet += this.bet;
      this.addWin(this.calculateScreen());
    },
    // 計算盤面
    calculateScreen: function(){
      console.log('calculateScreen...')
      var win = 0;

      // 取得盤面
      var screenSize = this.ribbonSize * this.ribbonLength;
      var screen = [];
      for (var i = 0; i < screenSize; i++) {
        var index = Math.floor(Math.random() * this.symbols.length);
        screen.push(this.symbols[index][0]);
      }
      console.log('screen: '+screen);

      // 計算連線
      var bingoLines = this.getSymbolLines(screen);
      console.log('bingoLines: '+bingoLines);
      // 計算得分
      var winMoney = this.getBingoMoney(bingoLines);
      console.log('winMoney: '+winMoney);
      // 重整盤面
      this.arrangeRibbons(screen);
      return winMoney;
    },
    // 取得贏線
    getSymbolLines: function(screen){
      var bingoLines = [];
      // 每一條線
      for(var lineIndex = 0; lineIndex < this.bingoIndex.length; lineIndex++){
        var indexArr = this.bingoIndex[lineIndex];
        var symbol = 0;
        var connectSize = 1;
        // 線上每一個位置
        for(var idx = 0; idx < indexArr.length; idx ++){
          var ribbonIdx = indexArr[idx];
          if(idx == 0){
            symbol = screen[ribbonIdx];
            continue;
          }
          var curSymbol = screen[ribbonIdx];
          if(curSymbol == symbol){
            connectSize ++;
          } else {
            break;
          }
        }

        bingoLines.push(symbol + '-' + connectSize);  
      }
      return bingoLines;
    },
    // 取得中獎金額
    getBingoMoney: function(bingoLines){
      var bingoMoney = 0;

      // 查看每一條線
      for (var i = bingoLines.length - 1; i >= 0; i--) {
        var bingoKey = bingoLines[i];
        // 從中獎目錄尋找
        for (var i = this.symbolOdds.length - 1; i >= 0; i--) {
          var checkKey = this.symbolOdds[i][0];
          if(bingoKey == checkKey){
            bingoMoney += (this.bet * this.symbolOdds[i][1]);
          }
        }
      }

      return bingoMoney;
    },
    // 把盤面填入
    arrangeRibbons: function(screen){
      var ribbonIdx = 0;
      for(var idx = 0; idx < screen.length; idx++){
        var idxInRibbon = idx % this.ribbonLength;
        if(idx != 0 && idxInRibbon == 0){
          ribbonIdx++;
        }

        this.ribbons[ribbonIdx][idxInRibbon] = screen[idx];
      }
    },

  }
});
