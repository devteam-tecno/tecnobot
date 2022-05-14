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

const getValues = async (range) => {
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

const getLastRow = async (range) => {
	const sheetData = await getValues(range)
	const lastRow = 4 + sheetData.values.length

	return lastRow
}

const insertValues = async (range, values) => {
	const authClientObject = await auth.getClient()
	const googleSheetsInstance = google.sheets({
		version: "v4",
		auth: authClientObject,
	})

	const spreadsheetId = "1rUww92ZNxpt4JyQmU9avUYa0bey_9QhaCLXIh5fFO3A"

	const sheetData = await getValues(range)
	const lastRow = 4 + sheetData.values.length

	const requestBody = {
		values,
	}
	await googleSheetsInstance.spreadsheets.values.append(
		{
			spreadsheetId,
			range,
			valueInputOption: "USER_ENTERED",
			requestBody,
		},
		(err, result) => {
			// if (err) {
			// 	console.log(err)
			// } else {
			// 	console.log(result)
			// }
		}
	)
}

const erro = async (interaction, message) => {
	const embed = new MessageEmbed()
		.setTitle(`Erro`)
		.setDescription(message)
		.setColor("RED")
		.setTimestamp()

	interaction.reply({
		ephemeral: true,
		embeds: [embed],
	})
}

module.exports = class extends Command {
	constructor(client) {
		super(client, {
			name: "pix",
			description:
				"Faz uma transferência de XP para o usuário especificado",
			options: [
				{
					name: "usuário",
					type: "USER",
					description: "O usuário que vai receber o XP.",
					required: true,
				},
				{
					name: "valor",
					type: "NUMBER",
					description: "Valor em XP que você vai enviar",
					required: true,
				},
			],
		})
	}
	run = async (interaction) => {
		const valor = interaction.options.getNumber("valor")
		const user = interaction.options.getUser("usuário")
		const destinatario = NameToId.find((m) => m.discordId === user.id)

		const pagadorU = interaction.user
		const pagador = NameToId.find((m) => m.discordId === pagadorU.id)

		if (!destinatario || !pagador) {
			erro(interaction, "Ocorreu um erro")
			return
		}
		let destinatarioName = destinatario.name
		let pagadorName = pagador.name

		const todayFormatSheet = new Date().toISOString().slice(0, 10)

		const spreadsheetMembros = await getValues("DBTotal!B2:E")
		const spreadsheetTrainees = await getValues("TraineesDBTotal!B2:E")

		let perfilPagador = spreadsheetMembros.values.find(
			(m) => m[1] === pagadorName
		)
		if (!perfilPagador) {
			perfilPagador = spreadsheetTrainees.values.find(
				(m) => m[1] === pagadorName
			)
		}

		let xpAtual = 0
		if (perfilPagador) {
			xpAtual = perfilPagador[2]
		} else {
			erro(interaction, "Ocorreu um erro")
			return
		}

		xpAtual = Number(xpAtual.replace(",", "."))
		if (valor > xpAtual) {
			erro(
				interaction,
				`Você só tem **${xpAtual.toFixed(2)}xp**\n
            Farme mais **${(valor - xpAtual).toFixed(2)}xp** para fazer o pix!`
			)
			return
		}

		if (valor <= 0) {
			erro(interaction, "Insira um valor válido para fazer o pix!")

			return
		}

		if (pagadorName == destinatarioName) {
			erro(interaction, "Escolha um usuário que não seja você mesmo...")

			return
		}

		await insertValues("Transferencias!A4:D", [
			[pagadorName, destinatarioName, todayFormatSheet, valor],
		])
		const embed = new MessageEmbed()
			.setTitle(`Pagamento Realizado`)
			.setDescription(
				`Você acabou de transferir **${valor.toFixed(
					2
				)}xp** para **${destinatarioName}**`
			)
			.setColor("GREEN")
			.setTimestamp()

		interaction.reply({
			ephemeral: false,
			embeds: [embed],
		})
		console.log(
			`[LOG] ${pagadorName} transferiu ${valor}xp para ${destinatarioName}`
		)
		return
	}
}
