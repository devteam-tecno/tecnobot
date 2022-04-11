module.exports = [
	{
		// Menu Principal
		question: "De qual área é a capacitação?",
		description:
			"Caso deseje remover uma capacitação já inscrita, basta selecionar ela novamente.\nCaso deseje finalizar, selecione a opção ` Finalizar `",
		placeholder: "Selecione a área",
		customId: "tipo",
		options: [
			{
				label: "Nível Básico",
				value: "basico",
				emoji: "💻",
			},
			{
				label: "Nível Intermediário",
				value: "intermediario",
				emoji: "🧠",
			},
			{
				label: "Design",
				value: "design",
				emoji: "🎨",
			},
			{
				label: "Comercial",
				value: "comercial",
				emoji: "💰",
			},
			{
				label: "Finalizar",
				value: "finalizar",
				emoji: "❌",
			},
		],
	},
	{
		// Básico
		question: "Qual capacitação você quer adicionar?",
		description: "Você está visualizando capacitações do Nível Básico!",
		placeholder: "Selecione a capacitação",
		customId: "basico",
		options: [
			{
				label: "Introdução à Web - #01",
				description: "Igor Lima Rocha",
				value: "web-1",
				emoji: "💻",
			},
			{
				label: "Introdução à Web - #02",
				description: "Igor Lima Rocha",
				value: "web-2",
				emoji: "💻",
			},
			{
				label: "Introdução à Web - #03",
				description: "Igor Lima Rocha",
				value: "web-3",
				emoji: "💻",
			},
			{
				label: "Voltar",
				value: "voltar",
				emoji: "⬅️",
			},
		],
	},
	{
		// Intermediário
		question: "Qual capacitação você quer adicionar?",
		description: "Você está visualizando capacitações de Nível Intermediário!",
		placeholder: "Selecione a capacitação",
		customId: "intermediario",
		options: [
			{
				label: "AINDA NÃO FOI ADICIONADO",
				description: "Esperem mais um pouco!",
				value: "espera",
				emoji: "🧠",
			},
			{
				label: "Voltar",
				value: "voltar",
				emoji: "⬅️",
			},
		],
	},
	{
		// Design
		question: "Qual capacitação você quer adicionar?",
		description: "Você está visualizando capacitações de Design!",
		placeholder: "Selecione a capacitação",
		customId: "design",
		options: [
			{
				label: "Prototipação com Figma - #01",
				description: "Igor Lima Rocha",
				value: "figma-1",
				emoji: "🎨",
			},
			{
				label: "Prototipação com Figma - #02",
				description: "Igor Lima Rocha",
				value: "figma-2",
				emoji: "🎨",
			},
			{
				label: "Prototipação com Figma - #03",
				description: "Igor Lima Rocha",
				value: "figma-3",
				emoji: "🎨",
			},
			{
				label: "Voltar",
				value: "voltar",
				emoji: "⬅️",
			},
		],
	},
	{
		// Comercial
		question: "Qual capacitação você quer adicionar?",
		description: "Você está visualizando capacitações de Comercial!",
		placeholder: "Selecione a capacitação",
		customId: "comercial",
		options: [
			{
				label: "AINDA NÃO FOI ADICIONADO",
				description: "Esperem mais um pouco!",
				value: "espera",
				emoji: "💰",
			},
			{
				label: "Voltar",
				value: "voltar",
				emoji: "⬅️",
			},
		],
	},
]
