// http://stackoverflow.com/questions/32219051/how-to-convert-cartesian-coordinates-to-polar-coordinates-in-js
function cartesian2polar(x, y){
	console.log(x,y)
	var distance = Math.sqrt(x*x + y*y)
	var radians = Math.atan2(y,x) //This takes y first
	var polarCoor = { rho:distance, theta:radians }
	return polarCoor
}

// http://stackoverflow.com/questions/8898720/cartesian-to-polar-coordinates
function polar2cartesian(rho, theta) {
	var x = rho * Math.cos(theta);
	var y= rho * Math.sin(theta);
	return {x:x, y:y}
}

