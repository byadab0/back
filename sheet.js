const { GoogleAuth } = require('google-auth-library');
const { google } = require("googleapis");

const spreadsheetId = '113MbGAb1k8wGeSWw_jF5Bam9MOMhslYIQabOJLetIKo';
var googlesheet;

const auth = new GoogleAuth({
    keyFile: "byadabCredentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
})

async function authenticate() {
    const client = await auth.getClient();
    googlesheet = google.sheets({ version: "v4", auth: client });
}
module.exports.authenticate = authenticate;

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





async function getSheetData() {
    await authenticate();
    let productSheet = await sheetGet(spreadsheetId, "Product Sheet");
    // sheet.productSheet = await sheetGet(spreadsheetId, "Product Sheet");

    let header = productSheet[0], products = [], tempProductCodes = [];

    for (let i = 2; i < productSheet.length - 1; i++) {

        if (productSheet[i][header.indexOf("Product Code")] === productSheet[i + 1][header.indexOf("Product Code")] && !tempProductCodes.includes(productSheet[i][header.indexOf("Product Code")])) {
            let tempProduct = {
                Product_Code: productSheet[i][header.indexOf("Product Code")],
                Country: productSheet[i][header.indexOf("Country")],
                Our_Brands: productSheet[i][header.indexOf("Our Brands")],
                Group_Products: productSheet[i][header.indexOf("Group Products")],
                Category: productSheet[i][header.indexOf("Category")],
                Sub_Category: productSheet[i][header.indexOf("Sub Category")],
                Product_Type: productSheet[i][header.indexOf("Product Type")],
                Tax: productSheet[i][header.indexOf("Tax %")],
                Shipping_Charges: productSheet[i][header.indexOf("Shipping Charges")],
                Custom_Duty: productSheet[i][header.indexOf("Custom Duty %")],
                Style: productSheet[i][header.indexOf("Style")],
                Weave: productSheet[i][header.indexOf("Weave")],
                Threads: productSheet[i][header.indexOf("Threads/ Sq")],
                Material: productSheet[i][header.indexOf("Material")],
                What_is_in_the_box: productSheet[i][header.indexOf("What is in the box ?")],
                Product_Details: productSheet[i][header.indexOf("Product Details")],
                Design_Story: productSheet[i][header.indexOf("Design Story")],
                Why_Us: productSheet[i][header.indexOf("Why Us ?")],
                Care: productSheet[i][header.indexOf("Care")],
                Shipping: productSheet[i][header.indexOf("Shipping")],
                Reviews: productSheet[i][header.indexOf("Reviews")],
                Packed_Product_Weight: productSheet[i][header.indexOf("Packed Product Weight")],
                Packed_Product_Length: productSheet[i][header.indexOf("Packed Product Length")],
                Packed_Product_Width: productSheet[i][header.indexOf("Packed Product Width")],
                Packed_Product_Height: productSheet[i][header.indexOf("Packed Product Height")]
            }


            let tempImages = productSheet[i][header.indexOf("Images")].split("\n"), Images = [];

            for (let j = 0; j < tempImages.length; j++)
                if (tempImages[j]) {
                    let temp = tempImages[j].replace(/ /gi, "").split("=http")
                    Images.push({
                        color: temp[0],
                        link: "http" + temp[1]
                    })
                }

            tempProduct.Images = Images;

            let variations = [], Size = [], Height = [], GSM = [], Price = [],
                Final_Price = [], Stock = [], Pre_Order_Stock = [], Visibility = [];

            for (let j = 2; j < productSheet.length; j++) {
                if (productSheet[i][header.indexOf("Product Code")] === productSheet[j][header.indexOf("Product Code")]) {

                    Size.push(parseInt(productSheet[j][header.indexOf("Size")]))
                    Height.push(parseInt(productSheet[j][header.indexOf("Height")]))
                    GSM.push(parseInt(productSheet[j][header.indexOf("GSM")]))
                    Price.push(parseInt(productSheet[j][header.indexOf("Price")]))
                    Final_Price.push(parseInt(productSheet[j][header.indexOf("Final Price")]))
                    Stock.push(parseInt(productSheet[j][header.indexOf("Stock")]))
                    Pre_Order_Stock.push(parseInt(productSheet[j][header.indexOf("Pre Order Stock")]))
                    Visibility.push(productSheet[j][header.indexOf("Visibility")])

                    variations.push({
                        Size: parseInt( productSheet[j][header.indexOf("Size")]),
                        Height: parseInt( productSheet[j][header.indexOf("Height")]),
                        GSM: parseInt( productSheet[j][header.indexOf("GSM")]),
                        Price: parseInt( productSheet[j][header.indexOf("Price")]),
                        Final_Price: parseInt( productSheet[j][header.indexOf("Final Price")]),
                        Stock: parseInt( productSheet[j][header.indexOf("Stock")]),
                        Pre_Order_Stock: parseInt( productSheet[j][header.indexOf("Pre Order Stock")]),
                        Visibility: productSheet[j][header.indexOf("Visibility")],
                    })
                }
            }

            tempProduct.Size = Size;
            tempProduct.Height = Height;
            tempProduct.GSM = GSM;
            tempProduct.Price = Price;
            tempProduct.Final_Price = Final_Price;
            tempProduct.Stock = Stock;
            tempProduct.Pre_Order_Stock = Pre_Order_Stock;
            tempProduct.Visibility = Visibility;
            tempProduct.variations = variations;

            tempProductCodes.push(productSheet[i][header.indexOf("Product Code")])
            products.push(tempProduct);
        }

    }

    return { products }

}

module.exports.getSheetData = getSheetData;