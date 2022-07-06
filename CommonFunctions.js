const CC = require('currency-converter-lt');
const { sheetGet } = require('./sheet');
let currencyConverter = new CC()

const spreadsheetId = '113MbGAb1k8wGeSWw_jF5Bam9MOMhslYIQabOJLetIKo';

async function homePageDataBuilder(products) {

    let data = await sheetGet(spreadsheetId, "Home Page Data Entry");

    let header = data[0];

    data = data.slice(1, data.length)

    let headerTop = [], heroImages = [], Collection_Text = [], Cutomize_Four_Images = [],
        Testimonials_Four_Images = [], Press_And_Awards = [],

        Why_By_Adab = {
            Image_Link: data[0][header.indexOf("Why By Adab")],
            Heading: data[1][header.indexOf("Why By Adab")],
            Sub_heading: data[2][header.indexOf("Why By Adab")],
            Text: data[3][header.indexOf("Why By Adab")],
            End_text: data[4][header.indexOf("Why By Adab")]
        };

    data.forEach(x => {
        x[header.indexOf("HomePage TopSlider Text")] && headerTop.push(x[header.indexOf("HomePage TopSlider Text")]);
        x[header.indexOf("Hero Section Images")] && heroImages.push(x[header.indexOf("Hero Section Images")]);

        x[header.indexOf("Our Brands")] && Collection_Text.push({
            Our_Brands: x[header.indexOf("Our Brands")],
            Coloured_Text: x[header.indexOf("Coloured Text")],
            Uncoloured_Text: x[header.indexOf("Uncoloured Text")]
        })

        x[header.indexOf("Customize Four Images")] && Cutomize_Four_Images.push({
            link: x[header.indexOf("Customize Four Images")],
            Text: x[header.indexOf("Customize Four Images Text")]
        })

        x[header.indexOf("Testimonials Four Images")] && Testimonials_Four_Images.push({
            link: x[header.indexOf("Testimonials Four Images")],
            Text: x[header.indexOf("Testimonials Four Images Text")]
        })

        x[header.indexOf("Press And Awards")] && Press_And_Awards.push(x[header.indexOf("Press And Awards")])

    })


    let Our_Brands = []; tempOurBrands = []; Best_Sellers = []
    products.forEach(x => {
        if (!tempOurBrands.includes(x.Our_Brands) && x.Product_Code) {
            tempOurBrands.push(x.Our_Brands);
            Our_Brands.push(x)
        }


        if (x.Best_Sellers && x.Best_Sellers.toLowerCase() === "yes") {
            Best_Sellers.push(x)
        }
    })


    console.log("done")
    return { headerTop, heroImages, Our_Brands, Best_Sellers, Why_By_Adab, Cutomize_Four_Images, Collection_Text, Press_And_Awards, Testimonials_Four_Images };
}

module.exports.homePageDataBuilder = homePageDataBuilder;



async function allCollectionsDataBuilder(products) {

    let collections = [], tempCollections = [], collectionProducts = [];

    products.map(x => {

        if (!tempCollections.includes(x.Our_Brands)) {
            collections.push(x);
            tempCollections.push(x.Our_Brands);

            let tempProducts = [], tempProductsName = [];

            for (let i = 0; i < products.length; i++) {
                if (!tempProductsName.includes(products[i].Group_Products) && x.Our_Brands === products[i].Our_Brands) {
                    tempProducts.push(products[i]);
                    tempProductsName.push(products[i].Group_Products);
                }

                if (tempProducts.length === 8)
                    break;
            }

            collectionProducts.push(tempProducts);

        }

    })

    return { collections, collectionProducts }
}

module.exports.allCollectionsDataBuilder = allCollectionsDataBuilder;


async function particularCollectionsDataBuilder(products) {

    let tempCollections = [], Products = [];

    products.map(x => {

        if (!tempCollections.includes(x.Our_Brands)) {
            tempCollections.push(x.Our_Brands);

            let tempProducts = [], tempProductsName = [];

            for (let i = 0; i < products.length; i++) {
                if (!tempProductsName.includes(products[i].Group_Products) && x.Our_Brands === products[i].Our_Brands) {
                    tempProducts.push(products[i]);
                    tempProductsName.push(products[i].Group_Products);
                }
            }

            Products.push({ collectionName: x.Our_Brands, collectionProducts: tempProducts });

        }

    })

    return { Products }
}

module.exports.particularCollectionsDataBuilder = particularCollectionsDataBuilder;






const dateAndTime = () => {
    let d = new Date();
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const now = new Date(utc + (60 * 60 * 1000 * 5.5));
    const date = now.toGMTString();
    return date.replace(" GMT", "");
}

module.exports.dateAndTime = dateAndTime;

const timeStamp = () => {
    let d = new Date();
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const now = new Date(utc + (60 * 60 * 1000 * 5.5));
    return now.getTime();
}
module.exports.timeStamp = timeStamp;


const currencyCalculator = (to, amount) => {
    currencyConverter.from("INR").to(to).amount(amount).convert().then((response) => {
        return parseFloat(response) //or do something else
    })
}
module.exports.currencyCalculator = currencyCalculator;
