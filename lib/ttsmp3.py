#!/bin/python
#
# generate tts audio files from a list of sentences
#

import argparse
import os
import string
import sys
import json

from gtts import gTTS
import boto3

# generate mp3 using google translate (free) tts
def generate_mp3_gtts(audio_mp3, text, lang):
    gtts = gTTS(text=text, lang_check=False, lang=lang)
    gtts.save(audio_mp3)

# generate mp3 using amazon polly tts
def generate_mp3_polly(audio_mp3, text, voice, lang):
    polly_client = boto3.Session(
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
        region_name=os.environ["AWS_DEFAULT_REGION"]).client('polly')
    response = polly_client.synthesize_speech(VoiceId=voice,
        OutputFormat='mp3',
        LanguageCode=lang,
        Text=text)
    file = open(audio_mp3, 'wb')
    file.write(response['AudioStream'].read())
    file.close()

# process json file
def process_json(jsonfile, service, lang):
    with open(jsonfile) as f:
        j = json.loads(f.read())
    for voice in j:
        for s in j[voice]:
            process_sentence(service, voice, s, lang)

def process_sentence(service, voice, text, lang):
    valid = "-_ %s%s" % (string.ascii_letters, string.digits)
    prefix = voice.lower() + "_"
    ss = text.strip().lower()
    fn = ''.join(c for c in ss if c in valid)
    fn = fn.replace(' ', '_')
    fn += ".mp3"
    fn = prefix + fn
    print(fn)
    if service == "gtts":
        generate_mp3_gtts(fn, ss, lang)
    if service == "polly":
        generate_mp3_polly(fn, ss, voice, lang)
    convert_audio(fn)

def convert_audio(audiofile):
    os.system("ffmpeg -hide_banner -loglevel panic -y -i " + audiofile + " -ar 48000 /tmp/tmp.mp3")
    os.system("mv /tmp/tmp.mp3 " + audiofile)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--service", help="set service (gtts, polly)",
        type=str, default="gtts")
    parser.add_argument("--lang", help="set language",
        type=str, default='en')
    parser.add_argument("jsonfile",
        help="json file containing voice names and sentences")
    args = parser.parse_args()
    process_json(args.jsonfile, args.service, args.lang)
