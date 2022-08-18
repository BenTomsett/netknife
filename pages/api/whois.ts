import type {NextApiRequest, NextApiResponse} from 'next'
import util from 'node:util';
import psl from 'psl';

const exec = util.promisify(require('node:child_process').exec);

export interface IWHOISOutput {
	result: string;
	server: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<IWHOISOutput>) => {
	const domain = req.query.name as string;

	const parsedDomain = psl.parse(domain);
	if (parsedDomain.error) {
		console.log("invalid domain");
		return res.status(400).end();
	}

	const tld = parsedDomain.tld;
	const {stdout: tldOutput} = await exec(`whois -h whois.iana.org ${tld}`);
	const whoisMatches = (tldOutput as string).match(/(?<=whois:)(.*)(?=\n)/g);
	if (!whoisMatches) {
		console.log("can't find whois server");
		return res.status(400).end();
	}
	const whoisServer = whoisMatches[0].trim();

	const {stdout: whoisOutput} = await exec(`whois -h ${whoisServer} ${domain}`);

	res.status(200).send({
		result: whoisOutput,
		server: whoisServer,
	});
}

export default handler;
