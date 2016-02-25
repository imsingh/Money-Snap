function CountDownTimer(dt, id, $scope)
    {
        var end = new Date(dt);

        var _second = 1000;
        var _minute = _second * 60;
        var _hour = _minute * 60;
        var _day = _hour * 24;

        function showRemaining() {
            var now = new Date();
            var distance = end - now;
            if (distance < 0) {

                clearInterval($scope);
                if(document.getElementById(id)) {
                    document.getElementById(id).innerHTML = 'EXPIRED!';
                }

                return;
            }
            var days = Math.floor(distance / _day);
            var hours = Math.floor((distance % _day) / _hour);
            var minutes = Math.floor((distance % _hour) / _minute);
            var seconds = Math.floor((distance % _minute) / _second);

            if(document.getElementById(id)) {
            	document.getElementById(id).innerHTML = '';
            	if(days) {
            		document.getElementById(id).innerHTML = days + ' <span>days</span> ';
            	}
            	if (hours) {
            		document.getElementById(id).innerHTML += hours + ' <span>hrs</span> ';
            	}
            	if(minutes) {
            		document.getElementById(id).innerHTML += minutes + ' <span>mins</span> ';
            	}
            	//document.getElementById(id).innerHTML += seconds + ' <span>secs</span>';
            }
        }

        showRemaining();
        //$scope = setInterval(showRemaining, 1000);
    }