SOURCES := $(wildcard src/*)

out/main.js : $(SOURCES) config.json
	@mkdir -p out
	esbuild --bundle src/index.js > $@
