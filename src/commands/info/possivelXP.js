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
			name: "possivelxp",
			description: "Possíveis formas de você receber XP aqui na Tecno!",
		})
	}
	run = async (interaction) => {
		const spreadsheet = await startGoogle("Referencia!A2:B")
		const embed = new MessageEmbed()
			.setTitle("Possíveis formas de conseguir XP")
			.setColor("#5e16ca")

		let table = []
		let i = 0
		for (const forma of spreadsheet.values) {
			table[i] = []
			table[i++].push(forma[1], forma[0])
		}

		let formattedText = ""
		table.forEach((row) => {
			formattedText +=
				"`" + ("    " + row[0]).slice(-4) + " `᲼᲼|᲼᲼" + row[1] + "\n"
		})

		embed.setDescription(`᲼**XP**᲼᲼᲼|᲼᲼**Atividade**\n${formattedText}`)

		interaction.reply({
			ephemeral: false,
			embeds: [embed],
		})
	}
}
