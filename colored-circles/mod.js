/*
 * Copyright (c) 2016-2020 Moddable Tech, Inc.
 *
 *   This file is part of the Moddable SDK.
 * 
 *   This work is licensed under the
 *       Creative Commons Attribution 4.0 International License.
 *   To view a copy of this license, visit
 *       <http://creativecommons.org/licenses/by/4.0>
 *   or send a letter to Creative Commons, PO Box 1866,
 *   Mountain View, CA 94042, USA.
 *
 */

const LIGHT_COLORS = [
	"#01befe",
	"#ffdd00",
	"#ff7d00",
	"#ff006d",
	"#adff02",
	"#9c1aff",
]

const LIGHT_TEXT_COLOR = "white";
const DARK_TEXT_COLOR = "#202020";
const BACKGROUND_COLOR = "#696969";
const ON_BUTTON_BACKGROUND_COLOR = "white";
const OFF_BUTTON_BACKGROUND_COLOR = "#202020"

const circleTexture = new Texture({ path: "circle.png" });

const onSkin = new Skin({ fill: ON_BUTTON_BACKGROUND_COLOR });
const offSkin = new Skin({ fill: OFF_BUTTON_BACKGROUND_COLOR });
const backgroundSkin = new Skin({ fill: BACKGROUND_COLOR });

const smallTextStyle = new Style({ 
	font: "semibold 16px Open Sans", 
	color: LIGHT_TEXT_COLOR
});

const bigTextStyle = new Style({
	font: "24px Open Sans", 
	color: [DARK_TEXT_COLOR, LIGHT_TEXT_COLOR]
});


class ButtonBehavior extends Behavior {
	onCreate(button, data) {
		this.data = data;
	}
	onTouchEnded(button) {
		let value = ("ON" === button.string)? true : false;
		application.delegate("updateProperty", "on", value);
	}
}

const onOffButtons = new Row(null, {
	top: 0, height: 50, left: 0, right: 0,
	contents: [
		Label(null, {
			top: 0, bottom: 0, left: 0, right: 0,
			skin: onSkin, style: bigTextStyle,
			state: 0, string: "ON",
			active: true, Behavior: ButtonBehavior
		}),
		Label(null, {
			top: 0, bottom: 0, left: 0, right: 0,
			skin: offSkin, style: bigTextStyle,
			state: 1, string: "OFF",
			active: true, Behavior: ButtonBehavior
		}),
	]
});

class ColorButtonBehavior extends Behavior {
	onCreate(button, color) {
		this.color = color;
	}
	onTouchEnded(button) {
		application.delegate("updateProperty", "color", this.color);
	}
}

const ColorButton = Content.template(color => ({
	skin: new Skin({
		texture: circleTexture,
		height: 76, width: 76,
		color: color 
	}),
	active: true, Behavior: ColorButtonBehavior
}));

const colorButtons = new Container(null, {
	top: 50, bottom: 0, left: 0, right: 0,
	skin: backgroundSkin
});

for (let i=0; i<LIGHT_COLORS.length; i++) {
	let color = LIGHT_COLORS[i];
	let left = (i % 2 == 0)? 29 : 135;
	let top = Math.floor(i / 2) * 76 + Math.floor(i / 2) * 10 + 10;
	colorButtons.add(new ColorButton(color, { left, top }));
}

application.add(onOffButtons);
application.add(colorButtons);