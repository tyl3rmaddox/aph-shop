import * as functions from 'firebase-functions';

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

import {dialogflow, SimpleResponse, BasicCard, Button, Image} from 'actions-on-google';

const app = dialogflow({ debug: true });

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
            url: 'https://beta.aph.org/app/uploads/2019/02/APH-Shop-Pic-Home-Jupiter-Portable-Magnifier.jpg',
            alt: 'Jupiter Portable Magnifier'
        }),
        buttons: new Button({
            title: 'More Information',
            url: 'https://beta.aph.org/introducing-jupiter-portable-magnifier/'
        })
    }));
})

async function scrapeFeaturedProducts() {
    const page = await fetch('https://beta.aph.org/shop/');
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

// async function scrapeHeroProduct() {
//     const page = await fetch('https://beta.aph.org/introducing-jupiter-portable-magnifier/');
//     const html = await page.text();
//     const $ = cheerio.load(html);

//     const info = $('#main > section > div > div.content > p:nth-child(1)').text();

//     return {
//         info: info
//     }
// }

export const fulfillment = functions.https.onRequest(app);