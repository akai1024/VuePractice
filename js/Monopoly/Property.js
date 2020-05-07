class Property {
	constructor(path, row, col) {
		this.path = path;
		this.row = row;
		this.col = col;
		this.level = 0;
		this.players = [];

		// 初始價值
		this.rollValue();
	}
	rollValue() {
		this.value = Math.floor(Math.random() * 50) + 10;
	}
	setType(type) {
		this.type = type;
	}
	setStreetId(id) {
		this.streetId = id;
	}
	cleanOwner() {
		this.owner = null;
		this.level = 0;
	}
	setOwner(player) {
		this.owner = player;
	}
	upgradeLevel() {
		this.level++;
	}
	addPlayer(player) {
		if (player) {
			this.players.push(player);
		}
	}
	removePlayer(player) {
		if (player) {
			var idx = -1;
			for (var i = 0; i < this.players.length; i++) {
				var p = this.players[i];
				if (player.name == p.name) {
					idx = i;
					break;
				}
			}
			if (idx >= 0) {
				this.players.splice(idx, 1);
			}
		}
	}
	isAvailable(player) {
		if (this.type == PropertyType_Private) {
			if (!this.owner) {
				return true;
			}
			if (player) {
				return player.name == this.owner.name;
			}
			return false;
		}
		return true;
	}
	isAvailableForBuying(player) {
		return this.isAvailable(player) && this.type == PropertyType_Private && player.money >= this.getCost();
	}
	getCost() {
		return this.value * (2 * this.level + 1);
	}
	isChargeFee(player) {
		if (this.owner) {
			return this.type == PropertyType_Private && this.owner.name != player.name;
		}
		return false;
	}

}
