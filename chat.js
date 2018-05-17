jQuery(document).ready(function($) {
	var socket=io.connect('http://localhost:8080');
	socket.emit('joinuser', 'is connect');
	socket.on('joinserver',function(data){
	})
	$.get('/getuser', function(data){
		console.log(data);
		$('#user').text("Привіт "+data)
	})
	$('#logout').click(function(){
		$.get('/logout', function(data){
			console.log(data);
			location.reload();
		})
	})

	$('#btn').click(function(){
		// alert('Hello')

		let txt=$('#txt').val();
		if(txt!==''){

			socket.emit('msg', txt);
			$('#txt').val('')
		}

	})
	socket.on('mesegserver',function(data){
		$("#messages").append("<p class='msg'>").children('p:last').text(data);
	})
});