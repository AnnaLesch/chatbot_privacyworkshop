# convert webmushra mturk result data to preferred csv format

import csv
import sys

def convert_file(filename):
    with open(filename) as f:
        csvreader = csv.reader(f)
        csvwriter = csv.writer(sys.stdout)
        headers = next(csvreader, None)
        for row in csvreader:
            csvwriter.writerows(convert_row(headers, row))

def convert_row(headers, row):

    out = []
    data = {}
    worker_id = row[headers.index('workerid')]
    test_id = row[headers.index('testId')]

    for i, h in enumerate(headers):
        if h.startswith('r:'):
            r = h.split(':')
            if not r[1] in data: data[r[1]] = {}
            if not r[2] in data[r[1]]: data[r[1]][r[2]] = {}
            data[r[1]][r[2]][r[3]] = row[i]

    for d in data:
        for r in data[d]:
            dr = data[d][r]
            out.append([test_id, worker_id, d, dr['stimulus'],
                dr['score'], dr['time'], dr['comment']])

    return out

if len(sys.argv) < 2:
    print("usage: %s input.csv > output.csv" % sys.argv[0])
else:
    convert_file(sys.argv[1])
