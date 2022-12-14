import type {NextApiRequest, NextApiResponse} from 'next'
import util from 'node:util';
import parseDig, {IDigOutput} from "../../utils/parseDig";
import psl from 'psl';

const exec = util.promisify(require('node:child_process').exec);

const getNameServer = async (domain: string) => {
	const {stdout} = await exec(`dig +short NS ${domain}`);
	const servers = stdout.split("\n");
	// remove blank items from array
	const filtered = servers.filter((x: string) => x !== "");
	return filtered[0];
}

const getPtrRecord = async (server: string, ip: string) => {
	const {stdout} = await exec(`dig @${server} -x ${ip}`)
	const parsed = parseDig(stdout);
	if (parsed.answer && parsed.answer.length >= 1) {
		return parsed.answer[0].data;
	}
}

const getAsn = async (ip: string) => {
	const ipv4Regex = /(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/;
	const ipv6Regex = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/;

	let asn = "";

	if (ipv4Regex.test(ip)) {
		const octets = ip.split(".");
		const reversed = octets.reverse();
		const joined = reversed.join(".");

		let {stdout: originAsn} = await exec(`dig +short ${joined}.origin.asn.cymru.com TXT`);
		originAsn = originAsn.replaceAll('"', "");
		asn = originAsn.split(" | ")[0];
	}
	if (ipv6Regex.test(ip)) {
		const padded = ip
			.replace(/::/, () => {
				const colons = Array.from(ip.matchAll(/:/g)).length;
				return ':' + Array((7 - colons) + 1)
					.join(':') + ':';
			})
			.split(':')
			.map(function (x) {
				return Array(4 - x.length)
					.fill('0')
					.join("") + x;
			})
			.join(':');
		const digits = padded.replaceAll(':', '');
		const reversed = digits.split('')
			.reverse()
			.join('.');

		let {stdout: originAsn} = await exec(`dig +short ${reversed}.origin6.asn.cymru.com TXT`);
		originAsn = originAsn.replaceAll('"', "");
		asn = originAsn.split(" | ")[0];
	}

	let {stdout: asnDesc} = await exec(`dig +short AS${asn}.asn.cymru.com TXT`);
	asnDesc = asnDesc.replaceAll('"', "");
	const [, country, registry, date, desc] = asnDesc.split(" | ");

	return {
		asn,
		country,
		registry,
		date,
		desc
	};
}

const handler = async (req: NextApiRequest, res: NextApiResponse<IDigOutput>) => {
	const domain = req.query.name as string;
	let server = req.query.server as string;

	if (!psl.isValid(domain)) {
		console.log("invalid domain");
		return res.status(400).end();
	}

	if (server === "authoritative") {
		const sld = psl.get(domain);
		if(!sld){
			return res.status(400).end();
		}
		server = await getNameServer(sld);
	}

	const {stdout} = await exec(`dig ${domain} -t ANY @${server}`);
	const parsed = parseDig(stdout);

	for (let i = 0; i < parsed.answer.length; i++) {
		if (parsed.answer[i].type === "A" || parsed.answer[i].type === "AAAA") {
			parsed.answer[i].ptr = await getPtrRecord(server, parsed.answer[i].data);
			parsed.answer[i].asn = await getAsn(parsed.answer[i].data);
		}
	}

	parsed.server = `${server}`;

	res.status(200)
		.json(parsed);
}

export default handler;
