#!/usr/bin/env python
import re
import urllib2

# regex for amyloid motif: {P}-{PKRHW}-[VLSWFNQ]-[ILTYWFN]-[FIY]-{PKRH}
motif_regex = r"[^P][^PKRHW][VLSWFNQ][ILTYWFN][FIY][^PKRH]"
# regex for UniProt accessor codes
accessor_regex = r"[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}"

# get corresponding accessor code for supplied sequence
def fetch_accessor(input_sequence, overlap):
	accessor = input_sequence.split("|")[1]
	
	perform_search(accessor, input_sequence, overlap)
	

# get corresponding protein sequence for supplied UniProt accessor
def fetch_sequence(input_accessor, overlap):
	input_accessor = input_accessor.strip()
	# validate accessor code
	if not re.search(accessor_regex, input_accessor):
		print "invalid-accessor-error"
		return
	
	try:
		# retrieve FASTA formatted protein sequence from UniProt
		fasta_sequence = urllib2.urlopen("http://www.uniprot.org/uniprot/" + input_accessor + ".fasta").read()
	except urllib2.HTTPError, e:
		# error processing web request
		print "uniprot-access-error"
		return
	
	perform_search(input_accessor, fasta_sequence, overlap)
	

# search for motif matches, output locations
def perform_search(accessor, fasta_sequence, overlap):
	sequence = ''
	matches = ''
	# split by new line
	fasta_lines = fasta_sequence.split("\n")
	# merge each sequence line to single line, excluding the first FASTA header line
	sequence = ''.join(fasta_lines[1:])
	# get protein name and send back target protein info
	protein_name = fasta_lines[0].split("|")[2]
	print accessor + "\t\t" + sequence + "\t\t" + protein_name + "\t\t"
	
	# slide along sequence string comparing against regex (6 letters at a time = motif length)
	for i in range(len(sequence)):
		# regex match against the target motif
		if re.search(motif_regex, sequence[i:i+6]):
			matches += str(i + 1) + " &#8594; " + str(i + 6) + "   (" + sequence[i:i+6] + ")<br>"
			# prevent overlapping motifs by skipping to the end of the last found motif
			if overlap == False:
				i += 6
	
	# append result to output file & print if a match was found
	if matches != "":
		print matches
	else:
		print "No motif matches were found!"
	