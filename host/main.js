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
 
import {} from "piu/MC"
import LoadMod from "loadmod";
import {Request} from "http"
import MDNS from "mdns";
import {Server} from "websocket"
import Timer from "timer";

const HOST_NAME = "lizzie";
const BULB_NAME = "flicker";

const WhiteSkin = Skin.template({ fill: "white" });
const BlackSkin = Skin.template({ fill: "#202020" });

const TextStyle = Style.template({ font: "24px Open Sans", color: ["#202020", "white"] });


function restart() @ "do_restart";
function doRestart() {
	trace(`Restarting in 1 second...\n`);
    Timer.set(() => {
    	restart();
    }, 1000);
}

class ModDevServer extends Server {
	callback(message, value) {
		if (Server.handshake === message) {
			ModDevServer.debug(this.detach());
		}
		else if (Server.subprotocol === message)
			return "x-xsbug";
	}
	static debug(socket) @ "xs_debug";		// hand-off native socket to debugger
}
Object.freeze(ModDevServer.prototype);


class ButtonBehavior extends Behavior {
	onCreate(button, data) {
		this.data = data;
	}
	onTouchEnded(button) {
		let value = ("ON" === button.string)? true : false;
		application.delegate("updateProperty", "on", value);
	}
}

const DefaultSwitch = Column.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0, Style: TextStyle,
	contents: [
		Label($, {
			top: 0, bottom: 0, left: 0, right: 0,
			Skin: WhiteSkin, state: 0, string: "ON",
			active: true, Behavior: ButtonBehavior
		}),
		Label($, {
			top: 0, bottom: 0, left: 0, right: 0,
			Skin: BlackSkin, state: 1, string: "OFF",
			active: true, Behavior: ButtonBehavior
		})
	]
}));

class AppBehavior extends Behavior {
	onCreate(app, data) {
		this.data = data;
		global.server = new ModDevServer({port: 8080});
		global.mdns = new MDNS({hostName: HOST_NAME}, function(message, value) {
			if ((1 === message) && value)
				trace(`host ready at ws://${HOST_NAME}.local:8080\n`);
		});
		let request = new Request({	host: `10.0.1.2`,//`${data.bulb}.local`,
									path: `/thng/desc/bulb`,
									response: String});

		request.callback = function(message, value) {
			if (Request.responseComplete === message) {
				trace(`found lightbulb ${BULB_NAME}\n`);
				application.delegate("parseProperties", JSON.parse(value).properties);
			}
		}
	}
	parseProperties(app, properties) {
		let urls = {}; 
		let keys = Object.keys(properties);
		for (let key of keys) {
			urls[key] = properties[key]["href"];
		}
		this.data.urls = urls;
		application.delegate("loadApp");
	}
	loadApp(app) {
		try {
			if (LoadMod.has("check")) {
				let check = LoadMod.load("check");
				check();
			}
			if (LoadMod.has("mod")) {
				let mod = LoadMod.load("mod");
			} else {
				app.add(new DefaultSwitch(this.data));
			}
		}
		catch(e) {
			app.add(new DefaultSwitch(this.data));
		}
	}
	updateProperty(app, property, value) {
		if (undefined === this.data.urls[property]) {
			trace(`Light does not have property "${property}"\n`);
		} else {
			trace(`Sending request to change property "${property}" to ${value}\n`);
			let request = new Request({	host: `10.0.1.2`,//`${data.bulb}.local`,
										path: this.data.urls[property],
										method: "PUT",
										body: JSON.stringify({ [property]: value }),
										response: String});

			request.callback = function(message, value) {
				if (Request.responseComplete === message) {
					trace(`Response: ${value}\n`);
				}
			}
		}
	}
}

export default new Application({ bulb: BULB_NAME }, {
	displayListLength: 8192, commandListLength: 4096,
	Behavior: AppBehavior
});

