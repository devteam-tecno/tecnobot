const Command = require("../../structures/Command")

const questions = require("../../util/capacitacaoQuestions")

const { once } = require("events")
const {
	MessageEmbed,
	MessageActionRow,
	MessageButton,
	MessageSelectMenu,
} = require("discord.js")

const questionsTimeOut = 2

const actionRow = new MessageActionRow().addComponents([
	new MessageButton().setStyle("DANGER").setLabel("Não").setCustomId("no"),
	new MessageButton()
		.setStyle("SUCCESS")
		.setLabel("Confirmar")
		.setCustomId("yes"),
])

module.exports = class extends Command {
	constructor(client) {
		super(client, {
			name: "capacitacoes",
			description:
				"Informe quais capacitações você está inscrito e interaja com seus parceiros!",
		})
	}

	run = async (interaction) => {
		await interaction.reply({
			content: "Formulário iniciado. Responda as perguntas abaixo",
			ephemeral: true,
		})

		createForm()
			.then(async (answers) => {
				// console.log(answers)
				const embed = new MessageEmbed()
					.setColor("PURPLE")
					.setTitle(`Capacitações de ${interaction.user.username}`)
					.setDescription(
						`Capacitações alteradas com sucesso!\n\n
						${answers.join("\n")}`
					)
				await interaction.channel.send({
					embeds: [embed],
					components: [],
					ephemeral: false,
				})
				await interaction.editReply({
					content: "Fim",
					components: [],
					embeds: [],
				})
			})
			.catch((err) => {
				console.log(err)

				const embed = new MessageEmbed()
					.setColor("RED")
					.setDescription(
						"Tempo limite ultrapassado, utilize o comando novamente!"
					)

				interaction.channel.send({
					content: interaction.user.toString(),
					embeds: [embed],
				})
			})

		async function createForm() {
			const answers = []
			const escolhasValues = []

			let question = questions.find((q) => q.customId === "tipo")

			let verifyEnd = false
			while (!verifyEnd) {
				const embed = new MessageEmbed()
					.setTitle(question.question)
					.setFooter({
						text: `Você tem ${questionsTimeOut} minutos para responder a essa pergunta`,
					})
					.setColor("BLURPLE")
				if (question.description)
					embed.setDescription(question.description)

				if (question.options) {
					const actionRow = new MessageActionRow().addComponents(
						new MessageSelectMenu(question)
					)
					const msg = await interaction.channel.send({
						content: interaction.user.toString(),
						embeds: [embed],
						components: [actionRow],
					})

					const filter = (i) => i.user.id === interaction.user.id

					const collector = msg.createMessageComponentCollector({
						filter,
						max: 1,
						time: questionsTimeOut * 60000,
					})

					const [collected, reason] = await once(collector, "end")

					let nextQuestion = collected.first().values.join(", ")
					let selectedChannel = interaction.guild.channels.cache.find(
						(ch) => ch.name === `${nextQuestion}`
					)

					if (selectedChannel) {
						const membro = interaction.user

						const alreadyHavePermissions =
							selectedChannel.permissionOverwrites.cache.get(
								membro.id
							)

						if (alreadyHavePermissions) {
							selectedChannel.permissionOverwrites
								.delete(membro)
								.then((channel) => {
									console.log(
										`Usuário ' ${membro.username} ' removido com sucesso na disciplina ' ${nextQuestion} '`
									)
									escolhasValues.push(`❌ → ${nextQuestion}`)
								})
								.catch(console.error)
						} else {
							selectedChannel.permissionOverwrites
								.edit(membro, {
									SEND_MESSAGES: true,
									VIEW_CHANNEL: true,
								})
								.then((channel) => {
									console.log(
										`Usuário ' ${membro.username} ' adicionado com sucesso na capacitação ' ${nextQuestion} '`
									)
									escolhasValues.push(`✅ → ${nextQuestion}`)
								})
								.catch(console.error)
						}
					}

					question = questions.find(
						(q) => q.customId === nextQuestion
					)
					if (!question) {
						question = questions.find((q) => q.customId === "tipo")
					}

					if (reason === "limit") {
						msg.delete().catch(() => {})
						answers.push({
							name: collected.first().customId,
							value: collected.first().values.join(", "),
						})
					} else if (reason === "time") {
						throw "O tempo para responder a pergunta se esgotou"
					} else {
						throw "Ocorreu um erro durante a realização do formulário"
					}
				}

				verifyEnd = answers.find((a) => {
					return a.value == "finalizar"
				})
			}

			return escolhasValues
		}
	}
}
