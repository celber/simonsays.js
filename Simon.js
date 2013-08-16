Simon = function (config) {
	config.tasks = config.says;
	if (!config.tasks || config.tasks.length == 0) throw "Simon: has nothing to do.";
	config.body = config.body || document.body;


	this.init = function (config,scope) {
		var me = scope,
			pointerConfig,
			keyboardConfig = config.keyboard || {},
			queueConfig = {};

		pointerConfig = Simon.util.objectMerge(config.pointer, {

		});

		queueConfig = Simon.util.objectMerge(queueConfig, {
			tasks: config.tasks,
			parent: me,
			timer: config.timer
		});

		me.pointer = me.createPointer(pointerConfig,me);
		me.keyboard = me.createKeyboard(keyboardConfig,me);
		me.queue = me.createQueue(queueConfig,me);
	};

	this.createPointer = function (config) {
		return new this.Pointer(config);
	};
	this.createKeyboard = function (config) {
		return new this.Keyboard(config);
	};
	this.createQueue = function (config) {
		return new this.Queue(config);
	};
	this.run = function () {
		return this.queue.run();
	};

	this.Pointer = function (config) {


		this.init = function (config,scope) {
			var me = scope;

			me.el = document.createElement("img");
			me.container = config.renderTo;

			me.el.src = config.img || "";
			me.el.style.position = "fixed";
			me.moveTo(0,0);
			me.el.style.zIndex = "11111";

			config.renderTo.appendChild(me.el);
		};
		this.moveTo = function (x,y) {
			var me = this,
				curPosition,
				overElement;
				
			me.position = [x,y];
			me.el.style.top = y+"px";
			me.el.style.left = x+"px";


			curPosition = me.position;
			overElement = document.elementFromPoint(curPosition[0],curPosition[1]);
			if (overElement) {
				me.detachEventOn(overElement, "mouseover", true, window, 0,
					curPosition[0], curPosition[1],
					curPosition[0], curPosition[1],
					false, false, false, false, 1, undefined);
			}
			me.detachEventOn(document, "mousemove", true, window, 0,
					curPosition[0], curPosition[1],
					curPosition[0], curPosition[1],
					false, false, false, false, 1, undefined);
			return overElement;
		};
		this.click = function () {
			var me = this,
				curPosition = me.position,
				overElement;

			me.moveTo(-1000,-1000);
			overElement = document.elementFromPoint(curPosition[0],curPosition[1]);
			if (overElement) {

				me.detachEventOn(overElement, "mousedown", true, window, 1,
					curPosition[0], curPosition[1],
					curPosition[0], curPosition[1],
					false, false, false, false, 1, undefined);
			
				if (document.activeElement) Simon.browser.blurActiveElement();
				if (overElement.nodeName === "INPUT") Simon.browser.focusElement(overElement);

				me.detachEventOn(overElement, "mouseup", true, window, 1,
					curPosition[0], curPosition[1],
					curPosition[0], curPosition[1],
					false, false, false, false, 1, undefined);

				me.detachEventOn(overElement, "click", true, window, 1,
					curPosition[0], curPosition[1],
					curPosition[0], curPosition[1],
					false, false, false, false, 1, undefined);
			}
			me.moveTo.apply(me,curPosition);
			return overElement;
		};
		this.clickXY = function (x,y) {
			this.moveTo(x,y);
			this.click();
		};
		this.clickEl = function (query) {
			var me = this,
				elements = Simon.util.query(query); 

			elements.each(function (item) {
				var center = item.getCenterXY();
				me.clickXY(center.x, center.y);
			});
		};
		this.dblclick = function () {
			var me = this,
				curPosition = me.position,
				overElement;

			me.moveTo(-1000,-1000);
			overElement = document.elementFromPoint(curPosition[0],curPosition[1]);
			if (overElement) {
				me.detachEventOn(overElement, "dblclick", true, window, 2,
					curPosition[0], curPosition[1],
					curPosition[0], curPosition[1],
					false, false, false, false, 1, undefined);
			}
			me.moveTo.apply(me,curPosition);
			return overElement;
		};
		this.dblclickXY = function (x,y) {
			this.moveTo(x,y);
			this.dblclick();
		};
		this.secondbtnclick = function () {};
		this.secondbtnclickXY = function (x, y) {};

		this.detachEventOn = function (elem, type, bubble, viewArg, count, screenX, screenY, clientX, clientY, ctrl, alt, shift, meta, button, related) {
			var me = this,
				event;


			if (document.createEvent) {
				event = document.createEvent("MouseEvent");
				event.initEvent(type, bubble, viewArg, count, screenX, screenY, clientX, clientY, ctrl, alt, shift, meta, button, related);
				elem.dispatchEvent(event);
			} else {
				event = document.createEventObject("MouseEvent");
				elem.fireEvent("on"+type, bubble, viewArg, count, screenX, screenY, clientX, clientY, ctrl, alt, shift, meta, button, related);
			}
			window.lastEl = elem;
		};

		this.triggerBlurFocus = function (blurElem, focusElem) {
			var me = this,
				event;

			if (document.createEvent) {
				event = document.createEvent("HTMLEvents");
				event.initEvent("focus");
				focusElem.dispatchEvent(event);
				event = document.createEvent("HTMLEvents");
				event.initEvent("blur");
				focusElem.focus();
				blurElem.blur();
				blurElem.dispatchEvent(event);
			} else {
				event = document.createEventObject("HTMLEvents");
				focusElem.fireEvent("onfocus");keyboard
				focusElem.focus();
				blurElem.fireEvent("onblur");
				blurElem.blur();
			}
		};

		this.init(config,this);
	}

	this.Keyboard = function (config) {


		this.init = function () {};
		this.focus = function () {};
		this.pressTab = function () {};
		this.pressReturn = function () {};
		this.pressKey = function () {};
		this.navigateUp = function () {};
		this.navigateDown = function () {};
		this.navigateLeft = function () {};
		this.navigateRight = function () {};
		this.write = function () {};
		this.destroy = function () {};
	}

	this.Queue = function (config) {

		this.init = function (config, scope) {
			var me = scope;

			config.timer = Math.abs(config.timer) || 1000;

			me.parent = config.parent;
			me.tasks = config.tasks;
			me.timer = config.timer;
			me.processes = []; 
		};
		this.run = function () {
			var me = this,
				tasks = me.tasks.reverse(),
				currentTask,
				delay=0,
				i;

			for (i = tasks.length - 1; i >= 0; i--) {
				currentTask = tasks[i];

				if (Simon.util.isNumber(currentTask)) {
					delay+=currentTask*me.timer;
				} else {
					me.add(currentTask,delay);
				}
			};
		};
		this.add = function (task,timeout) {
			var me = this,
				listener = task.shift(),
				method = task.shift(),
				funcArgs = task,
				result;


			result = function () {
				me.parent[listener][method].apply(me.parent[listener], funcArgs);
			}

			return me.processes.push(setTimeout(result,timeout));
		};
		this.destroy = function () {
			for (var i = me.processes.length - 1; i >= 0; i--) {
				window.clearTimeout(me.processes[i]);
			};
		};

		this.init(config,this);
	}



	this.init(config,this);
}
Simon.Element = function (el) {
	this.el = el;
	this.getBox = function () {
		var me = this;
		return me.getEl().getBoundingClientRect();
	};
	this.getCenterXY = function () {
		var me = this,
			box = me.getBox();

		return  {
			x: box.left+(~~box.width/2),
			y: box.top+(~~box.height/2)
		};
	};
	this.getEl = function () {
		var me = this;
		return me.el;
	};
};
Simon.ElementsArray = function (items) {
		var i;
		this.items = [];
		for (i=0;i<items.length;++i) {
			this.items.push(new Simon.Element(items[i]));
		}
		this.each = function (func,args) {
			var me=this,
				i;
			for (i=0;i<me.items.length;++i) {
				func.apply(me.getAt[i], Simon.util.arrayMerge(args || [],[me.getAt(i)]));
			}
		};
		this.getAt = function(index) {
			return this.items[index];
		};
		this.first = function () {
			return this.getAt(0);
		};
		this.last = function () {
			return this.getAt(this.items.length);
		};
		this.count = function () {
			return this.items.legth;
		};
	};
Simon.browser = {
	blurActiveElement: function () {
		var event;
		if (document.createEvent) {
			event = document.createEvent("HTMLEvents");
			event.initEvent("blur");
			document.activeElement.blur();
			document.activeElement.dispatchEvent(event);
		} else {
			event = document.createEventObject("HTMLEvents");
			document.activeElement.fireEvent("onblur");
			document.activeElement.blur();
		}
	},
	focusElement: function (input) {
		var event;
		if (document.createEvent) {
			event = document.createEvent("HTMLEvents");
			event.initEvent("focus");
			input.dispatchEvent(event);
			input.focus();
		} else {
			event = document.createEventObject();
			input.fireEvent("onfocus");
			input.focus();
		}
	},
	scrollElBy: function (elem, x, y) {
		var me = this,
			elem = Simon.util.query(elem);



	}
};

Simon.util = {
	objectMerge: function (objectA, objectB, throwConflicts) {
		var result = objectA,
			throwConflicts = throwConflicts === undefined ? false : throwConflicts,
			param,
			source,
			target;

		for (param in objectB) {
			target = result[param];
			source = objectB[param];
			if (target === undefined || throwConflicts === false) {
				result[param] = source;
			} else if (throwConflicts === true){
				throw "Simon.util.objectMerge: Merge conflict in param "+param;
			} else {
				throw "Simon.util.objectMerge: Unexpected error, propably wrong type of throwConflicts";
			}
		}

		return result;
	},
	arrayMerge: function (arrayA, arrayB) {
		return arrayA.concat(arrayB);
	},
	isNumber: function (value) {
		return typeof value === 'number' && isFinite(value);
	},
	logXY: function() {
		document.onmousemove = function (e) {console.log("X: ",e.x,"Y: ",e.y)}
	},
	query: function (query) {
		return new Simon.ElementsArray(document.querySelectorAll(query));
	}
};

window.onload = function () {
sim = new Simon({
	pointer: {
		img: "http://dariusz.local/3.10/m_www_lib/simonsays.js/wand.png",
		width: 20,
		height: 20,
		renderTo: document.body 
	},
	says: [
		5, // 5 sek daje na zaladowanie
		//["pointer","clickXY",200,250],
		//3,
		["pointer","dblclickXY",200,220],2.0,
		["pointer","clickXY",200,200],0.2,
		//["pointer","clickEl","#radiofield-1122"],1.0,
		["pointer","clickEl","#radiofield-1053"],1.0,
		["pointer","dragEl","#slider-1058",{right: 60}],1.0,
		["pointer","clickXY",1795,308] //487,374
		//wez suwak i przeuń w prawo aż będzie 43.5
 	],
 	setup: function () {

 	}
 });

sim.run();
}