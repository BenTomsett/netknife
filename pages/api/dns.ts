import type {NextApiRequest, NextApiResponse} from 'next'
import util from 'node:util';
import parseDig, {IDigOutput} from "../../utils/parseDig";
import psl from 'psl';
import isFQDN from 'validator/lib/isFQDN';
import NextCors from "nextjs-cors";
import {spawn} from "child_process";
import validator from "validator";
import isIP = validator.isIP;

const exec = util.promisify(require('node:child_process').exec);

const getNameServer = async (domain: string) => {
	const {stdout} = await exec(`dig +short NS ${domain}`);
	const servers = stdout.split("\n");
	// remove blank items from array
	const filtered = servers.filter((x: string) => x !== "");
	return filtered[0];
}

const getPtrRecord = async (ip: string) => {
	const {stdout} = await exec(`dig -x ${ip}`)
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

const handler = async (req: NextApiRequest, res: NextApiResponse<IDigOutput | any>) => {
	await NextCors(req, res, {
		// Options
		methods: ['GET'],
		origin: '*',
		optionsSuccessStatus: 200,
	});

	let domain = req.query.name as string;
	let server = req.query.server as string;

	console.log(domain);

	if (isFQDN(domain)) {
		if (server === "authoritative") {
			const sld = psl.get(domain);
			if(!sld){
				return res.status(400).end();
			}
			server = await getNameServer(sld);
		}

		let digOutput = '';
		const dig = await spawn('dig', [domain, '-t', 'ANY', `@${server}`]);

		dig.stdout.on('data', (d) => {digOutput += d});

		dig.on('close', async (code) => {
			if (code !== 0) {
				return res.status(500).end();
			}

			const parsed = parseDig(digOutput);

			for (let i = 0; i < parsed.answer.length; i++) {
				if (parsed.answer[i].type === "A" || parsed.answer[i].type === "AAAA") {
					parsed.answer[i].ptr = await getPtrRecord(parsed.answer[i].data);
					parsed.answer[i].asn = await getAsn(parsed.answer[i].data);
				}
			}

			parsed.server = `${server}`;

			return res.json(parsed);
		})
	} else if (isIP(domain)) {
		const ptr = await getPtrRecord(domain);
		const asn = await getAsn(domain);
		return res.json({
			ptr,
			asn,
		});
	} else {
		return res.status(400).end;
	}
}

export default handler;
