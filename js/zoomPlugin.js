jQuery.fn.zoom = function(settings) {
	if(!settings.src) throw "src is not setted";
	var $ = jQuery;
	var defaultSetting = {
		scale: 1.5, //scale factory
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
		progressWidth = viewBoxWidth - 4.4 * circleRadius,
		signStrokeWidth	= 2,
		progressHeight = signStrokeWidth * 2,
		progress = paper.rect(2.2 * circleRadius, minusCircleY - progressHeight / 2, progressWidth, progressHeight, 1.1);

	progress.attr({
		fill: "none",
		"stroke": "#aaaaaa",
		"stroke-width": 0.4,
	});

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

	/* functions */
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
