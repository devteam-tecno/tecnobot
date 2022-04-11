const Event = require("../../structures/Event")
const NameToId = require("../../util/nameToDiscordId")

module.exports = class extends Event {
	constructor(client) {
		super(client, {
			name: "guildMemberAdd",
		})
	}

	run = (interaction) => {
		addTrainees(interaction)
	}
}

function addTrainees(interaction) {
	const traineeList = NameToId.filter((m) => m.role === "trainee")
	const canalAdm = interaction.guild.channels.cache.get("954836006618669197")

	let achou = traineeList.find((m) => m.discordId == interaction.user.id)
	// console.log(achou)

	if (achou) {
		let member = interaction.guild.members.cache.get(achou.discordId)
		if (!member.roles.cache.has("778982632817688586")) {
			// Cargo trainee
			try {
				member.roles.add("778982632817688586")
				member.setNickname(achou.name)
				console.log(`${member.user.username} agora é trainee`)
				canalAdm.send(
					`Um novo Trainee chegou por aqui: ${interaction.user}`
				)
			} catch (error) {
				console.log(error)
			}
		}
	} else {
		canalAdm.send(`O usuário ${interaction.user} não é um trainee`)
	}
}
