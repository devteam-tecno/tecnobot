const Command = require("../../structures/Command")
const NameToId = require("../../util/nameToDiscordId")
const { MessageEmbed } = require("discord.js")

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

module.exports = class extends Command {
	constructor(client) {
		super(client, {
			name: "perfil",
			description: "Mostra o seu perfil na TecnoBoard",
			options: [
				{
					name: "usuário",
					type: "USER",
					description:
						"O usuário a ser pesquisado. Caso queira ver suas informações, basta enviar o comando sozinho!",
					required: false,
				},
			],
		})
	}
	run = async (interaction) => {
		let userId = interaction.options.getUser("usuário")?.id

		if (!userId) {
			userId = interaction.user.id
		}

		const userName = NameToId.find((m) => m.discordId === userId)

		const spreadsheet = await startGoogle("DBTotal!B2:E")

		const perfil = spreadsheet.values.find((m) => m[1] === userName?.name)

		if (perfil) {
			const embed = new MessageEmbed()
				.setTitle(`👤 ${userName.name}`)
				.setColor("#5e16ca")
				.addField("Ranking", `${perfil[0]}º`, true)
				.addField("XP Total", `${perfil[2]} XP`, true)
				.addField("Tarefas Entregues", perfil[3], true)
				.setThumbnail(
					interaction.guild.members.cache
						.get(userId)
						.user.displayAvatarURL({ dynamic: true })
				)

			interaction.reply({
				embeds: [embed],
				ephemeral: false,
			})
		} else {
			const embed = new MessageEmbed()
				.setTitle(`⚠️ Erro`)
				.setDescription("Não consegui encontrar esse perfil 🤔")
				.setColor("RED")

			interaction.reply({
				embeds: [embed],
				ephemeral: true,
			})
		}
	}
}
