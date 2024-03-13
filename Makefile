.PHONY : default
default : pages

SOURCES := $(wildcard src/*)

out/main.js : $(SOURCES) config.json
	@mkdir -p out
	esbuild --minify --bundle src/index.js > $@

out/index.html : templates/index.html
	@mkdir -p out
	cp $< $@

out/bookmarklet.html : templates/bookmarklet.html.mustache out/main.js config.json
	@mkdir -p out
	( jq -Rs 'sub(";\n$$"; "") | @uri | { jsUri : . }' < out/main.js; \
		jq '.labels' < config.json; ) \
		| jq '. * input' \
		| mustache $< > $@

.PHONY : pages
pages : out/index.html out/bookmarklet.html

.PHONY : clean
clean:
	find out -mindepth 1 -delete
