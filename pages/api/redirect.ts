import type {NextApiRequest, NextApiResponse} from 'next'
import {http, https, Redirect} from 'follow-redirects';

export interface IRedirectOutput {
	redirects: Redirect[];
}

const handler = async (req: NextApiRequest, res: NextApiResponse<IRedirectOutput>) => {
	const url = req.query.url as string;

	let redirects = [];

	if (url.startsWith("http:")) {
		http.get(url, {trackRedirects: true}, (response) => {
			redirects = response.redirects;
			console.log(redirects);
			res.status(200).json({
				redirects,
			})
		});
	} else if (url.startsWith("https:")) {
		https.get(url, {trackRedirects: true}, (response) => {
			redirects = response.redirects;
			console.log(redirects);
			res.status(200).json({
				redirects,
			})
		});
	} else {
		res.status(400).end();
	}
}

export default handler;
