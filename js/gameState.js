function gameState(fileName) {
	this.gameData = [];
	this.fileName = fileName;
}

function getGameName(g) {
	var json = JSON.parse(localStorage.getItem('savegame' + g));
	if(json !== null) {
		return json.name;
	}
	return '';
}

function loadGame(g) {
	var save = new gameState('savegame' + g);
	save.gameData = JSON.parse(localStorage.getItem(save.fileName));
	if(save.gameData !== null) {
		mutation = save.gameData.mutation;
	}
};

function saveGame(g, name) {
	var save = new gameState('savegame' + g);
	save.gameData = {
		mutation: mutation
	};
	localStorage.setItem(save.fileName, JSON.stringify(save.gameData));
};

function deleteGame(g) {
	localStorage.removeItem('savegame' + g);
}

function castObject(ob, to) {
	return Types[ob.__type].revive(ob);
}