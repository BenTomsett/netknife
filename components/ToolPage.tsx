import {FC, PropsWithChildren, useContext, useEffect} from "react";
import {ITool} from "./ToolLink";
import {Anchor, Group, Stack, Text, Title} from "@mantine/core";
import Link from "next/link";
import {ArrowLeft16Regular} from "@fluentui/react-icons";
import { ColorContext } from "./ColorContext";

const ToolPage: FC<PropsWithChildren<ITool>> = ({title, description, color, children}) => {
	const {changeColor} = useContext(ColorContext);

	useEffect(() => {
		changeColor(color);
	}, [color, changeColor])

	return (
		<>
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
		</>
	)
}

export default ToolPage;
