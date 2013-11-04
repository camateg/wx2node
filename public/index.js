
$(document).ready(function() {
	$('#pretty_city').bind('keyup', function(e) {
		$.getJSON('/q/' + $('#pretty_city').val(), function(ret) {
			$('#output').html('');
			for(r in ret) {
				$('#output').html($('#output').html() + '<a href="/fc/' + ret[r].zmw + '">' + ret[r].name + '</a><br />');
			}	
		});
	});
});
