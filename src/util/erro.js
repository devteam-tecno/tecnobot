const { MessageEmbed } = require("discord.js")

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

module.exports = erro
