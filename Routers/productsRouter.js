var express = require('express');
const { sheetAppend, UploadFile, sheetGet, sheetUpdate, sheetUpdateManyRows, sheetGetColumn, sheetAppendMany } = require('../sheet.js');
var router = express.Router();
const { dateAndTime, timeStamp } = require("../CommonFunctions.js")

const spreadsheetId = '113MbGAb1k8wGeSWw_jF5Bam9MOMhslYIQabOJLetIKo';


router.get('/search', async function (req, res) {

    let searchValue = req.query.search;
    console.log(searchValue)
    console.log(req.sheet)
    res.send({ products: req.sheet })
})


router.post('/addProduct', async function (req, res) {

    let reqData = req.body.headers;
    let productSheet = await sheetGet(spreadsheetId, "Product Sheet");
    tempHeaders = productSheet[0];

    let header = [], header2 = [], headerValue = [], headerValue2 = [], headerStructure = [], headerStructure2 = [], text = "";

    for (let i = 0; i < reqData.length; i++) {
        let oldIndex = tempHeaders.indexOf(reqData[i].headerName.old), newIndex = tempHeaders.indexOf(reqData[i].headerName.new);
        reqData[i].headerName.isNew = false;

        if (oldIndex !== -1 || newIndex !== -1) {
            index = newIndex !== -1 ? newIndex : oldIndex;

            if (reqData[i].headerType === "Image") {
                for (let j = 0; j < reqData[i].image.length; j++) {
                    if (reqData[i].image[j].imgLink) {
                        let link = await UploadFile(reqData[i].image[j].imgLink, reqData[i].image[j].name)
                        if (link.success) {
                            reqData[i].image[j].imgLink = "";
                            text += reqData[i].image[j].colour_code + "=" + link.success + "\n";
                        }
                    }
                }
            }

            header[index] = reqData[i].headerName.new;
            headerValue[index] = reqData[i].headerType === "Image" ? text.substring(0, text.length - 1) : reqData[i].headerValue.length > 1 ? JSON.stringify(reqData[i].headerValue) : reqData[i].headerValue[0].value;
            reqData[i].headerName.old = reqData[i].headerName.new;
            headerStructure[[index]] = JSON.stringify(reqData[i]);

        } else {
            header2.push(reqData[i].headerName.new);
            headerValue2.push(reqData[i].headerValue.length > 1 ? JSON.stringify(reqData[i].headerValue) : reqData[i].headerValue[0].value);
            reqData[i].headerName.old = reqData[i].headerName.new;
            headerStructure2.push(JSON.stringify(reqData[i]));
        }


    }

    for (let i = 0; i < header2.length; i++) {
        header.push(header2[i]);
        headerValue.push(headerValue2[i]);
        headerStructure.push(headerStructure2[i]);
    }

    for (let i = 0; i < header.length; i++) {
        console.log(header[i])
        if (!header[i]) {
            headerStructure[i] = "";
        }
    }

    headerValue[productSheet[0].indexOf("Product Code")] = timeStamp();

    await sheetUpdate(spreadsheetId, "Product Sheet!A1", header);
    await sheetUpdate(spreadsheetId, "Product Sheet!A2", headerStructure);

    let PriceData = req.body.PriceData;
    console.log(headerValue)

    for (let i = 0; i < PriceData.length; i++) {
        let temp = headerValue;
        temp[0] = dateAndTime().replace(" GMT", "")
        temp[productSheet[0].indexOf("Size")] = PriceData[i][0]
        if (PriceData[i][1]) temp[productSheet[0].indexOf("Height")] = PriceData[i][1]
        if (PriceData[i][2]) temp[productSheet[0].indexOf("GSM")] = PriceData[i][2]
        temp[productSheet[0].indexOf("Price")] = PriceData[i][3];
        temp[productSheet[0].indexOf("What is in the box ?")] = PriceData[i][4];
        temp[productSheet[0].indexOf("SKU Code")] = PriceData[i][5];
        temp[productSheet[0].indexOf("Packed Product Weight")] = PriceData[i][6];
        temp[productSheet[0].indexOf("Packed Product Length")] = PriceData[i][7];
        temp[productSheet[0].indexOf("Packed Product Width")] = PriceData[i][8];
        temp[productSheet[0].indexOf("Packed Product Height")] = PriceData[i][9];


        let price = parseInt(temp[productSheet[0].indexOf("Price")]),
            taxPrice = parseFloat(temp[productSheet[0].indexOf("Tax %")]) * parseInt(temp[productSheet[0].indexOf("Price")]) / 100,
            ShippingPrice = parseInt(temp[productSheet[0].indexOf("Shipping Charges")]),
            CustomDuty = parseFloat(temp[productSheet[0].indexOf("Custom Duty %")]) * parseInt(temp[productSheet[0].indexOf("Price")]) / 100;

        console.log(productSheet[0].indexOf("Final Price"))
        temp[productSheet[0].indexOf("Final Price")] = price + taxPrice + ShippingPrice + CustomDuty;

        await sheetAppend(spreadsheetId, `Product Sheet!A${productSheet.length + 1}`, temp);
    }

    res.send({ success: "Product added successfully!!" });
});


router.get('/dropdowns', async function (req, res) {
    let data = await sheetGet(spreadsheetId, "Dropdown");
    let tempHeaders = await sheetGet(spreadsheetId, "Product Sheet"), tempHeaders_2 = [];
    console.log(tempHeaders[1])
    for (let i = 0; tempHeaders && tempHeaders[1] && i < tempHeaders[1].length; i++) {
        if (tempHeaders[1][i] !== "" && tempHeaders[1][i] !== undefined) {
            tempHeaders_2.push(JSON.parse(tempHeaders[1][i]))

        }
    }

    res.send({ tempHeaders: tempHeaders_2, dropdownsHeaders: data[0], data: data })
});

module.exports = router;









































// router.post('/addTemp', async function (req, res) {
//     let reqData = req.body;
//     let productSheet = await sheetGet(spreadsheetId, "Product Sheet");
//     tempHeaders = productSheet[0];

//     let header = [], header2 = [], headerValue = [], headerValue2 = [], headerStructure = [], headerStructure2 = [], text = "";
//     for (let i = 0; i < reqData.length; i++) {
//         let oldIndex = tempHeaders.indexOf(reqData[i].headerName.old), newIndex = tempHeaders.indexOf(reqData[i].headerName.new);
//         reqData[i].headerName.isNew = false;

//         if (oldIndex !== -1 || newIndex !== -1) {
//             index = newIndex !== -1 ? newIndex : oldIndex;

//             if (reqData[i].headerType === "Image") {
//                 for (let j = 0; j < reqData[i].image.length; j++) {
//                     if (reqData[i].image[j].imgLink) {
//                         let link = await UploadFile(reqData[i].image[j].imgLink, reqData[i].image[j].name)
//                         if (link.success) {
//                             reqData[i].image[j].imgLink = "";
//                             text += reqData[i].image[j].colour_code + "=" + link.success + "\n";
//                         }
//                     }
//                 }
//             }

//             header[index] = reqData[i].headerName.new;
//             headerValue[index] = reqData[i].headerType === "Image" ? text.substring(0, text.length - 2) : reqData[i].headerValue.length > 1 ? JSON.stringify(reqData[i].headerValue) : reqData[i].headerValue[0].value;
//             reqData[i].headerName.old = reqData[i].headerName.new;
//             headerStructure[[index]] = JSON.stringify(reqData[i]);

//         } else {
//             header2.push(reqData[i].headerName.new);
//             headerValue2.push(reqData[i].headerValue.length > 1 ? JSON.stringify(reqData[i].headerValue) : reqData[i].headerValue[0].value);
//             reqData[i].headerName.old = reqData[i].headerName.new;
//             headerStructure2.push(JSON.stringify(reqData[i]));
//         }


//     }

//     for (let i = 0; i < header2.length; i++) {
//         header.push(header2[i]);
//         headerValue.push(headerValue2[i]);
//         headerStructure.push(headerStructure2[i]);
//     }

//     for (let i = 0; i < header.length; i++) {
//         console.log(header[i])
//         if (!header[i]) {
//             headerStructure[i] = "";
//         }
//     }



//     var finalData = [], dataToBeInserted = headerValue;

//     let productType = headerValue[tempHeaders.indexOf("Product Type")];
//     let dropdowns = await sheetGet(spreadsheetId, "Data Entry!I:L");

//     let dropdownData = {
//         size: [],
//         height: [],
//         gsm: [],
//         temp: headerValue
//     }
//     for (let i = 1; i < dropdowns.length; i++) {
//         if (dropdowns[i][dropdowns[0].indexOf("Product Type")] === productType) {
//             dropdowns[i][dropdowns[0].indexOf("Product Type") + 1] && dropdownData.size.push(dropdowns[i][dropdowns[0].indexOf("Product Type") + 1]);
//             dropdowns[i][dropdowns[0].indexOf("Product Type") + 2] && dropdownData.height.push(dropdowns[i][dropdowns[0].indexOf("Product Type") + 2]);
//             dropdowns[i][dropdowns[0].indexOf("Product Type") + 3] && dropdownData.gsm.push(dropdowns[i][dropdowns[0].indexOf("Product Type") + 3]);
//         }
//     }

//     console.log(dropdownData)

//     if (dropdownData.height.length > 0 || dropdownData.gsm.length > 0) {

//         for (let i = 0; i < dropdownData.size.length; i++) {
//             let temp = dataToBeInserted;
//             let length_1 = dropdownData.height.length > 0 ? dropdownData.height.length : dropdownData.gsm.length;
//             for (let j = 0; j < length_1; j++) {
//                 temp[tempHeaders.indexOf("Size")] = dropdownData.size[i];
//                 if (dropdownData.height.length > 0) {
//                     temp[tempHeaders.indexOf("Height")] = dropdownData.height[j]
//                 } else {
//                     temp[tempHeaders.indexOf("GSM")] = dropdownData.height[j]
//                 }

//                 finalData.push(temp);
//             }
//         }

//     } else {

//         for (let i = 0; i < dropdownData.size.length; i++) {
//             let temp = dropdownData.temp;
//             temp[tempHeaders.indexOf("Size")] = dropdownData.size[i];
//             finalData[i] = temp;
//         }
//     }

//     console.log(dropdownData)


//     await sheetUpdate(spreadsheetId, "Product Sheet!A1", header);
//     await sheetUpdate(spreadsheetId, "Product Sheet!A2", headerStructure);
//     await sheetAppendMany(spreadsheetId, `Product Sheet!A${productSheet.length}`, finalData);
//     res.send({ success: "Product added successfully!!" });
// });

// router.post('/update/hedaers', async function (req, res) {
//     let reqData = req.body.updatedHeaders;

//     let data = await sheetGet(spreadsheetId, "Dropdown");

//     const index = data[0].indexOf(reqData.dropdownName ? reqData.dropdownName : reqData.headerValue[0].whichDropdown);
//     if (reqData.dropdownValue)
//         if (index !== -1) {
//             let length = data.length > reqData.dropdownValue.length ? data.length : reqData.dropdownValue.length;

//             for (let i = 1; i < length; i++) {
//                 if (i < data.length) {
//                     data[i][index] = reqData.dropdownValue[i - 1];
//                 } else {
//                     let temp = [];
//                     temp[index] = reqData.dropdownValue[i]
//                     data.push(temp)
//                 }
//             }
//             await sheetUpdateManyRows(spreadsheetId, "Dropdown!A1", data);
//         } else {
//             let length = data.length > reqData.dropdownValue.length ? data.length : reqData.dropdownValue.length;
//             console.log(length)
//             for (let i = 0; i < length; i++) {

//                 if (i === 0)
//                     data[i][data[0].length] = reqData.dropdownName;
//                 else if (i < data.length)
//                     data[i][data[0].length - 1] = reqData.dropdownValue[i];
//                 else {
//                     let temp = [""];
//                     temp[data[0].length - 1] = reqData.dropdownValue[i];
//                     console.log(temp)
//                     data.push(temp)
//                 }
//             }

//             console.log(data)
//             await sheetUpdateManyRows(spreadsheetId, "Dropdown!A1", data);
//         }

//     res.send({ success: "Product added successfully!!" });
// });

// router.post('/add', async function (req, res) {
//     let reqData = req.body;
//     for (let i = 0; i < reqData.images.length; i++) {
//         let link = await UploadFile(reqData.images[i].imgLink, reqData.images[i].name)
//         if (link.success)
//             reqData.images[i].imgLink = link.success
//     }
//     let data = [dateAndTime(), timeStamp(), reqData.hsn, reqData.p_name, "", reqData.content, reqData.stock, reqData.category, reqData.sub_category, reqData.futher_category, reqData.country, reqData.size, reqData.gsm, JSON.stringify(reqData.images), reqData.price];
//     await sheetAppend(spreadsheetId, "Product Sheet!A2:O", data)
//     res.send({ success: "Product added successfully!!" });
// });
