ropeDemo.rope = {
	items: [],
	nbItems: 20,
	length: +400,
	width: 8,
	relaxationIterations: +5,
	coeff:+1,
	state: false,
	neon: null,
	oldCoeff: null,
	color1: '#ccc',
	color2: '#999'
};
ropeDemo.bulb = {
	width: 121,
	height: 203,
	offsetX: -59,
	offsetY: -20,
	maxRotation: 0.5
};

// one cycle - draw to screen

ropeDemo.DrawOverride = function () {

	// Draw segments

	ropeDemo.context.drawingContext.clearRect(0, 0, ropeDemo.context.size.w, ropeDemo.context.size.h);
	
	ropeDemo.context.drawingContext.beginPath();

	// loop through the items to draw
	for (var index in ropeDemo.rope.items) {

		// this item
		var item = ropeDemo.rope.items[index];

		// first segment
		if (index == 0) {
			ropeDemo.context.drawingContext.moveTo(item.x + ropeDemo.context.center.x, item.y + ropeDemo.context.center.y);
		
		// draw the rope
		} else if (item.isRope == true){

			ropeDemo.context.drawingContext.lineTo(item.x + ropeDemo.context.center.x, item.y + ropeDemo.context.center.y);
			   
		// draw the bulb
		} else if (item.isRope == false){

			var item0 = ropeDemo.rope.items[index - (ropeDemo.rope.nbItems - 1)];
			ropeDemo.rope.coeff = (
					(item.x + ropeDemo.context.center.x) - 
					(item0.x + ropeDemo.context.center.x)
				)/(
					(item.y + ropeDemo.context.center.y) -
					(item0.y + ropeDemo.context.center.y)
				);

			//future grabbing implementation:
			//if(ropeDemo.rope.coeff > 1.5) {
			//	ropeDemo.rope.coeff = 1.5;
			//} else if(ropeDemo.rope.coeff < -1.5) {
			//	ropeDemo.rope.coeff = -1.5;
			//}
			//if(Math.abs(ropeDemo.rope.oldCoeff-ropeDemo.rope.coeff) > 0.5 ) {
			//	delta = -0.5;
			//	if(ropeDemo.rope.coeff<0) {
			//		delta = 0.5;
			//	}
			//	ropeDemo.rope.coeff = ropeDemo.rope.oldCoeff + delta; 
			//}
			//ropeDemo.rope.oldCoeff = ropeDemo.rope.coeff;
			//console.log(ropeDemo.rope.coeff );
			ropeDemo.context.drawingContext.save();
			ropeDemo.context.drawingContext.translate((item.x + ropeDemo.context.center.x), (item.y + ropeDemo.context.center.y));
			// restrict the rotation
			var rotation = ropeDemo.rope.coeff;
			if (rotation > ropeDemo.bulb.maxRotation) {
				rotation = ropeDemo.bulb.maxRotation;
			} else if (rotation < -ropeDemo.bulb.maxRotation) {
				rotation = -ropeDemo.bulb.maxRotation;
			}
			ropeDemo.context.drawingContext.rotate(-rotation);
			
			//the light
			ropeDemo.context.drawingContext.drawImage(ropeDemo.context.img0,ropeDemo.bulb.offsetX,ropeDemo.bulb.offsetY,ropeDemo.bulb.width,ropeDemo.bulb.height); 
			
			ropeDemo.context.drawingContext.restore();
				
		}
	}
	var center = ropeDemo.context.size.w * 0.5 + 20;
	var ropeRadius = ropeDemo.rope.width/2;
	var grad = ropeDemo.context.drawingContext.createLinearGradient(center - ropeRadius, 0, center + ropeRadius, 0);
	grad.addColorStop(0, ropeDemo.rope.color1);
	grad.addColorStop(1, ropeDemo.rope.color2);

	ropeDemo.context.drawingContext.strokeStyle = grad;
	ropeDemo.context.drawingContext.lineWidth = ropeDemo.rope.width;
	ropeDemo.context.drawingContext.stroke();
	ropeDemo.context.drawingContext.closePath();

};

// one cycle - calculations

ropeDemo.ThinkOverride = function () {
	
	var itemLength = ropeDemo.rope.length / ropeDemo.rope.nbItems;
	var ellapsedTime = +1 / ropeDemo.data.fps;

	 if (ropeDemo.context.isGrabbing) {
        ropeDemo.rope.items[(ropeDemo.rope.nbItems-1)].x = ropeDemo.context.mouse.x - ropeDemo.context.center.x;
        ropeDemo.rope.items[(ropeDemo.rope.nbItems-1)].y = ropeDemo.context.mouse.y - ropeDemo.context.center.y;
    }
   
	// Apply verlet integration
	for (var index in ropeDemo.rope.items) {
		var item = ropeDemo.rope.items[index];

		var old_x = item.x;
		var old_y = item.y;

		if (!item.isPinned ) {
			physic.ApplyUnitaryVerletIntegration(item, ellapsedTime, ropeDemo.data.gravity, ropeDemo.data.pixelsPerMeter);
		}

		item.old_x = old_x;
		item.old_y = old_y;
	}

	// Apply relaxation
	for (var iterations = 0; iterations < ropeDemo.rope.relaxationIterations; iterations++) {

		for (var index in ropeDemo.rope.items) {
			var item = ropeDemo.rope.items[index];

			if (!item.isPinned ) {
				if (index > +0) {
					var previous = ropeDemo.rope.items[+index - 1];
					physic.ApplyUnitaryDistanceRelaxation(item, previous, item.segmentLength);
				}
			}
		}

		for (var index in ropeDemo.rope.items) {
			var item = ropeDemo.rope.items[ropeDemo.rope.nbItems - 1 - index];

			if (!item.isPinned ) {
				if (index > 0) {
					var next = ropeDemo.rope.items[ropeDemo.rope.nbItems - index];
					physic.ApplyUnitaryDistanceRelaxation(item, next, item.segmentLength);
				}
			}
		}
	}
};
ropeDemo.playLight = function(){

}
ropeDemo.playCreak = function(){
}

ropeDemo.waitLight = function(){
	ropeDemo.playLight();
	ropeDemo.Light();
//	setTimeout(function(){ropeDemo.Light(); }, 400);
//	setTimeout(function(){ropeDemo.noLight()}, 450);
//
//	setTimeout(function(){ropeDemo.Light()},   600);
//	setTimeout(function(){ropeDemo.noLight()}, 700);
//
//	setTimeout(function(){ropeDemo.Light()},   1100);
}

ropeDemo.Light = function(){

	console.log('LIGHT ON!');

	$('.glow').css('opacity',1);

	ropeDemo.data.state = true;
	ropeDemo.context.drawingContext.beginPath();
		
	var item = ropeDemo.rope.items.slice(-1)[0];
	var item0 = ropeDemo.rope.items.slice(-9)[0];
	ropeDemo.rope.coeff = ((item.x + ropeDemo.context.center.x)- (item0.x + ropeDemo.context.center.x))/((item.y + ropeDemo.context.center.y)-(item0.y + ropeDemo.context.center.y));
	ropeDemo.context.drawingContext.save();
	ropeDemo.context.drawingContext.translate((item.x + ropeDemo.context.center.x), (item.y + ropeDemo.context.center.y));
	ropeDemo.context.drawingContext.rotate(ropeDemo.rope.coeff);
	
//	//the light cone
//	
//	ropeDemo.context.drawingContext.moveTo(item.x, item.y+170);
//	ropeDemo.context.drawingContext.lineTo(3900, 1280);
//	ropeDemo.context.drawingContext.lineTo(-3900,1280);
//	ropeDemo.context.drawingContext.lineTo(item.x, item.y+170);
//	var grd = ropeDemo.context.drawingContext.createRadialGradient(0, 0, 2, 640, 1030, 1280);
//	
//	grd.addColorStop(0, 'white');
//		// dark blue
//	grd.addColorStop(1, 'rgba(255, 255, 255, 0.6)');
//
//	// ropeDemo.context.drawingContext.fillStyle = 'rgba(255, 255, 209, 0.9)';
//	ropeDemo.context.drawingContext.fillStyle = grd;
//	ropeDemo.context.drawingContext.fill();

	ropeDemo.context.drawingContext.drawImage(ropeDemo.context.img1,ropeDemo.bulb.offsetX,ropeDemo.bulb.offsetY,ropeDemo.bulb.width,ropeDemo.bulb.height); 
	

	ropeDemo.context.drawingContext.restore();
	ropeDemo.context.drawingContext.lineWidth = 0;
	ropeDemo.context.drawingContext.closePath();
}

ropeDemo.noLight = function(){

	ropeDemo.data.state = false;


	ropeDemo.context.drawingContext.clearRect(0, 60, ropeDemo.context.size.w, ropeDemo.context.size.h);

	ropeDemo.context.drawingContext.beginPath();
	var item = ropeDemo.rope.items.slice(-1)[0];
	var item0 = ropeDemo.rope.items.slice(-9)[0];
	ropeDemo.rope.coeff = ((item.x + ropeDemo.context.center.x)- (item0.x + ropeDemo.context.center.x))/((item.y + ropeDemo.context.center.y)-(item0.y + ropeDemo.context.center.y));
	ropeDemo.context.drawingContext.save();
	ropeDemo.context.drawingContext.translate((item.x + ropeDemo.context.center.x), (item.y + ropeDemo.context.center.y));
	ropeDemo.context.drawingContext.rotate(ropeDemo.rope.coeff);
				
	ropeDemo.context.drawingContext.drawImage(ropeDemo.context.img0,ropeDemo.bulb.offsetX,ropeDemo.bulb.offsetY,ropeDemo.bulb.width,ropeDemo.bulb.height); 
	

	ropeDemo.context.drawingContext.restore();
	ropeDemo.context.drawingContext.lineWidth = 0;
	ropeDemo.context.drawingContext.closePath();

}
ropeDemo.turnOff = function(){
	ropeDemo.noLight();
}

ropeDemo.StartOverride = function () {

	ropeDemo.rope.items = [];
	var i;
	var length =  ropeDemo.rope.length / ropeDemo.rope.nbItems;
	// rope
	for (i = 0; i < ropeDemo.rope.nbItems; i++) {
		var x =  length + i;
		ropeDemo.rope.items[i] = {
			x: x+0.1,
			y: +0,
			segmentLength: length,
			isRope: true,
			old_x: x,
			old_y: +0,
			isPinned: false
		};


	}
	i = ropeDemo.rope.nbItems-1;
	// bulb
	ropeDemo.rope.items[i] = {
		x: x+0.1,
		y: +0,
		segmentLength: length,
		isRope: false,
		old_x: x,
		old_y: +0,
		isPinned: false
	};



	ropeDemo.rope.items[0].isPinned = true;
	ropeDemo.playCreak();
};