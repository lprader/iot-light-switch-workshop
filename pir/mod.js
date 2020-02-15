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

import Timer from "timer";
import Digital from "pins/digital";

const TEXT_COLOR = "black";
const BACKGROUND_COLOR = "#1932ab";
const BUTTON_BACKGROUND_COLORS = ["#a6a6a6", "#e6e6e6"]

const buttonSkin = new Skin({ 
	fill: BUTTON_BACKGROUND_COLORS,
	stroke: ["transparent", "yellow"], 
	borders: { top: 3, bottom: 3, left: 3, right: 3 }
});
const backgroundSkin = new Skin({ fill: BACKGROUND_COLOR });

const textStyle = new Style({
	font: "24px Open Sans", 
	color: TEXT_COLOR
});

class OnOffButtonBehavior extends Behavior {
	onCreate(button, data) {
		this.data = data;
	}
	onTouchEnded(button) {
		button.state = 1;
		let value = ("ON" === button.string)? true : false;
		if (value) {
			button.next.delegate("deselect");
			button.next.next.delegate("deselect");
		} else {
			button.next.delegate("deselect");
			button.previous.delegate("deselect");
		}
		application.delegate("updateProperty", "on", value);
	}
	deselect(button) {
		button.state = 0;
	}
}

class AutoButtonBehavior extends Behavior {
	onCreate(button, data) {
		this.data = data;
		this.startTimer(button);
	}
	onTouchEnded(button) {
		button.state = 1;
		button.previous.delegate("deselect");
		button.previous.previous.delegate("deselect");
		this.startTimer(button);
	}
	startTimer(button) {
		let pir = new Digital(16, Digital.Input);
		let previous = 0;
		this.timer = Timer.repeat(() => {
			const current = pir.read();
			if (current !== previous) {
				application.delegate("updateProperty", "on", current);
				previous = current;
			}
		}, 100);
	}
	deselect(button) {
		button.state = 0;
		if (this.timer) {
			Timer.clear(this.timer);
			delete this.timer;
		}
	}
}

const switches = new Column(null, {
	top: 0, bottom: 0, left: 0, right: 0,
	skin: backgroundSkin,
	contents: [
		Label(null, {
			top: 30, bottom: 0, left: 30, right: 30,
			skin: buttonSkin, style: textStyle,
			state: 0, string: "ON",
			active: true, Behavior: OnOffButtonBehavior
		}),
		Label(null, {
			top: 30, bottom: 0, left: 30, right: 30,
			skin: buttonSkin, style: textStyle,
			state: 0, string: "OFF",
			active: true, Behavior: OnOffButtonBehavior
		}),
		Label(null, {
			top: 30, bottom: 30, left: 30, right: 30,
			skin: buttonSkin, style: textStyle,
			state: 1, string: "AUTO",
			active: true, Behavior: AutoButtonBehavior
		}),
	]
});

application.add(switches);