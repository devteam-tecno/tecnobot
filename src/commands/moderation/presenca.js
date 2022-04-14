const Command = require("../../structures/Command")
const { MessageEmbed } = require("discord.js")
const NameToId = require("../../util/nameToDiscordId")

const { google } = require("googleapis")
const { GoogleAuth } = require("google-auth-library")

const auth = new GoogleAuth({
	keyFile: "keys.json", //the key file
	//url to spreadsheets API
	scopes: "https://www.googleapis.com/auth/spreadsheets",
})

const startGoogle = async (range) => {
	const authClientObject = await auth.getClient()
	const googleSheetsInstance = google.sheets({
		version: "v4",
		auth: authClientObject,
	})

	const spreadsheetId = "1rUww92ZNxpt4JyQmU9avUYa0bey_9QhaCLXIh5fFO3A"

	const readData = await googleSheetsInstance.spreadsheets.values
		.get({
			auth, //auth object
			spreadsheetId, // spreadsheet id
			range, //range of cells to read from.
		})
		.catch((err) => {
			console.log(err)
		})

	return readData.data
}

const presencaChannel = "852308408698667048"
module.exports = class extends Command {
	constructor(client) {
		super(client, {
			name: "presenca",
			description:
				"Salva a presença da reunião na Planilha de Gameficação e no chat de Presença",
			options: [
				{
					name: "descrição",
					type: "STRING",
					description:
						"A descrição da reunião, seja ela Geral, de projeto, etc...",
					required: true,
				},
			],
		})
	}
	run = async (interaction) => {
		if (
			!interaction.member.roles.cache.has("712040676040245350") &&
			!interaction.member.roles.cache.has("963984256420417606")
		) {
			const embedErr = new MessageEmbed()
				.setTitle("Erro")
				.setDescription(
					"Você não tem permissão para realizar esse comando."
				)
				.setColor("RED")

			interaction.reply({
				embeds: [embedErr],
				ephemeral: true,
			})
			return
		}
		const motivoPresenca = interaction.options.getString("descrição")
		const spreadsheet = await startGoogle("Referencia!B2:C")

		const user = await interaction.member.fetch()
		const channelUserIsIn = await user.voice.channel

		if (channelUserIsIn) {
			const embed = new MessageEmbed()
				.setTitle(
					`Presença do dia ${new Date().toLocaleDateString("pt-BR")}`
				)
				.setDescription(motivoPresenca)
				.setColor("#5e16ca")
				.setTimestamp()

			for (const member of channelUserIsIn.members) {
				let idMembro = member[0] // Id do membro
				let membro = NameToId.find((m) => m.discordId === idMembro)
				let user = member[1]

				embed.addField(
					membro?.name || user.user.username,
					membro?.name
						? `<@${idMembro}>`
						: `<@${idMembro}>, não está na DB`
				)
			}

			interaction.guild.channels.cache.get(presencaChannel).send({
				embeds: [embed],
			})
			interaction.reply({
				content: `Presença foi salva no canal ${interaction.guild.channels.cache.get(
					presencaChannel
				)}`,
				ephemeral: true,
			})
		} else {
			const embed = new MessageEmbed()
				.setTitle(`Erro`)
				.setDescription(
					"Para realizar a presença, você também precisa estar presente!\nEntre no canal de voz da reunião e utilize o comando novamente!"
				)
				.setColor("RED")
				.setTimestamp()

			interaction.reply({
				ephemeral: true,
				embeds: [embed],
			})
		}
	}
}
