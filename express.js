"use strict";
const express = require("express");
const productsRouter = require("./Routers/productsRouter.js");
const { getSheetData } = require("./sheet.js");

const spreadsheetId = '113MbGAb1k8wGeSWw_jF5Bam9MOMhslYIQabOJLetIKo';

const app = express();
let sheet = {};

async function getSheet() {
    sheet = await getSheetData();
}
getSheet();


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(async function getData(req, res, next) {
    req.sheet = sheet;
    next();
})

app.get("/", (req, res) => {
    res.send({ message: "ok" })
})



app.use("/api/products", productsRouter)


const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});


