out/main.js : src/form.js config.json
	@mkdir -p out
	esbuild --bundle $< > $@
