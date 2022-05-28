const { GoogleAuth } = require('google-auth-library');
const { google } = require("googleapis");

// const spreadsheetId = '1eFAm4MLB6sqZ98Vu3ZZ0F1yKlD4i3fD3E11C0UyaVaE';
var googlesheet;

const auth = new GoogleAuth({
    keyFile: "byadabCredentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
})

async function authenticate() {
    const client = await auth.getClient();
    googlesheet = google.sheets({ version: "v4", auth: client });
}
authenticate();

async function sheetGet(spreadsheetId, range) {
    let rows = await googlesheet.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: range
    })
    return rows.data.values;
}

async function sheetUpdate(spreadsheetId, range, data) {
    let row = await googlesheet.spreadsheets.values.update({
        auth,
        spreadsheetId,
        range: range,
        valueInputOption: "USER_ENTERED",
        resource: { values: [data] }
    })
    return JSON.parse(row.config.body).values[0];
}

async function sheetAppend(spreadsheetId, range, data) {
    let row = await googlesheet.spreadsheets.values.append({
        spreadsheetId,
        range: range,
        valueInputOption: "USER_ENTERED",
        resource: { values: [data] }
    })
    return row;
}

async function sheetAppendMany(spreadsheetId, range, data) {
    let row = await googlesheet.spreadsheets.values.append({
        spreadsheetId,
        range: range,
        valueInputOption: "USER_ENTERED",
        resource: { values: data }
    })
    return row;
}

async function sheetGetColumn(spreadsheetId, range) {
    let rows = await googlesheet.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: range,
        majorDimension: "COLUMNS"
    })
    return rows.data.values;
}

async function sheetUpdateManyRows(spreadsheetId, range, data) {
    let rows = await googlesheet.spreadsheets.values.update({
        auth,
        spreadsheetId,
        range: range,
        // majorDimension: "COLUMNS",
        valueInputOption: "USER_ENTERED",
        resource: { values: data }
    })
    return rows.data.values;
}


module.exports.sheetGet = sheetGet;
module.exports.sheetUpdate = sheetUpdate;
module.exports.sheetAppend = sheetAppend;
module.exports.sheetGetColumn = sheetGetColumn;
module.exports.sheetUpdateManyRows = sheetUpdateManyRows;
module.exports.sheetAppendMany = sheetAppendMany;



async function UploadFile(imageSrc, name) {

    const auth = new google.auth.GoogleAuth({
        keyFile: 'byadabCredentials.json',
        scopes: ['https://www.googleapis.com/auth/drive']
    })

    const client = await auth.getClient();
    var Readable = require('stream').Readable;

    let imgSrc = imageSrc.split(",")[1];
    let buffer = Buffer.from(imgSrc, 'base64');
    function bufferToStream(buffer) {
        var stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        return stream;
    }

    const drive = google.drive({ version: 'v3', auth: client });
    var fileMetadata = {
        'name': name ? name + ".jpeg" : dateAndTime() + ".jpeg",
        "parents": ["18XEJdoV9xaI3STYwkGodjgWaktsXsN84"]
    };
    var media = {
        mimeType: 'image/jpeg',

        body: bufferToStream(buffer)
    };

    let response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    });

    switch (response.status) {
        case 200:
            let link = 'https://drive.google.com/uc?export=view&id=' + response.data.id
            console.log(link);
            return { success: link }
        default:
            console.error('Error creating the file, ' + response.errors);
            break;
    }
    return { error: "Image not saved!!" }
}
module.exports.UploadFile = UploadFile