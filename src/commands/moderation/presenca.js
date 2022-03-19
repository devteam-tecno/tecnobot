const { google } = require("googleapis")
const { GoogleAuth } = require("google-auth-library")

const auth = new GoogleAuth({
	keyFile: "keys.json", //the key file
	//url to spreadsheets API
	scopes: "https://www.googleapis.com/auth/spreadsheets",
})

const startGoogle = async () => {
	const authClientObject = await auth.getClient()
	const googleSheetsInstance = google.sheets({
		version: "v4",
		auth: authClientObject,
	})

	const spreadsheetId = "1XxK_0arRVIOYiK1L4MyT9hODgO-sm8IjEfk8tgGW4QE"

	const readData = await googleSheetsInstance.spreadsheets.values.get({
		auth, //auth object
		spreadsheetId, // spreadsheet id
		range: "DataBase!B5:D25", //range of cells to read from.
	})

	console.log(readData.data)
}

startGoogle()
