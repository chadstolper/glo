
GLO.Coordinates = function(x,y,width,height){
	if(typeof x == "list"){
		this._x = d3.min(x)
		this._width = d3.max(x) - this._x
		this._y = d3.min(y)
		this._height = d3.max(y) = this._y
		return this
	}

	this._x = x
	this._y = y
	this._width = width
	this._height = height
	return this
}

GLO.Coordinates.prototype.bounding_box_area = function(X,Y){
	var min_x = d3.min(X)
	var min_y = d3.min(Y)
	var max_x = d3.max(X)
	var max_y = d3.max(Y)

	return (max_x-min_x)*(max_y-min_y)
}


GLO.Coordinates.prototype.map_x = function(x){
	return this.x()+x
}

GLO.Coordinates.prototype.map_y = function(y){
	return this.y()+y
}

GLO.Coordinates.prototype.x = function(value){
	if(!value){
		return this._x
	}
	this._x = value
	return this
}

GLO.Coordinates.prototype.y = function(value){
	if(!value){
		return this._y
	}
	this._y = value
	return this
}


GLO.Coordinates.prototype.width = function(value){
	if(!value){
		return this._width
	}
	this._width = value
	return this
}

GLO.Coordinates.prototype.height = function(value){
	if(!value){
		return this._height
	}
	this._height = value
	return this
}

GLO.Coordinates.prototype.area = function(){
	return this.width()*this.height()
}

GLO.Coordinates.prototype.top = function(){
	return 0
}

GLO.Coordinates.prototype.bottom = function(){
	return this.height()
}

GLO.Coordinates.prototype.middle = function(){
	return this.height()/2
}

GLO.Coordinates.prototype.left = function(){
	return 0
}

GLO.Coordinates.prototype.center = function(){
	return this.width()/2
}

GLO.Coordinates.prototype.right = function(){
	return this.width()
}