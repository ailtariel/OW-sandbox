/*
隐藏功能：
1、双击开启文本输入框
2、在头像上单击鼠标切换颜色
3、ctrl+z 撤销
*/
var heroesList = [
	'ana',
	'bastion',
	'brigitte',
	'doomfist',
	'dva',
	'genji',
	'hanzo',
	'junkrat',
	'lucio',
	'mccree',
	'mei',
	'mercy',
	'moira',
	'orisa',
	'pharah',
	'reaper',
	'reinhardt',
	'roadhog',
	'soldier76',
	'sombra',
	'symmetra',
	'torbjorn',
	'tracer',
	'wrecking-ball',
	'widowmaker',
	'winston',
	'zarya',
	'zenyatta'
];
var stage;
var theMap
var theMapName;
// 获取鼠标位置
function mousePos(e)    
{
	var x,y;
	var e = e||window.event;
	return {
		x:e.clientX+document.body.scrollLeft + document.documentElement.scrollLeft,
		y:e.clientY+document.body.scrollTop + document.documentElement.scrollTop
	};
}
// 导出
function exportStage(){
	stage.draw();
	var uri = stage.toDataURL();	
	var link = document.createElement("a");
	link.download = theMap+" ("+theMapName+").png";
	link.href = uri;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	delete link;
}
// 初始化
var draw;
// 清晰度
var quality = 'low';
// 真实缩放比
var realScale = 1;
$(function(){
	parseTpl("tpl_heroes", "heroes", {heroes: heroesList});
	draw = Draw.createNew();

	setColor($('#colorInput').val());
	setLine($('#lineWidth').val());
	setFontSize($('#fontSize').val());	
	setScale($('#scale').val());

	$(document).keydown(function (event){
		if((event.keyCode == 90 || event.keyCode == 122) && event.ctrlKey) {   //alt+z
			draw.undo();
		}
	});

	$('#textDialog').keydown(function (event){
		if(event.keyCode == 13) {   //enter
			writeText();
			$('#textDialog').css('display', 'none');			
		}else if(event.keyCode == 27) {   //esc
			$('#textDialog').css('display', 'none');
		}
	});
});
function showColorpick(obj){
	$("#colorpickBtn").dropdown("toggle");
}
function zoomopen(){
	$('#zoomoutbtn').removeClass('btn-warning');
	$('#zoomoutbtn').addClass('btn-default');
	$('#zoomoutbtn').addClass('active');
	// $('#zoomoutbtn').attr('disabled', 'disabled');
	$('#zoomoutbtn').off('click', zoomopen);
	$('#zoomoutbtn').on('click', zoomclose);
	$('body').css('cursor', 'crosshair');
	draw.background.on('mousedown', function(event){
		zoomout(event);
	});
}
function zoomclose(){
	$('#zoomoutbtn').removeClass('btn-default');
	$('#zoomoutbtn').addClass('btn-warning');
	$('#zoomoutbtn').removeClass('active');
	// $('#zoomoutbtn').attr('disabled', '');
	$('#zoomoutbtn').off('click', zoomclose);
	$('#zoomoutbtn').on('click', zoomopen);
	$('body').css('cursor', 'default');
	draw.background.off('mousedown');
	draw.background.on('mousedown', function(event){
			draw.start(event);
		});
}
function zoomout(event){
	draw.zoomout(event);
	// zoomclose();
}
// 设置画笔
function setPencil(type, name){
	$('#pencil').children('a:first-child').html(name+'<span class="caret"></span>');
	return draw.setPencil(type);
}
// 设置颜色
function setColor(color){
	$('#colorcardsample').css('background-color', color);
	$('#colorInput').val(color);
	$('#colorInput').blur();
	return draw.setColor(color);
}
function setMode(mode, name){
	quality = mode;
	$('#modeSelect').html(name+'<span class="caret"></span>');
	return;
}
// 设置线条宽度
function setLine(width){
	$('#lineWidth').blur();
	return draw.setLine(width);
}
function setFont(font){
	return draw.setFont(font);
}
function setFontSize(fontsize){
	$('#fontSize').blur();
	return draw.setFontSize(fontsize);
}
function setScale(scale){
	$('#scale').blur();
	return draw.setScale(scale);
}
// 开启文本输入框
function openTextInput(ev){	
	var x = ev.evt.clientX;
	var y = ev.evt.clientY + $(document).scrollTop();

	var stagePoint = stage.getPointerPosition();
	$('#textDialog').css('top', y+"px");
	$('#textDialog').css('left', x+"px");
	$('#text').val('');
	$('#textDialog').css('display', '');
	$('#text').attr('x', stagePoint.x);
	$('#text').attr('y', stagePoint.y);
	$('#text').focus();
}
// 写入文本
function writeText(){
	var text = $('#text').val();
	var x = $('#text').attr('x');
	var y = $('#text').attr('y');
	draw.writeText({x: x, y: y}, text);
	$('#textDialog').css('display', 'none');
}
// 加载地图并初始化stage
function initMap(name, mapname){
	theMap = name;
	theMapName = mapname;
	$('#mapPicker').html(mapname+'<span class="caret"></span>');
	$('#mapPicker').attr('data-map', name);

	$('#map').html('');
	var $tmp = $('<img />').addClass('hiddenmap');
	$('#map').append($tmp);
	if( quality == 'high' ){
		var url = "plain/"+name+"_plain.png";
	}else{
		var url = "maps/"+name+"_map.png";
	}
	// 获取地图尺寸
	var mapImg = {w:0, h:0};
	$(".hiddenmap").attr("src", url).on('load', function() {
		var s = this.width / this.height;
		mapImg.w = Math.min(1000, this.width);
		mapImg.h = mapImg.w / s;
		realScale = mapImg.w / this.width;
		// setScale($('#scale').val()*realScale);

		$('#map').css('width', mapImg.w);

		stage = new Konva.Stage({
			container: 'map',
			width: mapImg.w,
			height: mapImg.h
		});

		draw.stage = stage;
		var drawCanvas = new Konva.Layer();	
		draw.canvas = drawCanvas;
		var drawBgcover = new Konva.Layer();	
		draw.bgcover = drawBgcover;
		draw.bgimg = url;
		

		var layer = new Konva.Layer();
		layer.on('mousedown', function(event){
			draw.start(event);
		});
		layer.on('mousemove', function(event){
			draw.move(event);
		});
		layer.on('mouseup', function(event){
			draw.end(event);
		});
		layer.on('dblclick', function(event){
			openTextInput(event);
		});
		drawCanvas.on('mousedown', function(event){
			draw.start(event);
		});
		drawCanvas.on('mousemove', function(event){
			draw.move(event);
		});
		drawCanvas.on('mouseup', function(event){
			draw.end(event);
		});
		drawCanvas.on('dblclick', function(event){
			openTextInput(event);
		});
		// layer.on('mouseout', function(event){
		// 	draw.end(event);
		// });
		draw.background = layer;
		stage.add(layer);
		stage.add(drawBgcover);
		stage.add(drawCanvas);
		Konva.Image.fromURL(url, function(image){
			image.setAttrs({
				width: mapImg.w,
				height: mapImg.h
			});
			layer.add(image);
			layer.draw();
		});
	});	
}
function initHeroes(){
	for (var i = 0; i < heroesList.length; i++) {
	 	var $li = $('<li></li>');
	 	var $img = $('<img />');
	 	$img.attr('src', 'heroes/'+heroesList[i]+'.png');
	 	$li.append($img);
	 	$('#heroes').append($li);
	 } 
}
function enableDrag(jobj){
	jobj.addClass('drag');
	jobj.removeClass('lock');
	jobj.attr('draggable', true);

	return;
}
function disableDrag(jobj){
	jobj.addClass('lock');
	jobj.removeClass('drag');
	jobj.attr('draggable', false);

	return;
}
function drag(ev)
{

}
function drop(ev)
{
	ev.preventDefault();
	ev.stopPropagation();
}
function allowDrop(ev)
{
	ev.preventDefault();
	ev.stopPropagation();
}
function dragEnd(ev)
{
	// disableDrag($(ev.target));
	// 位置
	var x = ev.screenX - $('#map').offset().left - 15;
	var y = ev.screenY - $('#map').offset().top - 71 + $(document).scrollTop();
	// var pointer = stage.getPointerPosition();
	// var x = pointer.x;
	// var y = pointer.x;
	// 配置
	var layer = new Konva.Layer();
	var iconSet = {
		x: x,
		y: y,
		radius: 25,
		stroke: '#ff5656',
		strokeWidth: 4,
		fillPatternRepeat: 'no-repeat',
		fillPatternScale: {
			x: 0.5,
			y: 0.5
		},
		fillPatternX: -25,
		fillPatternY: -25,
	};
	var circle = new Konva.Circle(iconSet);

	function __process(){
		// 填充图片
		circle.fillPatternImage(imageObj);

		// 双击销毁
		var timer = null;
		circle.on('dblclick', function(){
			clearTimeout(timer);
			circle.destroy();
			stage.draw();
		});

		// 单击切换颜色
		circle.on('click', function(ev){
			clearTimeout(timer);
			timer = setTimeout(function(){
				switch(iconSet.stroke.toLowerCase()){
					case '#ff5656':
						iconSet.stroke = '#31d1ff';
						break;
					case '#31d1ff':
						iconSet.stroke = '#ffffff';
						break;
					case '#ffffff':
						iconSet.stroke = '#ff5656';
						break;
					default:
						iconSet.stroke = '#ffffff';
						break;
				}
				circle.destroy();
				circle = new Konva.Circle(iconSet);
				__process();
				stage.draw();
			}, 300);
		});

		// add the shape to the layer
		layer.add(circle);
		layer.draggable(true);
		// add the layer to the stage
		stage.add(layer);
	}

	// 处理
	var imageObj = new Image();
	imageObj.onload = function(){__process();};
	imageObj.src = $(ev.target).attr('src');
}

/*
	替换模板，并将模板置入dom
	
	&& 依赖: juicer.js
*/
function parseTpl(tplId, targetId, data){
	// 替换模板
	var tpl = document.getElementById(tplId);
	if( tpl ){
		var html = juicer(tpl.innerHTML, data);
	}else{
		log("[Error]: template [#"+tplId+"] not existsed")
	}

	// 将模板从template标签中取出
	var dom = document.getElementById(targetId);
	if( dom ){
		dom.innerHTML = html;
	}else{
		log("[Error]: target DOM [#"+targetId+"] not existsed")
	}
}