class Player {
	constructor(name, money, color) {
		this.name = name;
		this.money = money;
		this.color = color;
		this.diceSize = 1;
	}

	setDiceSize() {
		this.diceSize++;
		if (this.diceSize > 3) {
			this.diceSize = 1;
		}
	}

	rollDice() {
		return Math.floor(Math.random() * 6 * this.diceSize) + this.diceSize;
	}

	setPos(property) {
		this.path = property.path;
		this.col = property.col;
		this.row = property.row;
	}

	buyOrUpdate(property) {
		this.money -= property.getCost();
	}

	subFee(money) {
		this.money -= money;
	}

	addMoney(money) {
		this.money += money;
	}

	isBroke() {
		return this.money <= 0;
	}

}
