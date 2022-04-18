const Command = require("../../structures/Command")
const { MessageEmbed } = require("discord.js")

module.exports = class extends Command {
	constructor(client) {
		super(client, {
			name: "ping",
			description: "Mostra o ping do bot",
		})
	}
	run = (interaction) => {
		const embed = new MessageEmbed()
			.setDescription(`O ping atual é de **${this.client.ws.ping}ms.**`)
			.setColor("#2f4a94")

		interaction.reply({
			embeds: [embed],
			ephemeral: false,
		})
	}
}
