import ToolPage from "../components/ToolPage";
import {tools} from "./index";
import {
	Button,
	Group,
	LoadingOverlay,
	MantineProvider,
	Stack,
	TextInput, Title, Alert, Text
} from "@mantine/core";
import {FormEvent, useState} from "react";
import {IRedirectOutput} from "./api/redirect";

const Redirect = () => {
	const [url, setUrl] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [result, setResult] = useState<IRedirectOutput>();
	const [error, setError] = useState<boolean>(false);

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(false);
		setResult(undefined);
		fetch(`/api/redirect?url=${url}`).then((response) => {
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
		<ToolPage {...tools.redirect}>
			<MantineProvider theme={{
				primaryColor: tools.redirect.color
			}}>
				<LoadingOverlay visible={loading} loaderProps={{ color: tools.redirect.color }} />
				<form onSubmit={onSubmit}>
					<Stack my="md">
						<Group>
							<TextInput
								style={{flex: 1}}
								value={url}
								onChange={(event) => setUrl(event.currentTarget.value)}
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
						</Group>
						{result.redirects.map((r) => (
							<div key={r.url}>
								<Alert key={r.url} title={r.url} color={r.statusCode.toString().startsWith('3') ? 'orange' : 'green'}>
									<Text>Status: {r.statusCode}</Text>
									{r.statusCode === 301 && (
										<Text>Redirect to: {r.headers.location}</Text>
									)}
								</Alert>
							</div>
						))}
					</Stack>
				)}

			</MantineProvider>
		</ToolPage>
	);
}

export default Redirect;

