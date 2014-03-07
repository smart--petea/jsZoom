jQuery.fn.zoom = function(settings) {
	if(!settings.src) throw "src is not setted";
	var $ = jQuery;
	var defaultSetting = {
		scale: 1.5, //scale factory
		scaleMax: 4, //max scale level
		width: "100px",
		height: "100px",
	};

	settings =  $.extend(defaultSetting, settings);


	/* viewBox */
	var viewBoxX = 0,
		viewBoxY = 0,
		viewBoxWidth = 100,
		viewBoxHeight = 100;

	paper = Snap(settings.width, settings.height);
	this.append(paper.node);
	paper.node.setAttribute("viewBox", [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight].join(" "));
	paper.node.setAttribute("preserveAspectRatio", "none");

	/* image */
	var imageX = 0,
		imageY = 0,
		imageWidth = viewBoxWidth,
		imageHeight = 0.9 * viewBoxHeight,
		imageScale = settings.scale,
		scaleMax = settings.scaleMax,
		scaleMin = 1, 
		scaleX = 0.5 * imageWidth,
		scaleY = 0.5 * imageHeight,
		deltaScale = 0.1,
		realWidth = $(paper.node).width(),
		realHeight = $(paper.node).height();

	image = paper.image(settings.src, imageX, imageY, imageWidth, imageHeight);
	refreshImage();

	var clip = paper.rect(0, imageHeight, imageWidth, viewBoxHeight - imageHeight + 5);
	clip.toDefs();
	clip.attr({
		'stroke-width': 0,
	});

	var cover = paper.rect(0, 0, 1.1 * viewBoxWidth, 1.1 * viewBoxHeight).attr({
		"fill": "#fff",
		"clip-path": clip,
	});

	image.mousemove(function(e) {
		var paperNode = this.paper.node,
		    svgOffsetLeft = paperNode.offsetLeft,
			svgOffsetTop = paperNode.offsetTop,
			svgWidth = $(paperNode).width(),
			svgHeight = $(paperNode).height(),
			mouseX = e.x,
			mouseY = e.y;
		scaleX = (mouseX - svgOffsetLeft) * viewBoxWidth / svgWidth,
		scaleY = (mouseY - svgOffsetTop) * viewBoxHeight / svgHeight;

		refreshImage();
	});

	/* controls */
	var controlHeight =  0.09 * viewBoxHeight,
		circleRadius = controlHeight / 2, 
		minusCircleX = circleRadius,
		minusCircleY = viewBoxHeight - circleRadius,
		minusCircle = paper.circle(minusCircleX, minusCircleY, circleRadius),
		plusCircleX = viewBoxWidth - circleRadius,
		plusCircleY = minusCircleY,
		plusCircle =  paper.circle(plusCircleX, plusCircleY, circleRadius),
		circleColor = "#6B6A67",
		minusSign ,
		plusSign,
		signLength = 0.7 * circleRadius,
		signStrokeWidth	= 2;

	minusCircle.attr({
		fill: circleColor,
		cursor: "pointer",
	});

	plusCircle.attr({
		fill: circleColor,
		cursor: "pointer",
	});

	minusSign = paper.path([
		"M",
		minusCircleX - signLength,
		",",
		minusCircleY,
		"l",
		2 * signLength,
		",",
		0
	].join("")); //minus circle sign
	minusSign.attr({
		"stroke": "#fff",
		"stroke-width": signStrokeWidth,
		"pointer-events": "none",
	});

	plusSign = paper.path([
		"M",
		plusCircleX - signLength,
		",",
		plusCircleY,
		"l",
		2 * signLength,
		",",
		0,
		"M",
		plusCircleX,
		",",
		plusCircleY - signLength,
		"l",
		0,
		",",
		2 * signLength,
	].join(""));

	plusSign.attr({
		"stroke": "#fff",
		"stroke-width": signStrokeWidth,
		"pointer-events": "none",
	});



	var handlerAttr = {
			x: 2.2 * circleRadius,
			y: minusCircleY,
			width: viewBoxWidth - 4.4 * circleRadius,
			height: circleRadius * 1.8,
			unitsCount: (scaleMax - scaleMin) / deltaScale,
		},
		handler = new Handler(handlerAttr);
		handler.setUnit(getUnit(imageScale));
	h = handler;

	/* assamble logic */
	plusCircle.click(function() {
		imageScale += deltaScale;
		imageScale = imageScale > scaleMax ? scaleMax : imageScale;  
		h.setUnit(getUnit(imageScale));
		refreshImage();
	});

	minusCircle.click(function() {
		imageScale -= deltaScale;
		imageScale = imageScale < 1 ? 1 : imageScale;
		h.setUnit(getUnit(imageScale));
		refreshImage();
	});

	h.onChange(function(newUnit) {
		imageScale = deltaScale * newUnit + 1;
		refreshImage();
	});
	/* functions */
	function getUnit(imageScale) {
	 	return (imageScale - 1)/deltaScale;
	}

	function Handler(attr) {
		var x = this.x = attr.x,
			y = this.y = attr.y,
			unitsCount = this.unitsCount = attr.unitsCount, 
			height = this.height = attr.height,
			width = this.width = attr.width,
			progressX = x + height / 2,
			progressWidth = width - height,
			progressHeight = 0.4 * height,
			progressY = y - progressHeight / 2,
			step = progressWidth / unitsCount,
			currentX = 0;
		progress = paper.rect(progressX, progressY, progressWidth, progressHeight, 1.1),
		progress.attr({
			fill: "none",
			"stroke": "#aaaaaa",
			"stroke-width": 0.4,
		});

		/* callbacks */
		var callbacks = [];

		/* define polzunoc elements */
		var clipRect = paper.rect(x, y - height / 2, height, height, 2);
		clipRect.toDefs();


		var rect1 = paper.rect(x, y - height / 2, height , height / 2);
		rect1.attr({
			fill: "#B8AFA4",
		});


		var rect2 = paper.rect(x, y, height, height / 2);
		rect2.attr({
			fill: "#a59a8d",
		});

		var backGroup = paper.group(rect1, rect2);
		backGroup.attr({
			clipPath: clipRect,
		});

		var frontRect = clipRect.clone();
		frontRect.insertAfter(rect2);
		frontRect.attr({
			fill: "transparent",
			"stroke": "#d3d3d3",
			"stroke-width": 0.3,
			cursor: "pointer",
		});

		var polzunoc = this.polzunoc = paper.group(backGroup, frontRect);

		//functionality
		var	self = this;

		polzunoc.drag(function(relX, relY, absX, absY, e) {
			var transX = absX * viewBoxWidth/realWidth;
			moveTo(Math.floor((transX - progressX)/step));	
		});

		frontRect.hover(function() {
			frontRect.attr({
				fill: "#dadada",
			});
		}, function() {
			frontRect.attr({
				fill: "transparent",
			});
		});

		function moveTo(x, silance) {
			if(x < 0){
				x = 0;
			} else if (x > unitsCount) {
			 x = unitsCount;
			}
			console.log("x: ", x);
			console.log("unitsCount: ", unitsCount);

			polzunoc.transform([
				"t",
				x * step,
				",0",
			].join(""));

			!silance && emitChange(x);
		}

		function emitChange(newUnit) {
			for(var i = 0; i < callbacks.length; i++) callbacks[i](newUnit);
		}

		this.onChange = function(callback) {
			callbacks.push(callback);
		}

		this.setUnit = function(newUnit) {
			moveTo(newUnit, true);
		}
	}

	function refreshImage() {
		image.transform([
			"s",
			imageScale,
			",",
			imageScale,
			",",
			scaleX,
			",",
			scaleY,
		].join(""));
	}
}
