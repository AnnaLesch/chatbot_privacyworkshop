SCRIPTS = cbl
OUTPUT = html

build:
	$(foreach file, $(wildcard $(SCRIPTS)/*), python lib/build.py --tmpl tmpl/chatbot.html $(file) > html/chatbot-$(shell basename $(file)).html;)

debug:
	$(foreach file, $(wildcard $(SCRIPTS)/*), python lib/build.py --debug --tmpl tmpl/chatbot.html $(file) > html/chatbot-$(shell basename $(file)).html;)
