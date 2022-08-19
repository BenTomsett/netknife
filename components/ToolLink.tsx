import {
	UnstyledButton,
	Stack,
	Text,
	Title,
	MantineColor,
	Group, Tooltip, ThemeIcon, createStyles
} from "@mantine/core";
import { FC } from "react";
import {QuestionCircle16Regular} from "@fluentui/react-icons";
import Link from "next/link";

const useToolStyles = createStyles((theme) => (
	{
		tool: {
			border: `1px solid ${theme.colors.gray[3]}`,
			borderRadius: theme.radius.sm,
			padding: theme.spacing.md,
			cursor: "pointer",
		}
	}
));

export interface ITool {
	value: string;
	icon?: JSX.Element;
	color: MantineColor;
	tooltip?: string;
	title: string;
	description: string;
}

const ToolLink: FC<ITool> = ({value, icon, color, tooltip, title, description}) => {
	const {classes} = useToolStyles();

	return (
		<UnstyledButton
			component={Link}
			href={value}
		>
			<Stack
				spacing={0}
				className={classes.tool}
				sx={(theme) => ({
					transition: 'all 0.2s ease-in-out',
					':hover': {
						backgroundColor: theme.colors[color || 'blue'][0],
						color: theme.colors[color || 'blue'][6]
					}
				})}
			>
				<Group position="apart">
					{icon}
					{tooltip && (
						<Tooltip label={tooltip} position="top-end" withArrow>
							<ThemeIcon color={color} variant="light" radius="xl">
								<QuestionCircle16Regular />
							</ThemeIcon>
						</Tooltip>
					)}
				</Group>
				<Title order={4} mt={icon && "xs"}>{title}</Title>
				<Text size="sm" color="dimmed">
					{description}
				</Text>
			</Stack>
		</UnstyledButton>
	)
}

export default ToolLink;
