// directory for python scripts
//var pyScriptsDir = "/motif_input.py";
var pyScriptsDir = "/cgi-bin/motif_input.py";

$(function() {
	// submit single search input
	$("#search-btn").click(function(e) {
		e.preventDefault();
		
		// get input data
		$("#output-container").empty().css("opacity", 0);
		var accessionVal = $("#accession-input").val().toUpperCase();
		var fastaVal = $("#fasta-input").val();
		var overlapVal = false;
		if ($('#overlap-input').is(":checked")) {
			overlapVal = true;
		}
		
		// ajax request to python script via cgi
		$.ajax({
			url: pyScriptsDir,
			type: "POST",
			data: {"accession": accessionVal, "fasta": fastaVal, "overlap": overlapVal},
			error: function(xhr, status, error) {
				//var err = eval("(" + xhr.responseText + ")");
				//appendAlert("There was an error communcating with the python script: " + err.Message, "alert-danger");
				appendAlert("There was an error communcating with the python script.", "alert-danger");
			},
			success: function(data) {
				if (data.includes("no-protein-error")) {
					appendAlert("Please ensure that either a <strong>UniProt Accession Code</strong> or a <strong>FASTA-Formatted Protein Sequence</strong> has been entered above.", "alert-info");
				}
				else if (data.includes("invalid-accessor-error") || data.includes("uniprot-access-error")) {
					appendAlert("Please ensure that the <strong>UniProt Accession Code</strong> is valid.", "alert-info");
				}
				else {
					displaySuccess(data);
				}
			}
		});
	});
	
	// submit batch search input
	$("#batch-search-btn").click(function(e) {
		e.preventDefault();
		
		// get array of all accessor codes
		$("#output-container").empty().css("opacity", 0);
		var accessionCodes = $("#batch-accession-input").val().split("\n");
		for (i = 0; i < accessionCodes.length; i++) {
			// get input data
			var accessionVal = accessionCodes[i].toUpperCase();
			var overlapVal = false;
			if ($('#overlap-input').is(":checked")) {
				overlapVal = true;
			}
			
			// ajax request to python script via cgi
			$.ajax({
				url: pyScriptsDir,
				type: "POST",
				data: {"accession": accessionVal, "overlap": overlapVal},
				error: function(xhr, status, error) {
					appendAlert("There was an error communcating with the python script.", "alert-danger");
					return;
				},
				success: function(data) {
					// silently ignore accession code errors
					if (!(data.includes("no-protein-error") || data.includes("invalid-accessor-error") || data.includes("uniprot-access-error"))) {
						displaySuccess(data);
					}
				}
			});
		}
	});
	
	// clear input fields
	$("#clear-btn").click(function(e) {
		e.preventDefault();
		if ($('.nav-tabs .active').text() == "Single Search") {
			$("#accession-input").val("");
			$("#fasta-input").val("");
		} else {
			$("#batch-accession-input").val("");
		}
	});
	
	// clear output results
	$("#clear-output-btn").click(function(e) {
		e.preventDefault();
		$("#output-container").animate({ opacity: 0 }, 200, function(e) {
			$("#output-container").empty();
		});
	});
	
	// input example sequence
	$("#example-btn").click(function(e) {
		e.preventDefault();
		if ($('.nav-tabs .active').text() == "Single Search") {
			$("#accession-input").val("P10636");
			$.get('/amyloid/P10636_sequence.txt', function(data) {
				$("#fasta-input").val(data);
			});
		} else {
			$("#batch-accession-input").val("P10636\nP10997\nP04156\nP05067\nP02647");
		}
	});
});

// display success results
function displaySuccess(data) {
	// format and display results
	var results = data.split("\t\t");
	var content = '<h3>UniProt Accession Code:</h3><p>' + results[0] + '</p><hr>';
	// bolden protein entry name
	var entryName = results[2].split(' ')[0];
	content += '<h3>Protein Name:</h3><p><strong>' + entryName + '</strong> ' + results[2].substr(entryName.length) + '</p><hr>';
	content += '<h3>Protein Sequence:</h3><p>' + results[1] + '</p><hr>';
	content += '<h3>Sequence Motif Matches:</h3><p>' + results[3] + '</p>';
	$("#output-container").append('<div class="well">' + content + '</div>');
	$("#output-container").animate({ opacity: 1 }, 200);
}

// inform the user of errors
function appendAlert(msg, alertType) {
	var content = '<div class="alert alert-dismissible ' + alertType + '" role="alert">';
	content += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + msg + '</div>'
	$("#output-container").empty().append(content);
	$("#output-container").animate({ opacity: 1 }, 200);
}