define([],function(){
	var transform = function(a,b,c,d,e,f){
		this.a = a;
		this.b = b;
		this.c = c;
		this.d = d;
		this.e = e;
		this.f = f;
	};
	transform.prototype.before = function(other){
		var a = this.a * other.a + this.b * other.c;
		var b = this.a * other.b + this.b * other.d;
		var c = this.c * other.a + this.d * other.c;
		var d = this.c * other.b + this.d * other.d;
		var e = this.e * other.a + this.f * other.c + other.e;
		var f = this.e * other.b + this.f * other.d + other.f;
		return new transform(a,b,c,d,e,f);
	};
	transform.prototype.inverse = function(){
		var det = this.a * this.d - this.b * this.c;
		if(det == 0){
			throw "error calculating inverse: zero determinant";
		}
		var a = this.d / det,
			b = - this.b / det,
			c = - this.c / det,
			d = this.a / det,
			e = (this.c * this.f - this.d * this.e) / det,
			f = (this.b * this.e - this.a * this.f) / det;
		return new transform(a,b,c,d,e,f);
	};
	var rotation = function(a){
		var sin = Math.sin(a);
		var cos = Math.cos(a);
		return new transform(cos, sin, -sin, cos, 0, 0);
	};
	transform.rotation = rotation;
	return transform;
});