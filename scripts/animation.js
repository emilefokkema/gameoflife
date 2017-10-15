define(["counter","speedRange","tree/hashlife","coordinates","body"], function(counter,speedRange,hashLife, coordinates, body){
	speedRange.onInput(function(l){
		intervalLength = l;
	});
	var setCounter = function(){
			counter.set(stepCount);
		},
		stepCount = 0,
		doStep = function(done){
			hashLife.doStep();
			stepCount += 1 << hashLife.getTimePerStepLog();
			done && done();
		},
		going = false,
		setCounterInterval,
		stop = function(){
			body.removeClass('going');
			going = false;
			window.clearInterval(setCounterInterval);
			setCounter();
		},
		intervalLength = 75,
		go = function(){
			body.addClass('going');
			going = true;
			var afterStep = function(){
				coordinates.drawAll();
				window.setTimeout(function(){
					if(going){
						doStep(afterStep);
					}
				},intervalLength);
			};
			afterStep();
			setCounterInterval = window.setInterval(setCounter, 250);
		},
		reset = function(){
			hashLife.vacateAll();
			stepCount = 0;
			setCounter();
			coordinates.drawAll();
		};
	setCounter();
	return {
		go:go,
		stop:stop,
		reset:reset,
		doStep:function(){
			doStep();
			coordinates.drawAll();
			setCounter();
		},
		isGoing:function(){return going;}
	};

});