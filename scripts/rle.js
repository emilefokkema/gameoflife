define([],function(){
	var parseRLEBody = function(body, occupy){
		var parts = body.replace(/\s*/g,"").match(/\d*[bo\$]/g);
		var x = 0, y = 0;
		parts.map(function(p){
			var match = p.match(/^(\d*)([bo\$])$/);
			var number = match[1] ? parseInt(match[1]) : 1;
			for(var i=0;i<number;i++){
				if(match[2] == "$"){
					x = 0;
					y++;
				}else{
					if(match[2] == "o"){
						occupy(x,y);
					}
					x++;
				} 
			}
		});
	};

	var makeRLE = function(positions){
		var lines = [];
		var getLineForY = function(y){
			var result = null;
			for(var i=0;i<lines.length;i++){
				if(lines[i].y == y){
					result = lines[i];
				}
			}
			return result;
		};
		var findLineForPosition = function(p){
			var result = getLineForY(p.y);
			if(!result){
				result = {y:p.y,positions:[]};
				lines.push(result);
			}
			return result;
		};
		positions.map(function(p){
			findLineForPosition(p).positions.push(p.x);
		});
		lines.sort(function(l1,l2){return l1.y - l2.y;});
		var ys = lines.map(function(l){return l.y;});
		var minY = Math.min.apply(null, ys);
		var maxY = Math.max.apply(null, ys);
		var lineMinX = function(l){return Math.min.apply(null, l.positions);};
		var lineMaxX = function(l){return Math.max.apply(null, l.positions);};
		var minX = Math.min.apply(null, lines.map(lineMinX));
		var maxX = Math.max.apply(null, lines.map(lineMaxX));
		var result = (function(){
			var kind = {ALIVE:0,DEAD:1,NEWLINE:2};
			var symbol = [];
			symbol[kind.ALIVE] = "o";
			symbol[kind.DEAD] = "b";
			symbol[kind.NEWLINE] = "$";
			var currentKind = -1;
			var all = [];
			var latest = null;
			var pushKind = function(k){
				if(k != currentKind){
					latest = {kind:k,count:0};
					all.push(latest);
				}
				currentKind = k;
				latest.count++;
			};
			var toString = function(){
				return all.map(function(k){return ""+(k.count > 1 ? k.count : "")+symbol[k.kind];}).join("");
			};
			return {
				alive:function(){pushKind(kind.ALIVE);},
				dead:function(){pushKind(kind.DEAD);},
				newLine:function(){pushKind(kind.NEWLINE);},
				toString:toString
			};
		})();

		for(var y=minY;y<=maxY;y++){
			var line = getLineForY(y);
			if(line){
				for(var x=minX;x<=maxX;x++){
					if(line.positions.indexOf(x) > -1){
						result.alive();
					}else{
						result.dead();
					}
				}
			}
			result.newLine();
		}
		return result.toString();
	};

	return {
		parse:parseRLEBody,
		make:makeRLE
	};
})