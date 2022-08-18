import ResourceRecordType from "./ResourceRecordTypes";

export enum DNSQueryResponseStatus {
	NoError = 0,
	FormErr = 1,
	ServFail = 2,
	NXDomain = 3,
	NotImp = 4,
	Refused = 5,
	YXDomain = 6,
	YXRRSet = 7,
	NXRRSet = 8,
	NotAuth = 9,
	NotZone = 10,
	DSOTYPENI = 11,
	BADVERS = 16,
	BADSIG = 16,
	BADKEY = 17,
	BADTIME = 18,
	BADMODE = 19,
	BADNAME = 20,
	BADALG = 21,
	BADTRUNC = 22,
	BADCOOKIE = 23,
}

export interface DNSQuestion {
	name: string;
	type: ResourceRecordType;
}

export interface DNSResourceRecord {
	name: string;
	type: ResourceRecordType;
	ttl: number;
	data: string;
}

export interface DNSQueryResponse {
	Status: number;
	TC: boolean;
	RD: boolean;
	RA: boolean;
	AD: boolean;
	CD: boolean;
	Question: DNSQuestion[];
	Answer: DNSResourceRecord[];
}
