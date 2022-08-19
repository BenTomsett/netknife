import {createContext, FC, PropsWithChildren, useState} from "react";
import {MantineColor} from "@mantine/core";

const defaultColorContext = {
	color: 'red',
	changeColor: (color: MantineColor) => {},
}

export const ColorContext = createContext(defaultColorContext);

const ColorProvider: FC<PropsWithChildren> = ({children}) => {
	const [color, setColor] = useState("red");

	const changeColor = (color: string) => {
		setColor(color);
	};

	return (
		<ColorContext.Provider value={{color, changeColor}}>
			{children}
		</ColorContext.Provider>
	)
};

export default ColorProvider;
