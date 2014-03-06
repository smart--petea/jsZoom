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

	var paper = Snap(settings.width, settings.height);
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
		scaleX = 0.5 * imageWidth,
		scaleY = 0.5 * imageHeight,
		deltaScale = 0.1;

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

	/* controls events */
	plusCircle.click(function() {
		imageScale += deltaScale;
		refreshImage();
	});

	minusCircle.click(function() {
		imageScale -= deltaScale;
		imageScale = imageScale < 1 ? 1 : imageScale;
		refreshImage();
	});


	var handlerAttr = {
			x: 2.2 * circleRadius,
			y: minusCircleY,
			width: viewBoxWidth - 4.4 * circleRadius,
			height: circleRadius * 1.8,
		},
		handler = new Handler(handlerAttr);

	/* functions */
	function Handler(attr) {
		var x = this.x = attr.x,
			y = this.y = attr.y,
			height = this.height = attr.height,
			width = this.width = attr.width,
			progressDelta = 2,
			progressX = x + progressDelta,
			progressWidth = width - 2 * progressDelta,
			progressHeight = 0.4 * height,
			progressY = y - progressHeight / 2;

		progress = paper.rect(progressX, progressY, progressWidth, progressHeight, 1.1),
		progress.attr({
			fill: "none",
			"stroke": "#aaaaaa",
			"stroke-width": 0.4,
		});

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
		polzunoc.transform("t10,0");

		//functionality
		frontRect.hover(function() {
			frontRect.attr({
				fill: "#dadada",
			});
		}, function() {
			frontRect.attr({
				fill: "transparent",
			});
		});
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
