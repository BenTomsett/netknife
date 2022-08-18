import {
	Container,
	SimpleGrid,
	Title,
	Text
} from "@mantine/core";
import {
	ArrowForward24Regular,
	Certificate24Regular,
	GlobePerson24Regular, Password24Regular,
	Search24Regular
} from "@fluentui/react-icons";
import ToolLink, {ITool} from "../components/ToolLink";

export const tools: { [key: string]: ITool } = {
	dns: {
		value: "dns",
		icon: <Search24Regular />,
		color: "cyan",
		title: "DNS lookup",
		description: "Look up a domain's DNS records"
	},
	whois: {
		value: "whois",
		icon: <GlobePerson24Regular />,
		color: "orange",
		title: "WHOIS lookup",
		description: "Look up a domain's WHOIS records"
	},
	ssl: {
		value: "ssl",
		icon: <Certificate24Regular />,
		color: "green",
		tooltip: "Powered by Qualys",
		title: "SSL report",
		description: "Validate a server's SSL certificate"
	},
	redirect: {
		value: "redirect",
		icon: <ArrowForward24Regular />,
		color: "red",
		title: "Redirect checker",
		description: "Follow a URL's HTTP redirects"
	},
	pw: {
		value: "pw",
		icon: <Password24Regular />,
		color: "violet",
		tooltip: "Powered by pwpush.com",
		title: "Password pusher",
		description: "Generate and share password"
	}
}

export default function IndexPage() {
	return (
		<Container my="xl" size="md">
			<Title>
				Net
				<Text component="span" color="red">Knife</Text>
			</Title>
			<Title order={3} style={{fontWeight: 500}}>Swiss Army knife of network-related tools</Title>

			<SimpleGrid my="xl" cols={3}>
				{
					Object.values(tools).map((tool) => (
						<ToolLink
							key={tool.value}
							{...tool}
						/>
					))
				}
			</SimpleGrid>
		</Container>
	);
}
