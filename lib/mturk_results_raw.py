import argparse
import os
import boto3
import json
import sys
import xmltodict

class TurkResults(object):

    def __init__(self):
        self.client = boto3.client(
            service_name='mturk',
            region_name=os.environ['AWS_DEFAULT_REGION'],
            endpoint_url=mturk_env['endpoint'],
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )

    def get_results(self, hitid):
        results = []
        next_tok = None
        while True:
            if next_tok:
                r = self.client.list_assignments_for_hit(HITId=hitid,
                    AssignmentStatuses=['Submitted', 'Approved'],
                    MaxResults=100, NextToken=next_tok)
            else:
                r = self.client.list_assignments_for_hit(HITId=hitid,
                    AssignmentStatuses=['Submitted', 'Approved'],
                    MaxResults=100)
            if r['NumResults']:
                results.append(r)
                next_tok = r['NextToken']
            else:
                break
        return results

    def all_keys(self, answer):
        keys = []
        for k in answer['QuestionFormAnswers']['Answer']:
            if k['QuestionIdentifier'] == "transcript": continue
            keys.append(k['QuestionIdentifier'])
        return keys

    def find_key(self, answer, key):
        a = ""
        for k in answer['QuestionFormAnswers']['Answer']:
            if k['QuestionIdentifier'] == key:
                if k['FreeText']: a = k['FreeText']
        return a

    def print_csv(self, results):

        sys.stdout.write("# hitid,workerid,assignmentid,accepttime,submittime,")

        answer = xmltodict.parse(results[0]['Assignments'][0]['Answer'])
        keys = self.all_keys(answer)

        for k in keys:
            sys.stdout.write(k + ",")

        sys.stdout.write("transcript")
        sys.stdout.write("\n")

        for r in results:
            for a in r['Assignments']:
                answer = xmltodict.parse(a['Answer'])
                sys.stdout.write(a['HITId'] + ",")
                sys.stdout.write(a['WorkerId'] + ",")
                sys.stdout.write(a['AssignmentId'] + ",")
                sys.stdout.write(str(a['AcceptTime']) + ",")
                sys.stdout.write(str(a['SubmitTime']) + ",")
                for k in keys:
                    sys.stdout.write(self.find_key(answer, k) + ",")

                ts = self.find_key(answer, "transcript")
                sys.stdout.write("\"" + ts + "\"\n")

if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument("--env", help="set enviornment", type=str,
        default="sandbox")

    parser.add_argument("cfgfile", help="mturk environment config")
    parser.add_argument("hitid", help="mturk hit id")
    args = parser.parse_args()

    with open(args.cfgfile) as f:
        cfg = json.loads(f.read())

    mturk_env = cfg["environments"][args.env]

    tr = TurkResults()
    results = tr.get_results(args.hitid)

    if len(results) == 0:
        print("error: no results yet")
        quit()

    print(results)
