var table = new Vue({
	el: '#table',
	data: {
		welcomeWords: "HelloGambler",
		cardDeck: [],
	},
	methods: {

		printDeck: function() {
			for (var card of this.cardDeck) {
				console.log(card.suit + ':' + card.getNumberShowForm());
			}
		},

		createNewDeck: function() {
			console.log('createNewDeck');
			this.cardDeck = [];

			var minNum = PokerCard.getMinNumber();
			var maxNum = PokerCard.getMaxNumber();
			var suits = PokerCard.getSuits();
			for (var number = minNum; number <= maxNum; number++) {
				for (var [key, value] of suits) {
					this.cardDeck.push(new PokerCard(key, number));
				}
			}

		},

		shuffleDeck: function() {
			var j, x, i;
			for (i = this.cardDeck.length - 1; i > 0; i--) {
				j = Math.floor(Math.random() * (i + 1));
				x = this.cardDeck[i];
				this.cardDeck[i] = this.cardDeck[j];
				this.cardDeck[j] = x;
			}
			// 呼叫revers來讓vue觀察到陣列改變
			this.cardDeck.reverse();
		},


	},
});
