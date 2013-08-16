Simon = function(config) {
    config.tasks = config.says;
    if (!config.tasks || config.tasks.length == 0) throw "Simon: has nothing to do.";
    config.body = config.body || document.body;
    this.init = function(config, scope) {
        var me = scope,
            pointerConfig, keyboardConfig = config.keyboard || {},
            queueConfig = {};
        this.browserCompat();
        pointerConfig = Simon.util.objectMerge(config.pointer, {
            friction: 5,
            speed: 20
        });
        queueConfig = Simon.util.objectMerge(queueConfig, {
            tasks: config.tasks,
            parent: me,
            timer: config.timer
        });
        me.pointer = me.createPointer(pointerConfig, me);
        me.keyboard = me.createKeyboard(keyboardConfig, me);
        me.queue = me.createQueue(queueConfig, me);
    };
    this.createPointer = function(config) {
        return new this.Pointer(config);
    };
    this.createKeyboard = function(config) {
        return new this.Keyboard(config);
    };
    this.createQueue = function(config) {
        return new this.Queue(config);
    };
    this.run = function() {
        return this.queue.run();
    };
    this.browserCompat = function() {
        if (!document.querySelectorAll) {
            document.querySelectorAll = function(selector) {
                var doc = document,
                    head = doc.documentElement.firstChild,
                    styleTag = doc.createElement('STYLE');
                head.appendChild(styleTag);
                doc.__qsaels = [];
                styleTag.styleSheet.cssText = selector + "{x:expression(document.__qsaels.push(this))}";
                window.scrollBy(0, 0);
                return doc.__qsaels;
            }
        }
    };
    this.Pointer = function(config) {
        this.init = function(config, scope) {
            var me = scope;
            me.el = document.createElement("img");
            me.container = config.renderTo;
            me.friction = config.friction;
            me.speed = config.speed;
            me.el.src = config.img || "";
            me.el.style.position = "fixed";
            me.position = [0, 0];
            me.moveTo(0, 0);
            me.el.style.zIndex = "11111";
            config.renderTo.appendChild(me.el);
        };
        this.moveBy = function(x, y) {
            var me=this,
            curPosition,
            targetPosition = {
            	x: me.position[0]+x,
            	y: me.position[1]+y
            };
            return me.moveToInstant(targetPosition.x, targetPosition.y);
        };
        this.moveToInstant = function (x, y) {
        	var me = this,
				curPosition,
				overElement;

			me.position =[x,y];
			me.el.style.top = y+"px";
			me.el.style.left = x+"px";


			curPosition = me.position;
			overElement = document.elementFromPoint(x,y);
			if (overElement) {
				me.mouseover(overElement, curPosition);
			}
			me.detachEventOn(document, "mousemove", true, window, 0, curPosition, curPosition, false, false, false, false, 1, undefined);
			return overElement;
        };
        this.moveTo = function(x, y, instant) {
            var me = this,
                startPosition = {
                    x: me.position[0],
                    y: me.position[1]
                },
                curPosition, vector = {
                    len: 0,
                    incrementX: null,
                    incrementY: null
                },
                // incrementation means also direction of vector;
                i, interval, overElement;

            if (instant === true) {
            	return me.moveToInstant(x,y);
            } else {
                vector.len = Math.sqrt(Math.pow(Math.abs(x), 2) * Math.pow(Math.abs(y), 2), 2); // pitagoras
                i = Math.floor(vector.len / me.speed);
                vector.incrementX = Math.floor((startPosition.x + x) / i);
                vector.incrementY = Math.floor((startPosition.y + y) / i);
                interval = window.setInterval(function() {
                    if (i > 0) {
                        me.moveBy(vector.incrementX, vector.incrementY);
                    } else {
                    	me.moveToInstant(x,y);
                    	window.clearInterval(interval);
                    }
                    --i;
                }, me.friction);
            }
            return overElement;
        };
        this.click = function() {
            var me = this,
                curPosition = {
                    x: me.position[0],
                    y: me.position[1]
                },
                overElement;
            me.moveTo(-1000, -1000);
            overElement = document.elementFromPoint(curPosition.x, curPosition.y);
            if (overElement) {
                this.mousedown(overElement, curPosition);
                if (document.activeElement) Simon.browser.blurActiveElement();
                if (overElement.nodeName === "INPUT") Simon.browser.focusElement(overElement);
                this.mouseup(overElement, curPosition);
                me.detachEventOn(overElement, "click", true, window, 1, curPosition, curPosition, false, false, false, false, 1, undefined);
            }
            me.moveTo.call(me, curPosition.x, curPosition.y);
            return overElement;
        };
        this.mousedown = function(target, position) {
            var me = this;
            me.detachEventOn(target, "mousedown", true, window, 1, position, position, false, false, false, false, 1, undefined);
        };
        this.mouseover = function(target, position) {
            var me = this;
            me.detachEventOn(target, "mouseover", true, window, 1, position, position, false, false, false, false, 1, undefined);
        };
        this.mouseup = function(target, position) {
            var me = this;
            me.detachEventOn(target, "mouseup", true, window, 1, position, position, false, false, false, false, 1, undefined);
        };
        this.clickXY = function(x, y) {
            this.moveTo(x, y);
            this.click();
        };
        this.clickEl = function(query) {
            var me = this,
                elements = Simon.util.queryAll(query);
            elements.each(function(item) {
                var center = item.getCenterXY();
                me.clickXY(center.x, center.y);
            });
        };
        this.dblclick = function() {
            var me = this,
                curPosition = {
                    x: me.position[0],
                    y: me.position[1]
                },
                overElement;
            me.moveTo(-1000, -1000);
            overElement = document.elementFromPoint(curPosition.x, curPosition.y);
            if (overElement) {
                me.detachEventOn(overElement, "dblclick", true, window, 2, curPosition, curPosition, false, false, false, false, 1, undefined);
            }
            me.moveTo.call(me, curPosition.x, curPosition.y);
            return overElement;
        };
        this.dblclickXY = function(x, y) {
            this.moveTo(x, y);
            this.dblclick();
        };
        this.dragFromTo = function(from, to) {
            var me = this,
                dragSrc;
            me.moveTo(-1000, -1000);
            dragSrc = document.elementFromPoint(from.x, from.y);
            me.moveTo(from.x, from.y);
            me.mousedown(dragSrc, from);
            me.moveTo(to.x, to.y);
            //me.mouseup(dragSrc, to);
        };
        this.dragElBy = function(elem, by) {
            var me = this,
                elem = new Simon.util.query(elem),
                elemPos = elem.getCenterXY(),
                to = {
                    x: elemPos.x + by.x,
                    y: elemPos.y + by.y
                };
            return me.dragFromTo(elemPos, to)
        };
        this.secondbtnclick = function() {};
        this.secondbtnclickXY = function(x, y) {};
        this.detachEventOn = function(elem, type, bubble, viewArg, count, view, client, ctrl, alt, shift, meta, button, related) {
            var me = this,
                event;
            if (document.createEvent) {
                event = document.createEvent("MouseEvent");
                event.initEvent(type, bubble, viewArg, count, view.x, view.y, client.x, client.y, ctrl, alt, shift, meta, button, related);
                elem.dispatchEvent(event);
            } else {
                event = document.createEventObject("MouseEvent");
                elem.fireEvent("on" + type, bubble, viewArg, count, view.x, view.y, client.x, client.y, ctrl, alt, shift, meta, button, related);
            }
            window.lastEl = elem;
        };
        this.triggerBlurFocus = function(blurElem, focusElem) {
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
                focusElem.fireEvent("onfocus");
                keyboard
                focusElem.focus();
                blurElem.fireEvent("onblur");
                blurElem.blur();
            }
        };
        this.init(config, this);
    }
    this.Keyboard = function(config) {
        this.init = function() {};
        this.focus = function() {};
        this.pressTab = function() {};
        this.pressReturn = function() {};
        this.pressKey = function() {};
        this.navigateUp = function() {};
        this.navigateDown = function() {};
        this.navigateLeft = function() {};
        this.navigateRight = function() {};
        this.write = function() {};
        this.destroy = function() {};
    }
    this.Queue = function(config) {
        this.init = function(config, scope) {
            var me = scope;
            config.timer = Math.abs(config.timer) || 1000;
            me.parent = config.parent;
            me.tasks = config.tasks;
            me.timer = config.timer;
            me.processes = [];
        };
        this.run = function() {
            var me = this,
                tasks = me.tasks.reverse(),
                currentTask, delay = 0,
                i;
            for (i = tasks.length - 1; i >= 0; i--) {
                currentTask = tasks[i];
                if (Simon.util.isNumber(currentTask)) {
                    delay += currentTask * me.timer;
                } else {
                    me.add(currentTask, delay);
                }
            };
        };
        this.add = function(task, timeout) {
            var me = this,
                listener = task.shift(),
                method = task.shift(),
                funcArgs = task,
                result;
            result = function() {
                me.parent[listener][method].apply(me.parent[listener], funcArgs);
            }
            return me.processes.push(setTimeout(result, timeout));
        };
        this.destroy = function() {
            for (var i = me.processes.length - 1; i >= 0; i--) {
                window.clearTimeout(me.processes[i]);
            };
        };
        this.init(config, this);
    }
    this.init(config, this);
}
Simon.Element = function(el) {
    this.el = el;
    this.getBox = function() {
        var me = this;
        return me.getEl().getBoundingClientRect();
    };
    this.getCenterXY = function() {
        var me = this,
            box = me.getBox(),
            el = me.getEl();
        return {
            x: box.left + (~~el.offsetWidth / 2),
            y: box.top + (~~el.offsetHeight / 2)
        };
    };
    this.getEl = function() {
        var me = this;
        return me.el;
    };
};
Simon.ElementsArray = function(items) {
    var i;
    this.items = [];
    for (i = 0; i < items.length; ++i) {
        this.items.push(new Simon.Element(items[i]));
    }
    this.each = function(func, args) {
        var me = this,
            i;
        for (i = 0; i < me.items.length; ++i) {
            func.apply(me.getAt[i], Simon.util.arrayMerge(args || [], [me.getAt(i)]));
        }
    };
    this.getAt = function(index) {
        return this.items[index];
    };
    this.first = function() {
        return this.getAt(0);
    };
    this.last = function() {
        return this.getAt(this.items.length);
    };
    this.count = function() {
        return this.items.legth;
    };
};
Simon.browser = {
    blurActiveElement: function() {
        var event;
        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent("blur", true, true);
            document.activeElement.blur();
            document.activeElement.dispatchEvent(event);
        } else {
            event = document.createEventObject("HTMLEvents");
            document.activeElement.fireEvent("onblur");
            document.activeElement.blur();
        }
    },
    focusElement: function(input) {
        var event;
        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent("focus", true, true);
            input.dispatchEvent(event);
            input.focus();
        } else {
            event = document.createEventObject();
            input.fireEvent("onfocus");
            input.focus();
        }
    },
    scrollElBy: function(elem, x, y) {
        var me = this,
            elem = Simon.util.query(elem);
    }
};
Simon.util = {
    objectMerge: function(objectA, objectB, throwConflicts) {
        var result = objectA,
            throwConflicts = throwConflicts === undefined ? false : throwConflicts,
            param, source, target;
        for (param in objectB) {
            target = result[param];
            source = objectB[param];
            if (target === undefined || throwConflicts === false) {
                result[param] = source;
            } else if (throwConflicts === true) {
                throw "Simon.util.objectMerge: Merge conflict in param " + param;
            } else {
                throw "Simon.util.objectMerge: Unexpected error, propably wrong type of throwConflicts";
            }
        }
        return result;
    },
    arrayMerge: function(arrayA, arrayB) {
        return arrayA.concat(arrayB);
    },
    isNumber: function(value) {
        return typeof value === 'number' && isFinite(value);
    },
    logXY: function() {
        document.onmousemove = function(e) {
            console.log("X: ", e.x, "Y: ", e.y)
        }
    },
    queryAll: function(query) {
        return new Simon.ElementsArray(document.querySelectorAll(query));
    },
    query: function(query) {
        return new Simon.Element(document.querySelector(query));
    }
};
window.onload = function() {
    sim = new Simon({
        pointer: {
            img: "http://dariusz.local/3.10/m_www_lib/simonsays.js/wand.png",
            width: 20,
            height: 20,
            renderTo: document.body
        },
        says: [
        2, // 5 sek daje na zaladowanie
        //["pointer","clickXY",200,250],
        //3,
        ["pointer", "dblclickXY", 200, 220], 2.0,
        //["pointer","clickXY",200,200],0.2,
        //	["pointer","clickEl","#radiofield-1122-inputEl"],1.0,
        ["pointer", "clickEl", "#radiofield-1053-inputEl"], 2.0
        //["pointer","dragElBy","#slider-1068-thumb-0",{x: 60}],1.0,
        //["pointer","clickXY",1795,308] //487,374
        //wez suwak i przeuń w prawo aż będzie 43.5
        ],
        setup: function() {}
    });
    sim.run();
}