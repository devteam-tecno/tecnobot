const Event = require("../../structures/Event")

module.exports = class extends Event {
	constructor(client) {
		super(client, {
			name: "ready",
		})
	}

	run = () => {
		console.log(`Bot ${this.client.user.username} logado com sucesso!`)
		this.client.registryCommands()
	}
}
