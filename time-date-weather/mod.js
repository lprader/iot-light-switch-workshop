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

import {Request} from "http"

const APPID = "94de4cda19a2ba07d3fa6450eb80f091";
const zip = "94301";
const country = "us";

const LIGHT_TEXT_COLOR = "white";
const DARK_TEXT_COLOR = "#202020";
const HEADER_BACKGROUND_COLOR = "#1932ab";
const FOOTER_BACKGROUND_COLOR = "#1932ab";
const ON_BUTTON_BACKGROUND_COLOR = "white";
const OFF_BUTTON_BACKGROUND_COLOR = "#202020"

const headerSkin = new Skin({ fill: HEADER_BACKGROUND_COLOR });
const footerSkin = new Skin({ fill: FOOTER_BACKGROUND_COLOR });
const onSkin = new Skin({ fill: ON_BUTTON_BACKGROUND_COLOR });
const offSkin = new Skin({ fill: OFF_BUTTON_BACKGROUND_COLOR });

const smallTextStyle = new Style({ 
	font: "16px Open Sans", 
	color: LIGHT_TEXT_COLOR,
	bottom: 5
});

const bigTextStyle = new Style({
	font: "24px Open Sans", 
	color: [DARK_TEXT_COLOR, LIGHT_TEXT_COLOR]
});

class DateLabelBehavior extends Behavior {
	onDisplaying(date) {
		this.updateDate(date);
		date.interval = 10000;
		date.start();
	}
	onTimeChanged(date) {
		this.updateDate(date);
	}
	updateDate(date) {
		let d = new Date();
		date.string = `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
	}
}

const dateLabel = new Label(null, {
	left: 20, style: smallTextStyle, 
	Behavior: DateLabelBehavior
});

function getTimeString(hour, min) {
/* 
 *   hour is a number between 0 and 23, inclusive
*/
	let string = "";
	let ampm = (hour >= 12)? " pm" : " am";
	if (hour == 0) hour = 12;
	else if (hour > 12) hour -= 12;
	string += String(hour);
	string += ":";
	min = min.toString().padStart(2, "0");
	string += min;
	string += ampm;
	return string;
}

class ClockLabelBehavior extends Behavior {
	onDisplaying(clock) {
		this.updateTime(clock);
		clock.interval = 10000;
		clock.start();
	}
	onTimeChanged(clock) {
		this.updateTime(clock);
	}
	updateTime(clock) {
		let d = new Date();
		clock.string = getTimeString(d.getHours(), d.getMinutes());
	}
}

const clockLabel = new Label(null, {
	right: 20, style: smallTextStyle, 
	Behavior: ClockLabelBehavior
});

const headerBar = new Container(null, {
	top: 0, height: 40, left: 0, right: 0,
	skin: headerSkin,
	contents: [
		dateLabel,
		clockLabel
	]
});

class WeatherLabelBehavior extends Behavior {
	onDisplaying(label) {
		this.updateWeather(label);
		label.interval = 120000;
		label.start();
	}
	onTimeChanged(label) {
		this.updateWeather(label);
	}
	updateWeather(label) {
		let request = new Request({	host: "api.openweathermap.org",
									path: `/data/2.5/weather?zip=${zip},${country}&appid=${APPID}&units=imperial`,
									response: String});

		request.callback = function(message, value) {
			if (Request.responseComplete === message) {
				value = JSON.parse(value, ["main", "name", "temp", "weather"]);
				label.string = `${value.name} | ${Math.round(value.main.temp)}°F | ${value.weather[0].main}`;
			}
		}
	}
}

const weatherBar = new Label(null, {
	top: 0, height: 40, left: 0, right: 0,
	skin: footerSkin, style: smallTextStyle,
	Behavior: WeatherLabelBehavior
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

const timeDateWeatherSwitch = new Column(null, {
	top: 0, bottom: 0, left: 0, right: 0,
	contents: [
		headerBar,
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
		weatherBar
	]
});

application.add(timeDateWeatherSwitch);