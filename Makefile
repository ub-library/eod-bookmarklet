out/main.js : src/form.js
	@mkdir -p out
	esbuild --bundle $< > $@
