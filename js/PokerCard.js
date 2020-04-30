class PokerCard {

	constructor(suit, number) {
		this.suit = suit;
		this.number = number;
		this.id = PokerCard.getCardId(suit, number);
	}

	getCardInfo() {
		return {
			suit: this.suit,
			number: this.number
		};
	}

	getCardSuitPic() {
		return 'images/' + this.suit.toLowerCase() + '.png';
	}

	getNumberShowForm() {
		switch (this.number) {
			case 11:
				return 'J';
			case 12:
				return 'Q';
			case 13:
				return 'K';
			default:
				return this.number;
		}
	}

	compare(pokerCard) {
		var cpNumber = this.compareNumber(pokerCard.number);
		if (cpNumber == 0) {
			return compareSuit(pokerCard.suit);
		}
		return cpNumber;
	}

	compareSuit(suit) {
		if (this.suit == suit) {
			return 0;
		} else {
			var suits = PokerCard.getSuits();
			var selfNum = suits.get(this.suit);
			var compareNum = suits.get(suit);
			if (selfNum > compareNum) {
				return 1;
			} else {
				return 0;
			}
		}
	}

	compareNumber(number) {
		if (this.number == number) {
			return 0;
		} else if (this.number == this.getGreatestNumber()) {
			return 1;
		} else {
			if (this.number > number) {
				return 1;
			} else {
				return -1;
			}
		}
	}

	static getSuits() {
		return new Map([
			['Spades', 1],
			['Hearts', 2],
			['Daimonds', 3],
			['Clubs', 4]
		]);
	}

	static getMinNumber() {
		return 1;
	}

	static getMaxNumber() {
		return 13;
	}

	static getGreatestNumber() {
		return 1;
	}

	static getSmallestNumber() {
		return 2;
	}

	static getCardId(suit, number) {
		var suits = PokerCard.getSuits();
		var suitNum = suits.get(suit);
		return (suitNum - 1) * PokerCard.getMaxNumber() + number;
	}
}
