/*
	涂鸦
*/
var Draw = {
	createNew: function(){
		var draw = {};
		draw.stage = null;
		draw.background = null;
		draw.bgimg = null;
		draw.bgcover = null;
		draw.canvas = null;
		draw.pencil = "line";
		draw.isDraw = true;
		draw.startPoint = null;
		draw.endPoint = null;
		draw.color = '#ff0000';
		draw.lineWidth = 4;
		draw.fontSize = 14;
		draw.font = 'Microsoft YaHei';
		draw.tmp = null;
		draw.sim = null;
		draw.history = [];
		draw.linePath = [];
		draw.now = 0;
		draw.scale = 3;

		draw.setPencil = function(type){
			this.pencil = type;
		}
		draw.setColor = function(color){
			this.color = color;
		}
		draw.setLine = function(width){
			this.lineWidth = width;
		}
		draw.setFont = function(font){
			this.font = font;
		}
		draw.setFontSize = function(fontSize){
			this.fontSize = fontSize;
		}
		draw.setScale = function(scale){
			this.scale = scale;
		}
		draw.zoomout = function(e){			
			var imageObj = new Image();
			imageObj.src = this.bgimg;
			var img = {w: imageObj.width, h: imageObj.height};
			var p = this.cursor();
			// 缩放原图，并等比例置于鼠标位置
			var cover = new Konva.Image({
				x: p.x * (1-draw.scale),
				y: p.y * (1-draw.scale),
				image: imageObj,
				width: img.w*this.scale*realScale,
				height: img.h*this.scale*realScale,
				// scale: 2
			});
			this.background.add(cover);
			// 裁切出w=w,h=500的区域
			// cover.crop({
			// 	x: 0,
			// 	y: 0,
			// 	width: img.w,
			// 	height: 500
			// });
			// imageObj.onload = function() {
			

			// add the shape to the layer
			
			this.background.draw();
			this.history.push(cover);
			// }
			// console.log(img);
		}
		draw.start = function(e){
			this.draw = true;
			this.startPoint = this.cursor();
			this.now = $.now();
		}
		draw.move = function(e){
			if( this.draw == true ){
				this.endPoint = this.cursor();
				switch(this.pencil){
					case 'line':
						this.clearSim();
						this.sim = this.__line();
						this.startPoint = this.cursor();
						break;
					case 'arrow':
						this.clearSim();
						this.sim = this.__arrow();
						break;
					case 'rect':
						this.clearSim();
						this.sim = this.__rect();
						break;
					case 'arc':
						this.clearSim();
						this.sim = this.__arc();
						break;
					default:
						break;
				}		
			}
		}
		draw.end = function(e){
			// 如果间隔时间太短则视为双击
			if( $.now() - this.now < 150){
				this.clearSim();
				this.draw = false
				this.startPoint = null;
				this.linePath = [];
				return;
			}
			if( this.draw == true ){
				switch(this.pencil){
					case 'line':
						this.clearSim();
						this.history.push(this.__line());
						this.linePath = [];
						break;
					case 'arrow':
						this.clearSim();
						this.history.push(this.__arrow());
						break;
					case 'rect':
						this.clearSim();
						this.history.push(this.__rect());
						break;
					case 'arc':
						this.clearSim();
						this.history.push(this.__arc());
						break;
					default:
						break;
				}		
			}
			this.draw = false;
		}
		draw.undo = function(){
			if( this.history.length > 0 ){
				var l = this.history.pop();
				l.destroy();
				this.stage.draw();
			}
		}
		draw.clear = function(){
			this.stage.clear();
			initMap(theMap, theMapName);
		}
		draw.clearSim = function(){
			if( this.sim ){
				this.sim.destroy();
				this.stage.draw();
			}
		}		
		draw.cursor = function(){
			return this.stage.getPointerPosition();
		}
		draw.writeText = function(point, text){
			var t = new Konva.Text({
				x: point.x,
				y: point.y,
				text: text,
				fontSize: this.fontSize,
				fontFamily: this.font,
				fill: this.color
			});

			this.canvas.add(t);
			this.stage.add(this.canvas);
			this.history.push(t);

			return t;
		}
		draw.__line = function(){
			if( this.linePath.length == 0 ){
				this.linePath.push(this.startPoint.x);
				this.linePath.push(this.startPoint.y);
			}else{
				this.linePath.push(this.endPoint.x);
				this.linePath.push(this.endPoint.y);
			}
			var line = new Konva.Line({
				points: this.linePath,
				stroke: this.color,
				strokeWidth: this.lineWidth,
				lineCap: 'round',
				lineJoin: 'round'
			});

			this.canvas.add(line);
			this.canvas.draw();

			return line;
		}
		draw.__arrow = function(){
			if( this.lineWidth >= 4 ){
				var pointer = Math.max(10, this.lineWidth);
			}else if( this.lineWidth == 1 ){
				var pointer = 3;
			}else{
				var pointer = 6;
			}
			var arrow = new Konva.Arrow({
				points: [this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y],
				pointerLength: pointer,
				pointerWidth: pointer,
				stroke: this.color,
				strokeWidth: this.lineWidth,
				// lineCap: 'round',
				// lineJoin: 'round',
			});

			this.canvas.add(arrow);
			this.canvas.draw();

			return arrow;
		}
		draw.__rect = function(){	
			var start = {x:0, y:0};
			if( this.endPoint.x > this.startPoint.x ){
				start.x = this.startPoint.x;
			}else{
				start.x = this.endPoint.x;
			}
			if( this.endPoint.y > this.startPoint.y ){
				start.y = this.startPoint.y;
			}else{
				start.y = this.endPoint.y;
			}
			var rect = new Konva.Rect({
				x: start.x,
				y: start.y,
				width: Math.abs(this.startPoint.x - this.endPoint.x),
				height: Math.abs(this.startPoint.y - this.endPoint.y),
				stroke: this.color,
				strokeWidth: this.lineWidth
			});

			this.canvas.add(rect);
			this.canvas.draw();

			return rect;
		}
		draw.__arc = function(){
			var radius = {
				x: Math.abs(this.startPoint.x - this.endPoint.x),
				y: Math.abs(this.startPoint.y - this.endPoint.y)
			};
			// 起点为圆心
			// var center = {x:0, y:0};
			// if( this.endPoint.x > this.startPoint.x ){
			// 	center.x = this.startPoint.x + radius.x/2;
			// }else{
			// 	center.x = this.endPoint.x + radius.x/2;
			// }
			// if( this.endPoint.y > this.startPoint.y ){
			// 	center.y = this.startPoint.y + radius.y/2;
			// }else{
			// 	center.y = this.endPoint.y + radius.y/2;
			// }
			// 起点本来就是圆心
			var center = {x:this.startPoint.x, y:this.startPoint.y};

			var ellipse = new Konva.Ellipse({
				x: center.x,
				y: center.y,
				radius:{
					x: Math.abs(this.startPoint.x - this.endPoint.x),
					y: Math.abs(this.startPoint.y - this.endPoint.y)
				},
				stroke: this.color,
				strokeWidth: this.lineWidth
			});

			this.canvas.add(ellipse);
			this.canvas.draw();

			return ellipse;
		}
		return draw;
	}
}