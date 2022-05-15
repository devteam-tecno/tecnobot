const Command = require("../../structures/Command")
const { MessageEmbed } = require("discord.js")
const NameToId = require("../../util/nameToDiscordId")

const { google } = require("googleapis")
const { GoogleAuth } = require("google-auth-library")

const erro = require("../../util/erro")

const transferenciasChannel = "975368561331695676"

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
		const destinatarioUser = interaction.options.getUser("usuário")
		const destinatario = NameToId.find(
			(m) => m.discordId === destinatarioUser.id
		)

		const pagadorUser = interaction.user
		const pagador = NameToId.find((m) => m.discordId === pagadorUser.id)

		if (!pagador) {
			erro(
				interaction,
				"Você precisa ser um membro da TecnoJr para realizar uma transferência de XP"
			)

			return
		}

		if (!destinatario) {
			erro(
				interaction,
				`Você só pode transferir XP para membros da TecnoJr.
				${destinatarioUser} não está no banco de dados da Tecno.`
			)

			return
		}

		const todayFormatSheet = new Date().toISOString().slice(0, 10)

		const spreadsheetMembros = await getValues("DBTotal!B2:E")
		const spreadsheetTrainees = await getValues("TraineesDBTotal!B2:E")

		let perfilPagador = spreadsheetMembros.values.find(
			(m) => m[1] === pagador.name
		)
		if (!perfilPagador) {
			perfilPagador = spreadsheetTrainees.values.find(
				(m) => m[1] === pagador.name
			)
		}

		if (!perfilPagador) {
			erro(
				interaction,
				`Não foi possível encontrar seu perfil no banco de dados da Tecno.
				Envie uma mensagem para algum diretor para verificar isso!`
			)

			return
		}

		let xpAtual = perfilPagador[2]

		xpAtual = Number(xpAtual.replace(",", "."))
		if (valor > xpAtual) {
			erro(
				interaction,
				`Você só tem **${xpAtual.toFixed(2)}xp**
            	Farme mais **${(valor - xpAtual).toFixed(2)}xp** para fazer o pix!`
			)

			return
		}

		if (valor < 0.01) {
			erro(interaction, "Insira um valor válido para fazer o pix!")

			return
		}

		if (pagador.name == destinatario.name) {
			erro(interaction, "Escolha um usuário que não seja você mesmo...")

			return
		}

		await insertValues("Transferencias!A4:D", [
			[pagador.name, destinatario.name, todayFormatSheet, valor],
		])

		const valorFixed = valor.toFixed(2)
		let embed = new MessageEmbed()
			.setTitle(`Pagamento Realizado`)
			.setDescription(
				`Você acabou de transferir **${valorFixed}xp** para **${destinatario.name}**`
			)
			.setColor("GREEN")
			.setTimestamp()

		interaction.reply({
			ephemeral: false,
			embeds: [embed],
		})

		embed = new MessageEmbed()
			.setTitle(`Pagamento Recebido`)
			.setDescription(
				`**${pagador.name}** (<@${pagadorUser.id}>) acabou de te enviar um pix de **${valorFixed}xp** `
			)
			.setColor("GREEN")
			.setTimestamp()

		destinatarioUser.send({ embeds: [embed] })

		embed = new MessageEmbed()
			.setTitle(`Transferência Realizada`)
			.setDescription(
				`${pagadorUser} fez um pix de **${valorFixed}xp** para ${destinatarioUser}`
			)
			.setColor("GREEN")
			.setTimestamp()

		interaction.guild.channels.cache.get(transferenciasChannel).send({
			embeds: [embed],
		})
		console.log(
			`[LOG] ${pagador.name} transferiu ${valorFixed}xp para ${destinatario.name}`
		)
		return
	}
}
