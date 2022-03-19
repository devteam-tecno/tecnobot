const Event = require("../../structures/Event")

module.exports = class extends Event {
	constructor(client) {
		super(client, {
			name: "ready",
		})
	}

	run = (client) => {
		var guild = client.guilds.cache.get("675516131552788508") // TecnoJr
		var memberCount = guild.members.cache.filter(
			(member) => member.roles.cache.has("712040239677440080") // Cargo Membro
		).size
		var diretoresCount = guild.members.cache.filter(
			(member) => member.roles.cache.has("712040676040245350") // Cargo Diretoria
		).size

		let mensagem = `■ TecnoBot on! Total de ${memberCount} membros, sendo ${diretoresCount} diretores! ■`
		let barra = ""

		for (let i = 0; i < mensagem.length; i++) {
			barra = barra + "■"
		}

		console.log(barra)
		console.log(mensagem)
		console.log(barra + "\n\n")
		this.client.registryCommands()
	}
}
