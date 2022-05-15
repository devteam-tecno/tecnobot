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

	// sortSheet("DBTotal!B2:D", 3, 587561281)
}

const sortSheet = async (range, index, sheetId) => {
	const authClientObject = await auth.getClient()
	const googleSheetsInstance = google.sheets({
		version: "v4",
		auth: authClientObject,
	})

	const spreadsheetId = "1rUww92ZNxpt4JyQmU9avUYa0bey_9QhaCLXIh5fFO3A"

	await googleSheetsInstance.spreadsheets.batchUpdate({
		spreadsheetId,
		requestBody: {
			requests: [
				{
					sortRange: {
						range: {
							sheetId,
							startRowIndex: 1,
							endRowIndex: 1000,
							startColumnIndex: 1,
							endColumnIndex: 3,
						},
						sortSpecs: [
							{
								dimensionIndex: index,
								sortOrder: "ASCENDING",
							},
						],
					},
				},
			],
		},
	})
}

const presencaChannel = "852308408698667048"
module.exports = class extends Command {
	constructor(client) {
		super(client, {
			name: "addxp",
			description:
				"Salva na Planilha de Gameficação e no chat de Presença",
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
			!interaction.member.roles.cache.has("712040676040245350") && //cargo diretoria
			!interaction.member.roles.cache.has("963984256420417606") // cargo monitores
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


		const user = await interaction.member.fetch()
		const channelUserIsIn = await user.voice.channel
		const todayFormatSheet = new Date().toISOString().slice(0, 10)

		if (channelUserIsIn) {
			const embed = new MessageEmbed()
				.setTitle(
					`Presença do dia ${new Date().toLocaleDateString("pt-BR")}`
				)
				.setDescription(motivoPresenca)
				.setColor("#5e16ca")
				.setTimestamp()

			let membrosPresentes = []
			let traineesPresentes = []

			let lastRowTrainee = await getLastRow("TraineesHistórico!A4:E")
			let lastRowMembro = await getLastRow("Histórico!A4:E")

			for (const member of channelUserIsIn.members) {
				let idMembro = member[0] // Id do membro
				let membro = NameToId.find((m) => m.discordId === idMembro)
				let user = member[1]
				let membroName =
					membro?.name || user.user.username || idMembro || "SEM NOME"

				await embed.addField(
					membroName,
					membro?.name
						? `<@${idMembro}>`
						: `<@${idMembro}>, não está na DB`
				)

				if (membro.role == "trainee") {
					traineesPresentes.push([
						membroName,
						todayFormatSheet,
						`=month(B${lastRowTrainee})`,
						motivoPresenca,
						`=sumif(Referencia!$A$2:$A;D${lastRowTrainee};Referencia!$B$2:$B)`,
					])
					lastRowTrainee++
				} else {
					membrosPresentes.push([
						membroName,
						todayFormatSheet,
						`=month(B${lastRowMembro})`,
						motivoPresenca,
						`=sumif(Referencia!$A$2:$A;D${lastRowMembro};Referencia!$B$2:$B)`,
					])
					lastRowMembro++
				}
			}

			if (membrosPresentes.length > 0)
				await insertValues("Histórico!A4:E", membrosPresentes)

			if (traineesPresentes.length > 0)
				await insertValues("TraineesHistórico!A4:E", traineesPresentes)

			await interaction.guild.channels.cache.get(presencaChannel).send({
				embeds: [embed],
			})

			console.log(
				`Presença do dia ${new Date().toLocaleDateString(
					"pt-BR"
				)} - ${motivoPresenca}`
			)

			await interaction
				.reply({
					content: `Presença foi salva no canal ${interaction.guild.channels.cache.get(
						presencaChannel
					)}`,
					ephemeral: true,
				})
				.catch((err) => {
					user.send(
						"A presença foi salva mesmo que tenha aparecido um erro!"
					)
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

		return
	}
}
