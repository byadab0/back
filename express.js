"use strict";
const express = require("express");
const { homePageDataBuilder, allCollectionsDataBuilder, particularCollectionsDataBuilder } = require("./CommonFunctions.js");
const productsRouter = require("./Routers/productsRouter.js");
const { getSheetData } = require("./sheet.js");


const app = express();
let sheet = {}, HomePageData = {}, allCollectionsData = {}, particularCollectionData = [];

async function getSheet() {
    sheet = await getSheetData();
    HomePageData = await homePageDataBuilder(sheet.products);
    allCollectionsData = await allCollectionsDataBuilder(sheet.products);
    particularCollectionData = await particularCollectionsDataBuilder(sheet.products)
}
getSheet();


app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

app.use(async function getData(req, res, next) {
    req.sheet = sheet;
    req.HomePageData = HomePageData;
    req.allCollectionsData = allCollectionsData;
    req.particularCollectionData = particularCollectionData;
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


