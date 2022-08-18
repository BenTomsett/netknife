import ToolPage from "../components/ToolPage";
import {tools} from "./index";
import {
	Text,
	Button,
	Group,
	LoadingOverlay,
	MantineProvider,
	Select,
	Stack,
	TextInput, Title, Table, Tooltip, Alert
} from "@mantine/core";
import {FormEvent, useState} from "react";
import {IAnswer, IDigOutput} from "../utils/parseDig";
import {QuestionCircle16Regular} from "@fluentui/react-icons";

const queryServers = [
	{ value: 'authoritative', label: 'Authoritative name server' },
	{ value: '8.8.8.8', label: 'Google (8.8.8.8)' },
];

const DNS = () => {
	const [domain, setDomain] = useState<string>("");
	const [server, setServer] = useState<string>("authoritative");
	const [loading, setLoading] = useState<boolean>(false);

	const [result, setResult] = useState<IDigOutput>();

	const [error, setError] = useState<boolean>(false);

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(false);
		setResult(undefined);
		fetch(`/api/dns?name=${domain}&server=${server}`).then((response) => {
			if (response.status === 200) {
				response.json().then((json) => {
					console.log(json);
					setResult(json);
				});
			} else {
				setError(true);
			}
		}).finally(() => {
			setLoading(false);
		})
	}

	const renderARecord = (records: IAnswer[]) => {
		return (
			<Stack spacing={0}>
				<Title order={5}>A records</Title>
				{records.length === 0 ? (
					<Alert color="red">
						No A records found
					</Alert>
				) : (
					<Table
						striped
						highlightOnHover
					>
						<thead>
						<tr>
							<th>Name</th>
							<th>Points to</th>
							<th>
								<Group spacing="xs">
									<Text>TTL</Text>
									<Tooltip
										label="When you query a server that is not authoritative for this domain, this column may show remaining seconds on the TTL counter at that DNS server"
										position="top-end"
										withArrow
										multiline
										width={300}
									>
										<span style={{display: 'flex', alignContent: 'center'}}>
											<QuestionCircle16Regular />
										</span>
									</Tooltip>
								</Group>
							</th>
						</tr>
						</thead>
						<tbody>
						{records.map((record) => (
							<tr key={record.name + record.data} style={{verticalAlign: 'top'}}>
								<td style={{fontWeight: 'bold'}}>{record.name}</td>
								<td>
									<Text>{record.data}</Text>
									{record.ptr && <Text color="dimmed">PTR: {record.ptr}</Text>}
									{record.asn && <Text color="dimmed">ASN: {record.asn.desc}</Text>}
								</td>
								<td>{record.ttl}</td>

							</tr>
						))}
						</tbody>
					</Table>
				)}
			</Stack>
		)
	}

	const renderAAAARecord = (records: IAnswer[]) => {
		return (
			<Stack spacing={0}>
				<Title order={5}>AAAA records</Title>
				{records.length === 0 ? (
					<Alert color="red">
						No AAAA records found
					</Alert>
				) : (
					<Table
						striped
						highlightOnHover
					>
						<thead>
						<tr>
							<th>Name</th>
							<th>Points to</th>
							<th>
								<Group spacing="xs">
									<Text>TTL</Text>
									<Tooltip
										label="When you query a server that is not authoritative for this domain, this column shows the remaining seconds on the TTL counter at that DNS server"
										position="top-end"
										withArrow
										multiline
										width={300}
									>
										<span>
											<QuestionCircle16Regular />
										</span>
									</Tooltip>
								</Group>
							</th>
						</tr>
						</thead>
						<tbody>
						{records.map((record) => (
							<tr key={record.name + record.data} style={{verticalAlign: 'top'}}>
								<td style={{fontWeight: 'bold'}}>{record.name}</td>
								<td>
									<Text>{record.data}</Text>
									{record.ptr && <Text color="dimmed">PTR: {record.ptr}</Text>}
									{record.asn && <Text color="dimmed">ASN: {record.asn.desc}</Text>}
								</td>
								<td>{record.ttl}</td>

							</tr>
						))}
						</tbody>
					</Table>
				)}
			</Stack>
		)
	}

	const renderMXRecord = (records: IAnswer[]) => {
		return (
			<Stack spacing={0}>
				<Title order={5}>MX records</Title>
				{records.length === 0 ? (
					<Alert color="red">
						No MX records found
					</Alert>
				) : (
					<Table
						striped
						highlightOnHover
					>
						<thead>
						<tr>
							<th>Name</th>
							<th>Priority</th>
						</tr>
						</thead>
						<tbody>
						{records.map((record) => (
							<tr key={record.name + record.data} style={{verticalAlign: 'top'}}>
								<td style={{fontWeight: 'bold'}}>{record.data}</td>
								<td>{record.priority}</td>

							</tr>
						))}
						</tbody>
					</Table>
				)}
			</Stack>
		)
	}

	const renderNSRecord = (records: IAnswer[]) => {
		return (
			<Stack spacing={0}>
				<Title order={5}>NS records</Title>
				{records.length === 0 ? (
					<Alert color="red">
						No NS records found
					</Alert>
				) : (
					<Table
						striped
						highlightOnHover
					>
						<thead>
						<tr>
							<th>Name</th>
							<th>Points to</th>
						</tr>
						</thead>
						<tbody>
						{records.map((record) => (
							<tr key={record.name + record.data} style={{verticalAlign: 'top'}}>
								<td style={{fontWeight: 'bold'}}>{record.name}</td>
								<td>{record.data}</td>
							</tr>
						))}
						</tbody>
					</Table>
				)}
			</Stack>
		)
	}

	const renderTXTRecord = (records: IAnswer[]) => {
		return (
			<Stack spacing={0}>
				<Title order={5}>TXT records</Title>
				{records.length === 0 ? (
					<Alert color="red">
						No TXT records found
					</Alert>
				) : (
					<Table
						striped
						highlightOnHover
					>
						<thead>
						<tr>
							<th>Value</th>
						</tr>
						</thead>
						<tbody>
						{records.map((record) => (
							<tr key={record.name + record.data} style={{verticalAlign: 'top'}}>
								<td>{record.data}</td>
							</tr>
						))}
						</tbody>
					</Table>
				)}
			</Stack>
		)
	}

	return (
		<ToolPage {...tools.dns}>
			<MantineProvider theme={{
				primaryColor: tools.dns.color
			}}>
				<LoadingOverlay visible={loading} loaderProps={{ color: 'cyan' }} />
				<form onSubmit={onSubmit}>
					<Stack my="md">
						<Group>
							<TextInput
								style={{flex: 1}}
								value={domain}
								onChange={(event) => setDomain(event.currentTarget.value)}
								placeholder="Domain name"
								disabled={loading}
							/>
							<Button type="submit">Query</Button>
						</Group>
						<Group grow>
							<Select
								label="DNS server to query"
								value={server}
								onChange={(value) => setServer(value!)}
								data={queryServers}
							/>
						</Group>
					</Stack>
				</form>
				{(error) && (
					<Alert color="red" title="Something went wrong.">
						Check you entered a valid domain. If you are still having problems, send feedback here.
					</Alert>
				)}
				{(result) && (
					<Stack mt="xl" spacing="xl">
						<Group align="end">
							<Title order={3}>Results</Title>
							<Text color="dimmed">Reported by {result.server}</Text>
						</Group>
						{renderARecord(result.answer.filter((record) => record.type === "A"))}
						{renderAAAARecord(result.answer.filter((record) => record.type === "AAAA"))}
						{renderMXRecord(result.answer.filter((record) => record.type === "MX"))}
						{renderNSRecord(result.answer.filter((record) => record.type === "NS"))}
						{renderTXTRecord(result.answer.filter((record) => record.type === "TXT"))}
					</Stack>
				)}

			</MantineProvider>
		</ToolPage>
	);
}

export default DNS;

