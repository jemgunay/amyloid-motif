#!/usr/bin/env python
# -*- coding: UTF-8 -*-

# enable cgi/python debugging
import cgi
import cgitb
from find_amyloid_motif import fetch_accessor, fetch_sequence

# disable debugging for release
#cgitb.enable()

def search():
	print "Content-type: text/html\n\n";

	# get post input
	form = cgi.FieldStorage()
	
	# check if overlap flag is specified, default to true
	overlap = True
	if "overlap" in form and cgi.escape(form["overlap"].value, quote=True) == "false":
		overlap = False
	
	# perform required search operation and escape html to prevent tag injection/xss
	if "fasta" in form:
		# run search on fasta sequence
		fetch_accessor(cgi.escape(form["fasta"].value, quote=True), overlap)
		
	elif "accession" in form:
		# retrieve search sequence then run search
		fetch_sequence(cgi.escape(form["accession"].value, quote=True), overlap)
		
	else:
		# neither fasta or accessor provided
		print "no-protein-error"
	
search()
