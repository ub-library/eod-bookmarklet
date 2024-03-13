.PHONY : default
default : pages

SHELL = bash
.SHELLFLAGS := -e -o pipefail -c

SOURCES := $(wildcard src/*)

ALMA_API_HOST ?= https://api-eu.hosted.exlibrisgroup.com
ALMA_API ?= $(ALMA_API_HOST)/almaws/v1
ALMA_AUTH_HEADER_COMMAND ?=

curl := curl --fail --no-progress-meter -H Accept:application/json \
				-H @<(eval $(ALMA_AUTH_HEADER_COMMAND))

has_prettier := $(shell command -v prettier 2>/dev/null)
ifdef has_prettier
prettify-json := prettier --parser json
else
prettify-json := jq
endif

# Function to generate a file name from the name and contents of a variable
# This lets us depend on the value of the variable, triggering rebuilds of the
# dependet targets only if the variable has changed
GUARD = tmp/$(1)_GUARD_$(shell echo $($(1)) | md5sum | cut -d ' ' -f 1)

# Define a target for the generated name
$(call GUARD,ALMA_AUTH_HEADER_COMMAND):
ifdef ALMA_AUTH_HEADER_COMMAND
	rm -f tmp/ALMA_AUTH_HEADER_COMMAND_GUARD_*
	touch "$@"
else
	$(error ALMA_AUTH_HEADER_COMMAND must be set for this target)
endif

tmp/funds.json : script/funds_to_conf.jq $(call GUARD,ALMA_AUTH_HEADER_COMMAND)
	$(curl)  $(ALMA_API)'/acq/funds?limit=100&view=brief' \
		| jq -f $< > $@

tmp/report1.json : script/reporting_codes_to_conf.jq $(call GUARD,ALMA_AUTH_HEADER_COMMAND)
	$(curl) $(ALMA_API)'/conf/code-tables/HFundsTransactionItem.reportingCode' \
		| jq -f $< > $@

tmp/report2.json : script/reporting_codes_to_conf.jq $(call GUARD,ALMA_AUTH_HEADER_COMMAND)
	$(curl) $(ALMA_API)'/conf/code-tables/SecondReportingCode' \
		| jq -f $< > $@

tmp/default_options.json : script/default_options.jq tmp/funds.json tmp/report1.json tmp/report2.json
	jq \
		--slurpfile f tmp/funds.json \
		--slurpfile c tmp/report1.json \
		--slurpfile s tmp/report2.json \
		-n -f $< > $@

config.json.default : config.json.example tmp/default_options.json
	cat $^ | jq '. * input' | $(prettify-json) > $@

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

.PHONY : clobber
clobber : clean
	find tmp -mindepth 1 -delete
