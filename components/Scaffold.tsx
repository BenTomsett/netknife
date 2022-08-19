import {Container, Text, Title} from "@mantine/core";
import {FC, PropsWithChildren, useContext} from "react";
import {ColorContext} from "./ColorContext";

const Scaffold: FC<PropsWithChildren> = ({children}) => {
	const {color} = useContext(ColorContext);

	return (
		<Container my="xl" size="md">
			<Title>
				Net
				<Text component="span" color={color}>Knife</Text>
			</Title>
			{children}
		</Container>
	)
}

export default Scaffold;
