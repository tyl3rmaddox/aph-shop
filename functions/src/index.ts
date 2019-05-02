import * as functions from 'firebase-functions';

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

import {dialogflow, SimpleResponse, BasicCard, Button, Image} from 'actions-on-google';

const app = dialogflow({ debug: true });


app.intent("Search Products", async (conv, params) => {
    const anyEntity = await params.any
    const data = await getProdSearchResults(anyEntity);

    conv.ask(new SimpleResponse({
        text: `${data.prodName[0]}, ${data.prodName[1]},  and ${data.prodName[2]}`,
        speech: `Our products listed with the search term ${anyEntity} are ${data.prodName[0]}, ${data.prodName[1]}, and ${data.prodName[2]}. Would you like to learn more?`
    }));
})
const prodSearchUrl1 = 'https://staging.aph.org/?s=';
const prodSearchUrl2 = '&engine=product_search';

async function getProdSearchResults(searchTerm:any) {
    const page = await fetch(`${prodSearchUrl1}${searchTerm}${prodSearchUrl2}`);
    const html = await page.text();
    const $ = cheerio.load(html);
    const prodName = new Array();
    const prodUrl = new Array();
    $('a.h6').each((i, elem) => {
        const element = $(elem);
        const text = element.text();
        prodName.push(text);
    })
    $('a.h6').each((i, elem) => {
        const element = $(elem);
        const url = element.attr('href');
        prodUrl.push(url);
    })
    return {
        prodName,
        prodUrl
    }
}


app.intent('Get Featured Product', async (conv) => {
    const data = await scrapeFeaturedProducts();
    conv.ask(new SimpleResponse({
        text: `Featured Products: Jupiter Portable Magnifier, ${data.title[0]}, ${data.title[1]}, and ${data.title[2]}`,
        speech: `The products currently featured at APH are Jupiter Portable Magnifier, ${data.title[0]}, ${data.title[1]}, and ${data.title[2]}. Say the name of a product to learn more.`
    }));
})

app.intent('Jupiter Portable Magnifier Info', async (conv) => {
    // const data = await scrapeHeroProduct();
    conv.close(new SimpleResponse({
        text: `Jupiter is a sleek, compact device that helps users of all ages who are visually impaired see the world in high definition.`,
        speech: `Jupiter is a sleek, compact device that helps users of all ages who are visually impaired see the world in high definition. Jupiter is very easy to use. Whether it's in the classroom, workplace, or at home - this powerful magnifier allows you to continue those activities that bring joy to everyday life. Call 1-800-223-1839 for ordering information.`
    }));
    conv.close(new BasicCard ({
        title: 'Jupiter Portable Magnifier',
        image: new Image({
            url: 'https://staging.aph.org/app/uploads/2019/02/APH-Shop-Pic-Home-Jupiter-Portable-Magnifier.jpg',
            alt: 'Jupiter Portable Magnifier'
        }),
        buttons: new Button({
            title: 'More Information',
            url: 'https://shop.aph.org/webapp/wcs/stores/servlet/ProductDisplay?catalogId=11051&langId=-1&productId=399670&storeId=10001&krypto=dEuYkPYOavBoZ2t5%2BFFVMvqFotBmbzxKNh6VsYgNaxpXIPazi6Vy076%2BGUPRznTpJfDBxcD6YYCHALFjhGFT7dCRpeBjzaYtoRYux1TQKkrksTc8871P4DlqjFVoEtjchf9iu5VPfS%2FVerZ02fgt0A%3D%3D&ddkey=http:ClickInfo'
        })
    }));
})

async function scrapeFeaturedProducts() {
    const page = await fetch('https://staging.aph.org/shop/');
    const html = await page.text();
    const $ = cheerio.load(html);

    const firstFeatured = $('#main > div > section:nth-child(2) > div.wrapper > div > div.glide__track > div > div:nth-child(1) > div > a').text();
    const secondFeatured = $('#main > div > section:nth-child(2) > div.wrapper > div > div.glide__track > div > div:nth-child(2) > div > a').text();
    const thirdFeatured = $('#main > div > section:nth-child(2) > div.wrapper > div > div.glide__track > div > div:nth-child(3) > div > a').text();
    const featuredTitles = [];
    featuredTitles.push(firstFeatured, secondFeatured, thirdFeatured);

    return {
        title: featuredTitles
        // description: firstDescription
    }
}

export const fulfillment = functions.https.onRequest(app);