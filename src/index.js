import express from 'express';
import axios from 'axios';
import { gotScraping } from 'got-scraping';

const app = express();
const port = process.env.PORT || 3000;


// Scraping
// ---------------------------------------------------------------------------

/**
 * @param string url
 * @return object
 */
async function scrape(url) {
	const { body } = await gotScraping({ url });

	const placenames = body.match(/geo\.placename' content='(?<address>[^']+)'/).groups;
	const placename = placenames.address;

	const prices = body.match(/priced at \$(?<price>[\d\,]+)/).groups;
	const price = prices.price;

	const hasDishwasher = !!body.match(/"dishwasher"/gmi);
	const hasDogs = !!body.match(/"dogs"/gmi);
	const hasFios = !!body.match(/"fios_available"/gmi);

	return {
		hasDishwasher,
		hasDogs,
		hasFios,
		placename, price
	}
}


// Routes
// ---------------------------------------------------------------------------

app.get('/', async (req, res) => {
	try {
		const url = new URL(req.query.url);
		// const url = 'https://streeteasy.com/building/180-montague/18e';
		const content = await scrape(url);

		console.log(content);

		const csv = `"${content.price}","${content.placename}","${content.hasDishwasher}","${content.hasDogs}","${content.hasFios}"`

		res.send(csv);
	}
	catch (e) {
		res.send(e);
	}
});


// Initialize
// ---------------------------------------------------------------------------

app.listen(port);

console.log(`
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ Listening on http://localhost:3000                                      │
  └─────────────────────────────────────────────────────────────────────────┘
`);