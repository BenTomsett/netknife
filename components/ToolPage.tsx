import {FC, PropsWithChildren} from "react";
import {ITool} from "./ToolLink";
import {Anchor, Container, Group, Stack, Text, Title} from "@mantine/core";
import Link from "next/link";
import {ArrowLeft16Regular} from "@fluentui/react-icons";

const ToolPage: FC<PropsWithChildren<ITool>> = ({title, description, color, children}) => {
	return (
		<Container my="xl" size="md">
			<Link href="/" passHref>
				<Anchor component="a">
					<Group spacing="xs" grow={false}>
						<ArrowLeft16Regular /> Back
					</Group>
				</Anchor>
			</Link>

			<Stack my="md" spacing={4}>
				<Title order={2}>
					<Text color={color}>{title}</Text>
				</Title>
				<Title order={3} style={{fontWeight: 500}}>{description}</Title>
			</Stack>

			{children}

		</Container>
	)
}

export default ToolPage;
