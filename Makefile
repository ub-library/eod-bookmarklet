.PHONY : default
default : pages

SHELL = bash
.SHELLFLAGS := -e -o pipefail -c

SOURCES := $(wildcard src/*)

ALMA_API_HOST ?= https://api-eu.hosted.exlibrisgroup.com
ALMA_API ?= $(ALMA_API_HOST)/almaws/v1
ALMA_API_KEY_COMMAND ?=

curl := curl --fail --no-progress-meter -H Accept:application/json \
				-H @<(printf 'Authorization: apikey %s' $$($(ALMA_API_KEY_COMMAND)))

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
$(call GUARD,ALMA_API_KEY_COMMAND):
ifdef ALMA_API_KEY_COMMAND
	rm -f tmp/ALMA_API_KEY_COMMAND_GUARD_*
	touch "$@"
else
	$(error ALMA_API_KEY_COMMAND must be set for this target)
endif

tmp/funds.json : script/funds_to_conf.jq $(call GUARD,ALMA_API_KEY_COMMAND)
	$(curl)  $(ALMA_API)'/acq/funds?limit=100&view=brief' \
		| jq -f $< > $@

tmp/report1.json : script/reporting_codes_to_conf.jq $(call GUARD,ALMA_API_KEY_COMMAND)
	$(curl) $(ALMA_API)'/conf/code-tables/HFundsTransactionItem.reportingCode' \
		| jq -f $< > $@

tmp/report2.json : script/reporting_codes_to_conf.jq $(call GUARD,ALMA_API_KEY_COMMAND)
	$(curl) $(ALMA_API)'/conf/code-tables/SecondReportingCode' \
		| jq -f $< > $@

tmp/alma_options.json : script/alma_options.jq tmp/funds.json tmp/report1.json tmp/report2.json
	jq \
		--slurpfile f tmp/funds.json \
		--slurpfile c tmp/report1.json \
		--slurpfile s tmp/report2.json \
		-n -f $< > $@

config.json.example : src/defaultConfig.json src/exampleConfig.json
	cat $^ | jq '. * input' | $(prettify-json) > $@

config.json.alma : src/defaultConfig.json tmp/alma_options.json
	cat $^ | jq '. * input' | $(prettify-json) > $@

tmp/combinedConfig.json : src/defaultConfig.json config.json
	cat $^ | jq '. * input' | $(prettify-json) > $@

out/%.js : src/%.js $(SOURCES) tmp/combinedConfig.json
	@mkdir -p out
	esbuild --minify --bundle $< > $@

out/index.html : templates/index.html.mustache out/main.js tmp/combinedConfig.json
	@mkdir -p out
	( jq -Rs 'sub(";\n$$"; "") | @uri | { jsUri : . }' < out/main.js; \
		jq '.labels' < tmp/combinedConfig.json; ) \
		| jq '. * input' \
		| mustache $< > $@

.PHONY : pages
pages : out/index.html

.PHONY : clean
clean:
	find out -mindepth 1 -delete

.PHONY : clobber
clobber : clean
	find tmp -mindepth 1 -delete
