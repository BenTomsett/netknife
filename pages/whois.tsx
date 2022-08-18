import ToolPage from "../components/ToolPage";
import {tools} from "./index";
import {
	Button,
	Group,
	LoadingOverlay,
	MantineProvider,
	Stack,
	TextInput, Title, Alert, Code, Text
} from "@mantine/core";
import {FormEvent, useState} from "react";
import {IWHOISOutput} from "./api/whois";

const WHOIS = () => {
	const [domain, setDomain] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [result, setResult] = useState<IWHOISOutput>();
	const [error, setError] = useState<boolean>(false);

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(false);
		setResult(undefined);
		fetch(`/api/whois?name=${domain}`).then((response) => {
			if (response.status === 200) {
				response.json().then((json) => {
					setResult(json);
				});
			} else {
				setError(true);
			}
		}).finally(() => {
			setLoading(false);
		})
	}

	return (
		<ToolPage {...tools.whois}>
			<MantineProvider theme={{
				primaryColor: tools.whois.color
			}}>
				<LoadingOverlay visible={loading} loaderProps={{ color: tools.whois.color }} />
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
						<Code block>
							{result.result}
						</Code>
					</Stack>
				)}

			</MantineProvider>
		</ToolPage>
	);
}

export default WHOIS;

