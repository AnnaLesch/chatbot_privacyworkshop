import argparse
import os
import boto3
import time
import json
import pprint

class TurkBuilder(object):

    def __init__(self):
        self.client = boto3.client(
            service_name='mturk',
            region_name=os.environ['AWS_DEFAULT_REGION'],
            endpoint_url=mturk_env['endpoint'],
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )

    def create_html_question_xml(self, htmlfile):
        html = open(htmlfile, "r").read()
        xml = ("<HTMLQuestion xmlns=\"http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2011-11-11/HTMLQuestion.xsd\">"
            "<HTMLContent><![CDATA[" + html + 
            "]]>"
            "</HTMLContent>"
            "<FrameHeight>0</FrameHeight>"
            "</HTMLQuestion>")
        return xml

    def create_ext_question_xml(self, url):
        xml = ("<ExternalQuestion xmlns=\"http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd\">"
            "<ExternalURL>" + url + "</ExternalURL>"
            "<FrameHeight>0</FrameHeight>"
            "</ExternalQuestion>")
        return xml

    def create_hit_task(self, htmlorurl):
        qr = []
        if "qualification_requirements" in mturk_env:
            qr = mturk_env["qualification_requirements"]

        if htmlorurl.startswith('https://'):
            question_xml = self.create_ext_question_xml(htmlorurl)
        else:
            question_xml = self.create_html_question_xml(htmlorurl)

        response = self.client.create_hit(
            MaxAssignments = mturk_env["max_assignments"],
            AutoApprovalDelayInSeconds = 
                mturk_env["auto_approval_delay_in_seconds"],
            LifetimeInSeconds =
                mturk_env["lifetime_in_seconds"],
            AssignmentDurationInSeconds =
                mturk_env["assignment_duration_in_seconds"],
            Reward = mturk_env["reward"],
            Title = mturk_env["title"],
            Keywords = mturk_env["keywords"],
            Description = mturk_env["description"],
            Question=question_xml,
            QualificationRequirements = qr
        )
        return response

if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument("--env", help="set enviornment", type=str,
        default="sandbox")

    parser.add_argument("cfgfile", help="mturk environment config")
    parser.add_argument("htmlorurl",
        help="experiment html file or external HTTPS URL")
    args = parser.parse_args()

    with open(args.cfgfile) as f:
        cfg = json.loads(f.read())

    mturk_env = cfg["environments"][args.env]

    print()
    print(f"environment: {args.env}")
    print()
    pp = pprint.PrettyPrinter(indent=4)
    pp.pprint(mturk_env)
    print()
    print("beginning in 30 seconds, press CTRL-C to abort ...")
    time.sleep(30)

    tb = TurkBuilder()
    response = tb.create_hit_task(args.htmlorurl)

    hit_type_id = response['HIT']['HITTypeId']
    hit_id = response['HIT']['HITId']
    print("\nCreated HIT: {}".format(hit_id))

    print("\nYou can work the HIT here:")
    print(mturk_env['preview'] + "?groupId={}".format(hit_type_id))

    print("\nAnd see results here:")
    print(mturk_env['manage'])
