const Command = require("../../structures/Command")
const { MessageEmbed } = require("discord.js")
const NameToId = require("../../util/nameToDiscordId")
const erro = require("../../util/erro")

module.exports = class extends Command {
	constructor(client) {
		super(client, {
			name: "addtrainee",
			description: "Adiciona cargo trainee",
		})
	}
	run = async (interaction) => {
		if (!interaction.member.roles.cache.has("712040676040245350")) {
			erro(
				interaction,
				"Você não tem permissão para realizar esse comando."
			)
			return
		}

		const traineeList = NameToId.filter((m) => m.role === "trainee")

		let addedList = []

		traineeList.forEach((trainee) => {
			let member = interaction.guild.members.cache.get(trainee.discordId)

			if (member) {
				if (!member.roles.cache.has("778982632817688586")) {
					// Cargo trainee
					try {
						member.roles.add("778982632817688586")
						addedList.push(member.user)
						console.log(`${member.user.username} agora é trainee`)
					} catch (error) {
						console.log(error)
					}
				}
			}
		})

		if (addedList.length > 0) {
			interaction.reply({
				content: `Novos Trainees Adicionados:\n${addedList.join("\n")}`,
				ephemeral: true,
			})
		} else {
			interaction.reply({
				content: `Nenhum Trainee novo foi encontrado.`,
				ephemeral: true,
			})
		}
	}
}
