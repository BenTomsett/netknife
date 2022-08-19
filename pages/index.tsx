import {
	SimpleGrid
} from "@mantine/core";
import {
	ArrowForward24Regular,
	GlobePerson24Regular,
	Search24Regular
} from "@fluentui/react-icons";
import ToolLink, {ITool} from "../components/ToolLink";
import {useContext, useEffect} from "react";
import {ColorContext} from "../components/ColorContext";

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
	redirect: {
		value: "redirect",
		icon: <ArrowForward24Regular />,
		color: "yellow",
		title: "Redirect checker",
		description: "Follow a URL's HTTP redirects"
	},
	/* ssl: {
		value: "ssl",
		icon: <Certificate24Regular />,
		color: "green",
		tooltip: "Powered by Qualys",
		title: "SSL report",
		description: "Validate a server's SSL certificate"
	},
	pw: {
		value: "pw",
		icon: <Password24Regular />,
		color: "violet",
		tooltip: "Powered by pwpush.com",
		title: "Password pusher",
		description: "Generate and share password"
	} */
}

export default function IndexPage() {
	const {changeColor} = useContext(ColorContext);

	useEffect(() => {
		changeColor('red');
	}, [changeColor])

	return (
		<>
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
		</>
	);
}
