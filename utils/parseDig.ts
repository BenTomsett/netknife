/**
	This parser was based on `jc` by Kelly Brazil.
	https://github.com/kellyjonbrazil/jc
*/

interface IHeader {
	headerId: string;
	opcode: string;
	status: string;
}

const parseHeader = (line: string): IHeader => {
	const tokens = line.split(/\s+/);

	const opcode = tokens[3].replace(',', '');
	const status = tokens[5].replace(',', '');
	const headerId = tokens[7];

	return {
		headerId,
		opcode,
		status,
	}
}

interface IFlag {
	flags: string[];
	queryNum: number;
	answerNum: number;
	authorityNum: number;
	additionalNum: number;
}

const parseFlagsLine = (line: string): IFlag => {
	const flagsline = line.split(';');

	const flags = flagsline[2].split(':')[1].trimStart()
		.split(/\s+/);

	const restLine = flagsline[3]
		.replace(',', ' ')
		.replace(':', ' ')
		.split(/\s+/);

	const queryNum = parseInt(restLine[2]);
	const answerNum = parseInt(restLine[4]);
	const authorityNum = parseInt(restLine[6]);
	const additionalNum = parseInt(restLine[8]);

	return {
		flags,
		queryNum,
		answerNum,
		authorityNum,
		additionalNum,
	}
}

interface IOptPsuedosection {
	edns?: {
		version: string;
		flags: string[];
		udp: string;
	};
	cookie?: string;
}

const parseOptPseudosection = (line: string): IOptPsuedosection | null => {
	if (line.startsWith('; EDNS:')) {
		const list = line.replace(',', ' ')
			.split(';');
		const first = list[1];
		const rest = list[2];

		const [, , , version, , ...flags] = first.split(/\s+/);

		const udp = rest.split(/\s+/).at(-1) || '';

		return {
			edns: {
				version,
				flags,
				udp,
			}
		}
	}
	if (line.startsWith('; COOKIE:')) {
		return {
			cookie: line.split(/\s+/)[2]
		}
	}
	return null;
}

interface IQuestion {
	name: string;
	type: string;
}

const parseQuestion = (line: string): IQuestion => {
	const tokens = line.split(/\s+/);
	const name = tokens[0].replace(';', '');
	const type = tokens[2];

	return {
		name,
		type,
	}
}

export interface IAnswer {
	name: string;
	ttl: string;
	type: string;
	data: string;
	priority?: number;
	ptr?: string;
	asn?: any;
}

const parseAnswer = (line: string): IAnswer => {
	const [name, ttl, , type, ...value] = line.split(/\s+/);

	let data = value.join(' ');

	if (data.startsWith('"') && data.endsWith('"')) {
		data = data.slice(1, -1);
	}

	if (type.toLowerCase() === 'mx') {
		const [priority, host] = data.split(' ');

		return {
			name,
			ttl,
			type,
			data: host,
			priority: parseInt(priority),
		}
	}

	return {
		name,
		ttl,
		type,
		data,
	}
}

interface IAxfr {
	name: string;
	ttl: number;
	type: string;
	data: string;
}

const parseAxfr = (line: string): IAxfr => {
	const tokens = line.split(/\s+/, 5);

	const name = tokens[0];
	const ttl = parseInt(tokens[1]);
	const type = tokens[3];
	const data = tokens[4];

	return {
		name,
		ttl,
		type,
		data,
	}
}

interface IFooter {
	queryTime?: string;
	server?: string;
	when?: string;
	rcvd?: string;
	size?: string;
}

const parseFooter = (line: string): IFooter | null => {
	if (line.startsWith(';; Query time:')) {
		return {
			queryTime: line.split(':')[1].trim(),
		}
	} else if (line.startsWith(';; SERVER:')) {
		return {
			server: line.split(':', 2)[1].trim(),
		}
	} else if (line.startsWith(';; WHEN:')) {
		return {
			when: line.split(': ', 2)[1].trim()
		}
	} else if (line.startsWith(';; MSG SIZE  rcvd:')) {
		return {
			rcvd: line.split(':')[1].trim()
		}
	} else if (line.startsWith(';; XFR size:')) {
		return {
			size: line.split(':')[1].trim()
		}
	}
	return null;
}

enum Section {
	HEADER,
	FLAGS,
	QUESTION,
	AUTHORITY,
	ANSWER,
	AXFR,
	ADDITIONAL,
	OPT_PSEUDOSECTION,
	FOOTER,
}

export interface IDigOutput {
	headerId: string;
	opcode: string;
	status: string;
	flags: string[];
	queryNum: number;
	answerNum: number;
	authorityNum: number;
	additionalNum: number;
	optPseudosection: IOptPsuedosection | null;
	question: IQuestion;
	answer: IAnswer[];
	queryTime: string;
	server: string;
	when: string;
	rcvd: string;
}

const parseDig = (data: string): IDigOutput => {

	const rawOutput = [];
	const lines = data.split(/\n/).filter((l) => l);

	let section: Section | undefined;

	let outputEntry: IDigOutput;
	let answerList: IAnswer[] = [];
	let axfrList: IAxfr[] = [];
	let authorityList: IAnswer[] = [];
	let additionalList: IAnswer[] = [];

	lines.forEach((line: string) => {
		if (line.startsWith(';; Got answer:')) {
			return;
		}

		if (line.startsWith('; <<>> ') && line.toLowerCase()
			.includes(' axfr ')) {
			section = Section.AXFR;
			axfrList = [];
			return;
		}

		if (line.startsWith(';; ->>HEADER<<-')) {
			section = Section.HEADER;
			if (outputEntry) {
				rawOutput.push(outputEntry)
			}
			outputEntry = {...outputEntry, ...parseHeader(line)};
		}

		if (line.startsWith(';; flags:')) {
			section = Section.FLAGS;
			outputEntry = {...outputEntry, ...parseFlagsLine(line)}
			return;
		}

		if (line.startsWith(';; OPT PSEUDOSECTION:')) {
			section = Section.OPT_PSEUDOSECTION;
			return;
		}

		if (line.startsWith(';; QUESTION SECTION:')) {
			section = Section.QUESTION;
			return;
		}

		if (line.startsWith(';; AUTHORITY SECTION:')) {
			section = Section.AUTHORITY;
			authorityList = [];
			return;
		}

		if (line.startsWith(';; ANSWER SECTION:')) {
			section = Section.ANSWER;
			answerList = [];
			return;
		}

		if (line.startsWith(';; ADDITIONAL SECTION:')) {
			section = Section.ADDITIONAL;
			additionalList = [];
			return;
		}

		if (line.startsWith(';; Query time:')) {
			section = Section.FOOTER;
			outputEntry = {...outputEntry, ...parseFooter(line)}
		}

		if (line.startsWith(';; QUERY SIZE:')) {
			outputEntry = {...outputEntry, ...{querySize: line.split(': ', 2)[2]}}
			return;
		}

		if (!line.startsWith(';') && section === Section.AXFR) {
			axfrList.push(parseAxfr(line));
			outputEntry = {...outputEntry, ...{axfr: axfrList}};
			return;
		}

		if (section === Section.OPT_PSEUDOSECTION) {
			outputEntry = {
				...outputEntry, ...{
					optPseudosection: parseOptPseudosection(line)
				}
			}
			return;
		}

		if (section === Section.QUESTION) {
			outputEntry = {...outputEntry, ...{question: parseQuestion(line)}}
			return;
		}

		if (!line.startsWith(';') && section === Section.AUTHORITY) {
			authorityList.push(parseAnswer(line));
			outputEntry = {...outputEntry, ...{authority: authorityList}};
			return;
		}

		if (!line.startsWith(';') && (section === Section.ANSWER || section === undefined)) {
			answerList.push(parseAnswer(line));
			outputEntry = {...outputEntry, ...{answer: answerList}}
			return;
		}

		if (!line.startsWith(';') && section === Section.ADDITIONAL) {
			additionalList.push(parseAnswer(line));
			outputEntry = {...outputEntry, ...{additional: additionalList}}
			return;
		}

		if (section === Section.FOOTER) {
			outputEntry = {...outputEntry, ...parseFooter(line)};
			return;
		}
	})

	// @ts-ignore
	return outputEntry;
}

export default parseDig;
