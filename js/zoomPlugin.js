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
		imageScale = settings.scale;

	image = paper.image(settings.src, imageX, imageY, imageWidth, imageHeight);
	image.transform("s" + imageScale);

	var clip = paper.rect(imageX, imageY, imageWidth, imageHeight);
	clip.attr({
		fill: "none",
		'stroke-width': 0,
	});

	image.attr({
		'clip-path': clip,
	});

	image.mousemove(function(e) {
		var imgWidth = this.attr('width');
		var imgHeight = this.attr('height');
	});
}
