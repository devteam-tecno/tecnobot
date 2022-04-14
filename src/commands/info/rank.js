const Command = require("../../structures/Command")
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
			name: "rank",
			description: "Mostra o rank dos Top 10 Membros na TecnoBoard",
		})
	}
	run = async (interaction) => {
		const spreadsheet = await startGoogle("DBTotal!B2:E11")

		const lista = spreadsheet.values
		const embed = new MessageEmbed()
			.setTitle(`🏅 Rank da Tecno`)
			.setURL(
				"https://docs.google.com/spreadsheets/d/1rUww92ZNxpt4JyQmU9avUYa0bey_9QhaCLXIh5fFO3A/edit#gid=720520923"
			)
			.setColor("#5e16ca")
			.setDescription(
				"Para ver a planilha completa e fazer buscas, [clique aqui](https://docs.google.com/spreadsheets/d/1rUww92ZNxpt4JyQmU9avUYa0bey_9QhaCLXIh5fFO3A/edit#gid=720520923)"
			)
			.setTimestamp()

		lista.forEach((element) => {
			let rank = element[0]
			let nome = element[1]
			let xp = element[2]
			embed.addField(`${rank}º - **${nome}**`, `${xp} XP`)
		})

		interaction.reply({
			embeds: [embed],
			ephemeral: false,
		})
	}
}
