import sys
import json
"""
var data = {
	USA: {
		'birth': 8000,
		'death': 11000
	},
	IND: {
		'birth': 2000,
		'death': 6000
	}
}"""
lines = sys.stdin.readlines()
data_obj = dict()
for line in lines:
	country = line.strip()
	code, birth, death = country.split('\t')	
	data_obj[code] = dict(birth=int(birth), death=int(death))
print json.dumps(data_obj)

