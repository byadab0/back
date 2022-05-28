"use strict";
const express = require("express");
const productsRouter = require("./Routers/productsRouter.js");

const spreadsheetId = '1eFAm4MLB6sqZ98Vu3ZZ0F1yKlD4i3fD3E11C0UyaVaE';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get("/", (req, res) => {
    res.send({ message: "ok" })
})

app.use("/api/products", productsRouter)


const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});


