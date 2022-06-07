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
