var inputsController = function() {
	var parent = this;
	
	this.init = function() {
		
		parent.bindElement = document.body;
		
		parent.mouse = new mouseController();
		parent.keyboard = new keyboardController();
		parent.gamepad = new gamepadController();
		
		parent._setHTML5Features();

		$(window).unbind('fullscreenchange webkitfullscreenchange mozfullscreenchange', parent._onFullScreenChange);
		$(window).bind('fullscreenchange webkitfullscreenchange mozfullscreenchange', parent._onFullScreenChange);
	}
	
	this.setCursor = function(cursor) {
		document.body.style.cursor = cursor;
	}
	
	this.enterFullScreen = function(dontWaitInput) {
		if(typeof dontWaitInput == 'undefined') { var dontWaitInput = false; }
		
		if(dontWaitInput) {
			parent._enterFullScreen();
		} else {
			var events = 'mousedown mouseup keydown keyup';
		
			var callback = function() {
				$(parent.bindElement).unbind(events, callback);
				parent._enterFullScreen();
			}
			
			$(parent.bindElement).unbind(events, callback);
			$(parent.bindElement).bind(events, callback);
		}
	}
	
	this.exitFullScreen = function() {
		if(parent.isFullScreen()) {
			document.cancelFullScreen();
		}
	}
	
	this.isFullScreen = function() {
		var isFullScreen = 	document.isFullScreen ||
							document.webkitIsFullScreen	||
							document.mozFullScreen;
		
		if(typeof isFullScreen == 'undefined') {
			isFullScreen = false;
		}
		
		return isFullScreen;
	}
	
	this.onFullScreenChange = function(event) {
	}
	
	this._onFullScreenChange = function(event) {
		parent.onFullScreenChange();
	}
	
	this._setHTML5Features = function() {
		document.cancelFullScreen = document.cancelFullScreen ||
									document.webkitCancelFullScreen ||
									document.mozCancelFullScreen;
		
		navigator.pointer = navigator.pointer ||
							navigator.webkitPointer;
							
		document.exitPointerLock = 	document.exitPointerLock ||
									document.mozExitPointerLock ||
									document.webkitExitPointerLock;
	}
	
	this._enterFullScreen = function() {
		parent.bindElement.requestFullScreen = 	parent.bindElement.requestFullScreen ||
												parent.bindElement.webkitRequestFullScreen ||
												parent.bindElement.mozRequestFullScreen;
									
		if(!parent.bindElement.requestFullScreen) {
			alert('Votre navigateur ne supporte pas le mode plein écran, il est temps de passer à un plus récent ;)');
			return;
		}
		
		if(!parent.isFullScreen()) {
			parent.mouse.pause = true;
			setTimeout(function() {
				parent.mouse.pause = false;
			}, 200);
			
			parent.bindElement.requestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	}
	
	this.init();
}

var mouseController = function() {
	var parent = this;
	
	this.init = function() {
		parent.bindElement = document.body;
		
		parent.preventDefaultAction = false;
		parent.pause = false;
		parent.locked = false;
		parent.x = 0;
		parent.y = 0;
		parent.oldX = 0;
		parent.oldY = 0;
		parent.wheel = 0;
		parent.button = new Array();
		
			// buttonList
		parent.buttonList = new Array();
		parent.buttonList[0] = 'LEFT';
		parent.buttonList[1] = 'CENTER';
		parent.buttonList[2] = 'RIGHT';
		
		$(parent.bindElement).unbind('mousedown', parent._onmousedown);
		$(parent.bindElement).bind('mousedown', parent._onmousedown);
		
		$(parent.bindElement).unbind('mouseup', parent._onmouseup);
		$(parent.bindElement).bind('mouseup', parent._onmouseup);
		
		$(parent.bindElement).unbind('mousemove', parent._onmousemove);
		$(parent.bindElement).bind('mousemove', parent._onmousemove);
		
		$(parent.bindElement).unbind('mousewheel DOMMouseScroll', parent._onmousewheel);
		$(parent.bindElement).bind('mousewheel DOMMouseScroll', parent._onmousewheel);
		
		document.addEventListener('pointerlockchange', parent._pointerLockChange, false);
		document.addEventListener('mozpointerlockchange', parent._pointerLockChange, false);
		document.addEventListener('webkitpointerlockchange', parent._pointerLockChange, false);
		
	}
	
	this.lock = function() {
		if(inputs.isFullScreen()) {
			if(!parent.isLocked()) {
				if(navigator.pointer) {	// chrome
							navigator.pointer.lock(parent.bindElement, parent._lockSuccess, parent._lockError);
				} else { //firefox
					parent.bindElement.requestPointerLock = 	parent.bindElement.requestPointerLock	||  
																parent.bindElement.mozRequestPointerLock ||  
																parent.bindElement.webkitRequestPointerLock;											
					parent.bindElement.requestPointerLock();
				}
			}
		} else {
			console.log('Vous devez être en plein écran pour activer le mouseLock');
		}
	}
	
	this.unlock = function() {
		if(navigator.pointer) {
			if(parent.isLocked()) {
				navigator.pointer.unlock();
			}
		} else {
			document.exitPointerLock();
		}
	}
	
	this.isLocked = function() {
		if(navigator.pointer) {
			return navigator.pointer.isLocked;
		} else {
			
			document.pointerLockElement = 	document.pointerLockElement    ||
											document.mozPointerLockElement ||
											document.webkitPointerLockElement;
											
			if(typeof document.pointerLockElement != 'undefined' && parent.locked) {
				return true;
			} else {
				return false;
			}
		}
	}
	
	
	this._lockSuccess = function() {
		console.log('mouseLock activé');
	}
	
	this._lockError = function(event) {
		console.log('Impossible d\'activer le mouseLock', event);
	}
	
	this._pointerLockChange = function() {
		if(parent.locked) {
			parent.locked = false;
		} else {
			parent.locked = true;
		}
	}
	
	
	this.getMovement = function() {
		var mouse = new Array();
		mouse.movementX = parent.movementX;
		mouse.movementY = parent.movementY;
		
		parent.movementX = 0;
		parent.movementY = 0;
		
		return mouse;
		
	}
	
	this.getWheel = function() {
		var wheel = parent.wheel;
		parent.wheel = 0;
		return wheel;
		
	}
	
	
	this._onmousedown = function(event) {
		if(parent.pause) { return ; }
		
		parent.button[event.button] = true;
		parent.button[parent.buttonList[event.button]] = true;
		
		parent._onmousemove(event);
		
		if(parent.preventDefaultAction) {
			event.preventDefault();
			return false;
		}
	}
	
	this._onmouseup = function(event) {	
		parent.button[event.button] = false;
		parent.button[parent.buttonList[event.button]] = false;
		
		parent._onmousemove(event);
		
		if(parent.preventDefaultAction) {
			event.preventDefault();
			return false;
		}
	}
	
	this._onmousemove = function(event) {
		if(parent.pause) { return ; }
		
		parent.oldX = parent.x;
		parent.oldY = parent.y;
		parent.x = event.clientX + document.body.scrollLeft;
		parent.y = event.clientY + document.body.scrollTop;
		
		if(parent.isLocked()) {
			var movementX = 	event.originalEvent.movementX ||
								event.originalEvent.mozMovementX ||
								event.originalEvent.webkitMovementX;
			if(typeof movementX != 'undefined') { parent.movementX = movementX; }
			
			var movementY = 	event.originalEvent.movementY ||
								event.originalEvent.mozMovementY ||
								event.originalEvent.webkitMovementY;
			if(typeof movementY != 'undefined') { parent.movementY = movementY; }

		} else {
			parent.movementX = parent.x - parent.oldX;
			parent.movementY = parent.y - parent.oldY;
		}
	}
	
	this._onmousewheel = function(event) {
		if(parent.pause) { return ; }
		
		var delta = 0;
					
		if(event.wheelDelta) {
			delta = event.wheelDelta / 120;
		} else if (event.detail) {
			delta = -event.detail / 3;
		}
		
		parent.wheel = delta;
		
		if(parent.preventDefaultAction) {
			event.preventDefault();
			return false;
		}
	}
	
	this.init();
}

var keyboardController = function() {
	var parent = this;
	
	this.init = function() {
		parent.bindElement = document.body;
		
		parent.key = new Array();
		parent.preventDefaultAction = false;
		parent.isGameInputsEnabled = false;
		
			// keyList
		parent.keyList = new Array();
		parent.keyList[8] = 'BACKSPACE';
		parent.keyList[9] = 'TAB';
		parent.keyList[13] = 'ENTER';
		parent.keyList[16] = 'MAJ';
		parent.keyList[17] = 'CTRL';
		parent.keyList[18] = 'ALT';
		parent.keyList[20] = 'CAPS_LOCK';
		parent.keyList[32] = 'SPACE';
		parent.keyList[33] = 'PAGE_UP';
		parent.keyList[34] = 'PAGE_DOWN';
		parent.keyList[35] = 'END';
		parent.keyList[36] = 'HOME';
		parent.keyList[37] = 'LEFT';
		parent.keyList[38] = 'UP';
		parent.keyList[39] = 'RIGHT';
		parent.keyList[40] = 'DOWN';
		parent.keyList[42] = '*';
		parent.keyList[45] = 'INSERT';
		parent.keyList[46] = 'DELETE';
		parent.keyList[47] = '/';
		parent.keyList[48] = '0';
		parent.keyList[49] = '1';
		parent.keyList[50] = '2';
		parent.keyList[51] = '3';
		parent.keyList[52] = '4';
		parent.keyList[53] = '5';
		parent.keyList[54] = '6';
		parent.keyList[55] = '7';
		parent.keyList[56] = '8';
		parent.keyList[57] = '9';
		parent.keyList[65] = 'A';
		parent.keyList[66] = 'B';
		parent.keyList[67] = 'C';
		parent.keyList[68] = 'D';
		parent.keyList[69] = 'E';
		parent.keyList[70] = 'F';
		parent.keyList[71] = 'G';
		parent.keyList[72] = 'H';
		parent.keyList[73] = 'I';
		parent.keyList[74] = 'J';
		parent.keyList[75] = 'K';
		parent.keyList[76] = 'L';
		parent.keyList[77] = 'M';
		parent.keyList[78] = 'N';
		parent.keyList[79] = 'O';
		parent.keyList[80] = 'P';
		parent.keyList[81] = 'Q';
		parent.keyList[82] = 'R';
		parent.keyList[83] = 'S';
		parent.keyList[84] = 'T';
		parent.keyList[85] = 'U';
		parent.keyList[86] = 'V';
		parent.keyList[87] = 'W';
		parent.keyList[88] = 'X';
		parent.keyList[89] = 'Y';
		parent.keyList[90] = 'Z';
		parent.keyList[91] = 'WINDOWS';
		parent.keyList[93] = 'CONTEXT_MENU';
		parent.keyList[96] = '0';
		parent.keyList[97] = '1';
		parent.keyList[98] = '2';
		parent.keyList[99] = '3';
		parent.keyList[100] = '4';
		parent.keyList[101] = '5';
		parent.keyList[102] = '6';
		parent.keyList[103] = '7';
		parent.keyList[104] = '8';
		parent.keyList[105] = '9';
		parent.keyList[107] = '+';
		parent.keyList[109] = '-';
		parent.keyList[110] = '.';
		parent.keyList[112] = 'F1';
		parent.keyList[113] = 'F2';
		parent.keyList[114] = 'F3';
		parent.keyList[115] = 'F4';
		parent.keyList[116] = 'F5';
		parent.keyList[117] = 'F6';
		parent.keyList[118] = 'F7';
		parent.keyList[119] = 'F8';
		parent.keyList[120] = 'F9';
		parent.keyList[121] = 'F10';
		parent.keyList[122] = 'F11';
		parent.keyList[123] = 'F12';
		parent.keyList[144] = 'NUM_LOCK';
		
		$(parent.bindElement).bind('keydown', parent._onkeydown);
		$(parent.bindElement).bind('keyup', parent._onkeyup);
	}
	
	this.enableGameInputs = function(language) {
		if(typeof language == 'undefined') { var language = getNavigatorLanguage(); }
		
		parent.gameKey = new Array();
		parent.gameKeyList = new Array();
		parent.isGameInputsEnabled = true;
		
		switch(language) {
			default:
			case 'en':
			case 'ch':
				parent.setGameKey('UP', ['W', 'UP']);
				parent.setGameKey('DOWN', ['S', 'DOWN']);
				parent.setGameKey('LEFT', ['A', 'LEFT']);
				parent.setGameKey('RIGHT', ['D', 'RIGHT']);
			break;
			case 'fr':
				parent.setGameKey('UP', ['Z', 'UP']);
				parent.setGameKey('DOWN', ['S', 'DOWN']);
				parent.setGameKey('LEFT', ['Q', 'LEFT']);
				parent.setGameKey('RIGHT', ['D', 'RIGHT']);
			break;
		}
		
		parent.setGameKey('JUMP', ['SPACE']);
	}
	
	this.setGameKey = function(keyName, linkedKeyNames) {
		if(typeof linkedKeyNames != 'object') { linkedKeyNames = [linkedKeyNames]; }
		
		for(var i = 0; i < linkedKeyNames.length; i++) {
			var linkedKeyName = linkedKeyNames[i];
			
			if(typeof parent.gameKeyList[linkedKeyName] == 'undefined') {
				parent.gameKeyList[linkedKeyName] = new Array();
			}
			
			parent.gameKeyList[linkedKeyName].push(keyName);
		}
	}
	
	this._onkeydown = function(event) {
		//alert(event.keyCode);
		
		parent.key[event.keyCode] = true;
		parent.key[parent.keyList[event.keyCode]] = true;
		
		if(parent.isGameInputsEnabled) { 
			var keyList = parent.gameKeyList[parent.keyList[event.keyCode]];
			if(typeof keyList != 'undefined') {
				for(var i = 0; i < keyList.length; i++) {
					parent.gameKey[keyList[i]] = true;
				}
			}
		}
		
		if(parent.preventDefaultAction) {
			event.preventDefault();
			return false;
		}
	}
	
	this._onkeyup = function(event) {
		parent.key[event.keyCode] = false;
		parent.key[parent.keyList[event.keyCode]] = false;
		
		if(parent.isGameInputsEnabled) { 
			var keyList = parent.gameKeyList[parent.keyList[event.keyCode]];
			if(typeof keyList != 'undefined') {
				for(var i = 0; i < keyList.length; i++) {
					parent.gameKey[keyList[i]] = false;
				}
			}
		}
		
		if(parent.preventDefaultAction) {
			event.preventDefault();
			return false;
		}
	}
	
	
	this.init();
}


var gamepadController = function() {
	var parent = this;
	
	this.enable = function() {
		parent.enabled = true;
		parent.padNumber = 4;
		parent[0] = new Gamepad();
		
		if(parent.canPlugGamepad()) {
			for(var i = 1; i < parent.padNumber; i++) {
				parent[i] = new Gamepad();
			}
			
			parent.timer = setInterval(parent._refreshPads, 1000);
		}
	}
	
	this.disable = function() {
		parent.enabled = false;
		clearInterval(parent.timer);
	}
	
	this.canPlugGamepad = function() {
		if(parent[0].controller) {
			return true;
		} else {
			return false;
		}
	}

	this.onconnect = function(gamepad) {
		console.log('Manette connectée', gamepad.controller.getDevice());
	}
	
	this.ondisconnect = function(gamepad) {
		console.log('Manette deconnectée', gamepad.controller.getDevice());
	}
	
	this._refreshPads = function() {
		for(var i = 0; i < parent.padNumber; i++) {
		
			var pad = parent[i];
			
			if(typeof pad.controller.setDevice != 'undefined') {
			
				var deviceConnected = pad.controller.setDevice(i);
				
				if(!pad.connected && deviceConnected) {
					pad._connect();
					parent.onconnect(pad);
				}
				
				if(pad.connected && !deviceConnected) {
					pad._disconnect();
					parent.ondisconnect(pad);
				}
			}
		}
	}
}

var Gamepad = function() {
	var parent = this;
	
	this.init = function() {
		parent.controller = parent._initPlugIn();
		parent.connected = false;
	}
	
	this.getProductName = function() {
		return parent.controller.getProductName();
	}
	
	this.isConnected = function() {
		return parent.connected;
	}
	
	this.degToRad = function(degrees) {
		return degrees * Math.PI / 180;
	}
	
	this.radToDeg = function(radians) {
		return radians * 180 / Math.PI;
	}
	
	
	this._refreshButtonList = function() {
		var buttonsSum = parent.controller.buttons;
		
		for(var i = 11; i >= 0; i--) {
			var rest = buttonsSum % Math.pow(2, i);
			
			if(rest != buttonsSum) {
				parent.button[i] = true;
				buttonsSum = rest;
			} else {
				parent.button[i] = false;
			}
		}
	}
	
	this._refreshCross = function() {
		var angle = parent.controller.pov;
		
		parent.cross.up = false;
		parent.cross.down = false;
		parent.cross.right = false;
		parent.cross.left = false;
		
		if(angle == 65535) {
			angle = 0;
		} else {
			angle = angle / 100;
			var rest = angle % 180;
			
			if(rest == angle) {
				angle = -angle;
			} else {
				angle = 180 - rest;
			}
			
			if(angle <= 45 && angle >= -45) { parent.cross.up = true; }
			if(angle >= 135 || angle <= -135) { parent.cross.down = true; }
			if(angle >= -135 && angle <= -45) { parent.cross.right = true; }
			if(angle >= 45 && angle <= 135) { parent.cross.left = true; }
		}
		
		parent.cross.angle = angle;
		parent.cross.radAngle = parent.degToRad(angle);
		
	}
	
	this._connect = function() {
		parent.connected = true;
		
		parent.button = new Array();
		parent.cross = new Array();
		
		parent.stick = new Array();
		parent.stick[0] = new Stick(parent.controller, 0);
		parent.stick[1] = new Stick(parent.controller, 1);
		
		parent.timer = setInterval(function() {
			parent._refreshButtonList();
			parent._refreshCross();
		}, 40);
	}
	
	this._disconnect = function() {
		parent.connected = false;
		
		parent.button = new Array();
		parent.cross = new Array();
		
		for(var i = 0; i < parent.stick.length; i++) {
			parent.stick[i]._stop();
		}
		
		parent.stick = new Array();
		
		clearInterval(parent.timer);
	}
	
	this._initPlugIn = function() {	
		var ctrlIE = document.createElement("object");
		if(ctrlIE) {
			try {
				ctrlIE.classid = "CLSID:3AE9ED90-4B59-47A0-873B-7B71554B3C3E";
				if(ctrlIE.setDevice(0) != null) {
					return ctrlIE;
				}
			} catch(e) {
			}
		}
		
		
		
		var ctrlFF = document.createElement("embed");
		if(ctrlFF) {
			if(navigator && navigator.plugins) {
				var found = false;
				for(var n = 0; n < navigator.plugins.length; n++) {
						if(navigator.plugins[n].name.indexOf("Joystick") != -1) {
							found = true;
							break;
						}
				}
				
				if(!found) {
					return null;
				}
			}
			
			try {
					ctrlFF.type = "application/x-vnd.numfum-joystick";
					ctrlFF.width  = 0;
					ctrlFF.height = 0;
					
					document.body.appendChild(ctrlFF, document.body);
					
					return ctrlFF;
					
			} catch (e) {
			}
			
			document.body.removeChild(ctrlFF);
		}
		
		return null;
	}
	
	this.init();
}

var Stick = function(controller, number) {
	var parent = this;
	
	this.init = function(controller, number) {
		parent.controller = controller;
		parent.number = number;
		
		parent.center = 32768;
		parent.deadzone = 0.1;
		
		parent.x = 0;
		parent.y = 0;
		parent.trueX = 0;
		parent.trueY = 0;
		parent.angle = 0;
		parent.radAngle = 0;
		
		parent.timer = setInterval(parent._refresh, 40);
	}
	
	this._refresh = function() {
		switch(parent.number) {
			case 0:
				var x = parent.controller.x;
				var y = parent.controller.y;
			break;
			case 1:
				var x = parent.controller.r;
				var y = parent.controller.z;
			break;
			case 2:
				var x = parent.controller.u;
				var y = parent.controller.v;
			break;	
		}
		
	
		if(typeof x == 'undefined') { x = parent.center; }
		if(typeof y == 'undefined') { y = parent.center; }
		
		parent.trueX = (x - parent.center) / parent.center;
		parent.trueY = -(y - parent.center) / parent.center;
		
		parent.x = parent.trueX;
		if(Math.abs(parent.x) < parent.deadzone) { parent.x = 0;}
		parent.y = parent.trueY;
		if(Math.abs(parent.y) < parent.deadzone) { parent.y = 0;}
		
		if(parent.y != 0) {
			var angle = -parent.radToDeg(Math.atan(parent.x / parent.y));
			
			if(parent.y < 0) {
				if(parent.x < 0) {
					angle += 180;
				} else {
					angle -= 180;
				}
			}
		} else if(parent.x !=0) {
			if(parent.x < 0) {
				var angle = 90;
			} else {
				var angle = -90;
			}
			
		} else {
			var angle = 0;
		} 
		
		parent.angle = angle;
		parent.radAngle = parent.degToRad(angle);
		
		//console.log(parent.angle);
	}
	
	this._stop = function() {
		clearInterval(parent.timer);
	}
	
	this.degToRad = function(degrees) {
		return degrees * Math.PI / 180;
	}
	
	this.radToDeg = function(radians) {
		return radians * 180 / Math.PI;
	}
	
	
	this.init(controller, number);
}


var inputs = null;

function getNavigatorLanguage() {
	var language = "en";
	
	if(navigator.language) {
		language = navigator.language.toLowerCase().substring(0, 2);
	} else if (navigator.userLanguage) {
		language = navigator.userLanguage.toLowerCase().substring(0, 2);
	} else if(navigator.userAgent.indexOf("[") != -1) {
		var start = navigator.userAgent.indexOf("[");
		var end = navigator.userAgent.indexOf("]");
		language = navigator.userAgent.substring(start + 1, end).toLowerCase();
	}
	return language;
}

$(function() {
	if(inputs) { return; }
	inputs = new inputsController();
});