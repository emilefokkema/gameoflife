(function(){
	var positionFactory = function(positionToMousePosition, fillRect){
		var allColumns = [];
		var get, getColumn;
		var connectToNeighboringColumns = function(c){
			allColumns.map(function(cc){
				if(Math.abs(cc.x - c.x) < 2){
					c.neighbors.push(cc);
					cc.neighbors.push(c);
				}
			});
		};
		var makeNewColumn = function(x, forget){
			var newOne;
			var all = [];
			var neighbors = [];
			var forgetColumn = function(){
				neighbors.map(function(c){c.forgetNeighbor(newOne);});
				forget();
			};
			var connectToNeighboringPositions = function(p){
				all.map(function(pp){
					if(Math.abs(pp.y - p.y) < 2){
						p.neighbors.push(pp);
						pp.neighbors.push(p);
					}
				});
				if(p.x == x){
					neighbors.map(function(c){c.connectToNeighboringPositions(p);});
				}
			};
			var getDiagnosis = function(positionsToVacate, positionsToOccupy){
				all.map(function(p){
					if(!p.environmentHasChanged()){return;}
					p.noEnvironmentChange();
					var liveNeighbors = p.numberOfLiveNeighbors();
					if(p.isOccupied()){
						if(liveNeighbors < 2 || liveNeighbors > 3){
							positionsToVacate.push(p);
						}
					}else{
						if(liveNeighbors == 3){
							positionsToOccupy.push(p);
						}
					}
				});
			};
			var makeNewPosition = function(y){
				var occupied = false;
				var environmentChanged = true;
				var newPosition = {
					x:x,
					y:y,
					toString:function(){return "("+x+","+y+")";},
					occupy:function(){
						occupied = true;
						createNeighborsOf(this);
						this.neighbors.map(function(p){p.notifyEnvironmentChange();});
					},
					draw:function(){
						if(!occupied){return;}
						var mousePosition = positionToMousePosition(this);
						fillRect(mousePosition.x,mousePosition.y);
					},
					vacate:function(){
						occupied = false;
						var neighborWithoutOccupiedNeighbors;
						while(neighborWithoutOccupiedNeighbors = this.neighbors.find(function(p){return !p.isOccupied() && p.hasNoOccupiedNeighbors();})){
							neighborWithoutOccupiedNeighbors.forget();
						}
						if(this.hasNoOccupiedNeighbors()){
							this.forget();
						}
						this.neighbors.map(function(p){p.notifyEnvironmentChange();});
					},
					forgetNeighbor:function(p){
						var index = this.neighbors.indexOf(p);
						if(index > -1){
							this.neighbors.splice(this.neighbors.indexOf(p), 1);
						}else{
							throw new Error("forgetting neighbor that has already been forgotten");
						}
						
					},
					isOccupied:function(){return occupied;},
					neighbors: [],
					beForgottenByNeighbors:function(){
						var self = this;
						this.neighbors.map(function(pp){pp.forgetNeighbor(self);});
					},
					numberOfLiveNeighbors:function(){
						var n = 0;
						for(var i=0;i<this.neighbors.length;i++){
							if(this.neighbors[i].isOccupied()){
								n++;
							}
						}
						return n;
					},
					hasNoOccupiedNeighbors:function(){
						return !this.neighbors.some(function(pp){return pp.isOccupied();});
					},
					environmentHasChanged: function(){return environmentChanged;},
					noEnvironmentChange: function(){environmentChanged = false;},
					notifyEnvironmentChange: function(){environmentChanged = true;},
					forget:function(){
						this.beForgottenByNeighbors();
						all.splice(all.indexOf(this),1);
						if(all.length == 0){
							forgetColumn();
						}
					}
				};
				return newPosition;
			};
			var draw = function(){
				all.map(function(p){p.draw();});
			};
			var getAllOccupiedPositions = function(){
				return all.filter(function(p){return p.isOccupied();});
			};
			var getIfExistsOnY = function(y){
				return all.find(function(p){return p.y == y});
			};
			var getAllBetween = function(yMin, yMax){
				return all.filter(function(p){return p.isOccupied() && p.y >= yMin && p.y <= yMax;});
			};
			newOne = function(y){
				var known = all.find(function(p){return p.y == y});
				if(known){
					return known;
				}
				var newPosition = makeNewPosition(y);
				connectToNeighboringPositions(newPosition);
				all.push(newPosition);
				return newPosition;
			};
			newOne.x = x;
			newOne.count = function(){return all.length;};
			newOne.neighbors = neighbors;
			newOne.draw = draw;
			newOne.getAllBetween = getAllBetween;
			newOne.getIfExistsOnY = getIfExistsOnY;
			newOne.forgetNeighbor = function(c){neighbors.splice(neighbors.indexOf(c), 1);};
			newOne.getAllOccupiedPositions = getAllOccupiedPositions;
			newOne.getDiagnosis = getDiagnosis;
			newOne.connectToNeighboringPositions = connectToNeighboringPositions;
			return newOne;
		};
		var createNeighborsOf = function(p){
			var c = getColumn(p.x - 1);
			c(p.y - 1);
			c(p.y);
			c(p.y + 1);
			c = getColumn(p.x);
			c(p.y - 1);
			c(p.y + 1);
			c = getColumn(p.x + 1);
			c(p.y - 1);
			c(p.y);
			c(p.y + 1);
		};
		var getDiagnosis = function(){
			var positionsToVacate = [];
			var positionsToOccupy = [];
			allColumns.map(function(c){
				c.getDiagnosis(positionsToVacate, positionsToOccupy);
			});
			return {
				positionsToVacate:positionsToVacate,
				positionsToOccupy:positionsToOccupy
			};
		};
		var getAllOccupiedPositions = function(){
			var allOccupiedPositions = [];
			allColumns.map(function(c){
				c.getAllOccupiedPositions().map(function(p){allOccupiedPositions.push(p);});
			});
			return allOccupiedPositions;
		};
		var serialize = function(){
			return getAllOccupiedPositions().map(function(p){return p.toString();}).join("");
		};
		var vacateAll = function(){
			getAllOccupiedPositions().map(function(p){p.vacate();});
		};
		var getIfExistsOnXY = function(x,y){
			var col = allColumns.find(function(c){return c.x == x});
			if(!col){
				return col;
			}
			return col.getIfExistsOnY(y);
		};
		var getAllInBox = function(box){
			var all = [];
			allColumns.filter(function(c){return c.x >= box.minX && c.x <= box.maxX;}).map(function(c){
				c.getAllBetween(box.minY, box.maxY).map(function(p){all.push(p);});
			});
			return all;
		};
		getColumn = function(x){
			var known = allColumns.find(function(c){return c.x == x});
			if(known){
				return known;
			}
			var newOne;
			var forget = function(){allColumns.splice(allColumns.indexOf(newOne), 1);};
			newOne = makeNewColumn(x, forget);
			connectToNeighboringColumns(newOne);
			allColumns.push(newOne);
			return newOne;
		};
		get = function(x,y){
			return getColumn(x)(y);
		};
		get.getDiagnosis = getDiagnosis;
		get.vacateAll = vacateAll;
		get.serialize = serialize;
		get.getAllInBox = getAllInBox;
		get.getIfExistsOnXY = getIfExistsOnXY;
		get.countAlive = function(){return getAllOccupiedPositions().length;};
		get.countAll = function(){
			var n = 0;
			allColumns.map(function(c){n += c.count();});
			return n;
		};
		get.draw = function(){allColumns.map(function(c){c.draw();});};
		return get;
	};
	window.columnPositionFactory = positionFactory;
})();