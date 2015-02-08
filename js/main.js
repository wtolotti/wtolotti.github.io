window.Port = window.Port || {};

(function(Port){

	var $port = $('#port')

	var initAnalytic = function(){
		var link = $(this);
		ga('send', 'event', 'Social', link.text(), link[0].href);
	}

	$port
		.on('mousedown','.links > a',initAnalytic)


})(Port)
