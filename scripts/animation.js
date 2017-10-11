define(["counter","speedRange","tree/hashlife","c","body"], function(counter,speedRange,hashLife, c, body){
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
				c.drawAll();
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
			c.drawAll();
		};
	setCounter();
	return {
		go:go,
		stop:stop,
		reset:reset,
		doStep:function(){
			doStep();
			c.drawAll();
			setCounter();
		},
		isGoing:function(){return going;}
	};

});