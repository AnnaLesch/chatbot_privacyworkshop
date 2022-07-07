import argparse
import json
import pprint
import pystache
from jsmin import jsmin

class CBLBuilder:

    def build(self, tmpl, script, debug):
        if debug:
            js1 = self.read_file("tmpl/js/cbl2.js")
            js2 = self.read_file(script)
        else:
            js1 = jsmin(self.read_file("tmpl/js/cbl2.js"))
            js2 = jsmin(self.read_file(script))

        css = self.read_file("tmpl/css/chatbot.css")

        self.build_tmpl(tmpl, { 'js': js1 + js2, 'css': css })

    def build_tmpl(self, filename, obj):
        with open(filename) as f:
            html = f.read()
            print(pystache.render(html, obj))

    def read_file(self, filename):
        with open(filename) as f:
            return f.read()

if __name__ == '__main__':

    parser = argparse.ArgumentParser()

    parser.add_argument("-d", "--debug", action='store_true', default=False,
        help="enable debug mode")

    parser.add_argument("-t", "--tmpl", type=str, default="tmpl/chatbot.html",
        help="specify html template")

    parser.add_argument("cbl", type=str, help="cbl script")

    args = parser.parse_args()

    b = CBLBuilder()
    b.build(args.tmpl, args.cbl, args.debug)
