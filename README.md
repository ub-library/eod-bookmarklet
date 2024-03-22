# EOD Bookmarklet

## Introduction

The EOD (Embedded Order Data) Bookmarklet is a tool designed to facilitate the
entry of structured JSON data into free text fields across web applications.
It's particularly tailored for the checkout workflow of the Swedish book vendor
Adlibris, and the need to capture structured order data for later processing in
a library system.

This document is intended for systems librarians and covers the essentials on
configuring, building, and implementing the EOD Bookmarklet within export/import
workflows.

## Functionality and Usage

### Standalone Mode

Activating the bookmarklet on any non-Adlibris webpage embeds a form for data
entry. Once filled, the form outputs a JSON string for copying and further use,
such as in a cataloging system's note field.

### Adlibris Checkout Integration

In the context of the Adlibris checkout workflow, the bookmarklet automates data
capture, including price and quantity, embedding a customized form for each
purchased title on the registration page. This integration facilitates seamless
data transfer into the "Internal note" field, streamlining the process.

After activation the bookmarklet remains active in the current browser tab while
you proceed through the workflow, until you close or reload the page. To enable
the capture of prices in a timely manner, enable it when or before you visit the
first page of the checkout workflow.

### Post-Processing Workflow

The captured JSON data serves as a structured representation of order details
that can be transmitted through a free text field. In a post-processing step it
can then be parsed and inserted into dedicated fields.

In our workflow, the data typically moves from Adlibris through Libris before we
receive it as subfield `852$x` in a MARC record. Before import to our library
system, we parse the JSON and use the data to populate the subfields of a local
MARC field (949) that can be used to create order data.

As the bookmarklet is heavily customizable it can potentially be used for a
lot of different use cases.

## Getting started

### Prerequisites

To build and use the EOD Bookmarklet, ensure the following tools are installed:

- [GNU Make](https://www.gnu.org/software/make/)
- [esbuild](https://esbuild.github.io)
- [jq](https://jqlang.github.io/jq/)
- [go-mustache](https://github.com/cbroglie/mustache)

Optional dependencies to extract configuration data from Alma:

- [curl](https://curl.se)
- [prettier](https://prettier.io) (For better looking output.)

The build environment can be set up through the provided nix flake (assuming
[Nix][] is installed with [experimental features][nix-experimental] nix-command
and flakes are enabled). An example `.envrc`-file for use with `direnv` is also
provided.

[nix]: https://nixos.org
[nix-experimental]: https://nixos.org/manual/nix/stable/contributing/experimental-features

### Building

The bookmarklet is built using `make`. For better or for worse, neither nodejs
nor npm is required (except if you want to use prettier to format your config).

To make the build work you will need to create the file `config.json` in the
project top level directory. See [Configuration][] below.

```sh
# Copy the example configuration
cp config.json.example config.json

# Edit it to fit your needs
${EDITOR} config.json

# Build the bookmarklet
make
```

Running `make` will build three files:

- `out/appliedConfig.json` - the applied configuration.
- `out/main.js` - the compiled JavaScript.
- `out/index.html` - an HTML page containing the bookmarklet
  as a link with that can be dragged to you bookmarks toolbar.
  **This is the primary output. Publish `index.html` and share it with your
  users.**

## Configuration

### The configuration file

There are three files that affect the configuration:

- [`src/defaultConfig.json`][] - the default configuration.

- `config.json` - your custom configuration. You must create this file. The
  minimal version is an empty JSON-object (`{}`), implying that you just want
  to use the default configuration without any customizations. (This is
  probably never what you want.)

- `out/appliedConfig.json` - the actual configuration applied in the build.
  Generated by recursively merging the default and custom configuration files.
  (Note that this dependency is only expressed in the `Makefile`. Directly
  calling `esbuild` will not apply changes in `config.json`.)

[`src/defaultConfig.json`]: ./src/defaultConfig.json

### Example configuration files

An _example_ configuration, including the default configuration but also some
example customizations is available in [`config.json.example`][]. This file can
be a good starting point for your own configuration.

[`config.json.example`]: ./config.json.example

For Alma libraries, a different starting point file `config.json.alma` can be
generated with:

```sh
# Configure your ALMA_API_HOST - this is the default:
export ALMA_API_HOST=https://api-eu.hosted.exlibrisgroup.com
# Supply a command that outputs your Alma API key (Always avoid using commands
# that includes the API key verbatim. Use a password manager!):
export ALMA_API_KEY_COMMAND='your-api-key-command'
make config.json.alma
```

This will populate the _options_ (see below) for some of the default fields with
data from your Alma instance. (Note that if you use mappings in the import
profile in Alma, you want to use the keys from the mapping rather than the
original keys retrieved here.)

### The configuration object

The configuration is a JSON object. It will be recursively merged with the
default configuration. For nested _object_ values, that means you will only need
to supply the keys and values that you want to change. But _array_ and _scalar_
values will be overwritten (removing any object the array contains).

These are the top level keys:

```json
{
  "labels": {},
  "fields": [],
  "mappings": {},
  "options": {},
  "defaults": {},
  "adlibris": {}
}
```

The values for these configuration keys are described below.

#### `labels`

An object that defines texts used in various places. The available keys are all
present in the default and example configurations. All values must be strings,
with on exception:

```json
{
  "copyPrompt": "Copy the JSON data below",
  "submitButton": "Generate internal note"
}
```

The `closeButton` label is special and can be set to `null` to disable the close
button on the form.

```json
{ "closeButton": null }
```

#### `fields`

A list of field definitions. A customized list will replace the default fields
completely.

Each field definition is an object with two or three keys. The fields `id` and
`label` are mandatory, while `attributes` is optional. All attributes will be
set on the input field of the form (nested values not allowed).

A minimal field:

```json
{ "id": "n", "label": "Note" }
```

A definition for a required field with a custom type:

```json
{
  "id": "a",
  "label": "Quantity",
  "attributes": { "type": "number", "required": true }
}
```

#### `mappings`

An object mapping _named fields_ to definitions in `fields` by their id.
Used in the Adlibris checkout integration.

The two named fields are `price` and `quantity`:

```json
{ "price": "p", "quantity": "a" }
```

If you customize fields, you might need to customize mappings too.

#### `options`

An object that defines the _possible values_ of fields defined in `fields`. Each
key must be an `id` from `fields` and values are lists of options for that
field.

If the list has two options or more, it will populate a `select`-box. An option
can be a single string (used as both value and text for the `option` element) or
a list of two strings (used as value and text respectively):

```json
{
  "v": ["vendor1", "vendor2"],
  "f": [
    ["fund1", "Fund one"],
    ["fund2", "Fund two"],
    ["fund3", "Fund three"]
  ]
}
```

A single option implies the only possible value – the field will become hidden
with a fixed value:

```json
{ "c": ["code1"] }
```

An empty list implies no possible values – the field will be omitted:

```json
{ "s": [] }
```

(This is a way to _remove_ a default field without overwriting the default
`fields` list.)

#### `defaults`

An object that defines the _default values_ for fields defined in `fields`. Each
key must be an `id` from `fields`.

```json
{ "f": "fund1", "c": "code1" }
```

If the field has no `options` defined it will be pre-populated with the value.

If the field has at least two `options` defined and the value exists as an
option value, that option will be pre-selected.

If the field has a single value defined in `options`, the option value will be
used and the default value will have no effect.

#### `adlibris`

An object with four keys:

```json
{
  "labels": {},
  "options": {},
  "defaults": {},
  "settings": {}
}
```

In the Adlibris integration, `labels`, `options`, and `defaults` defined here
will merge with and overlay the corresponding keys in the top level
configuration. By default this is used to disable the close button by setting
its label to `null`. With the original configuration for `fields`, you will
probably also want to set the `adlibris.options` for field `v` to be the single
value representing Adlibris as a vendor in your system:

```json
{ "adlibris": { "options": { "v": ["your_adlibris_vendor_code"] } } }
```

The value of the `settings` key is an object with settings for the Adlibris
integration. Currently there is a single setting: `dateNoteField`. Set it to
`"Hyllsignum"` or `"Publik anmärkning"` to put the date of the order in the
corresponding original Adlibris field:

```json
{ "dateNoteField": "Hyllsignum" }
```

Or set it to `null` to disable this functionality:

```json
{ "dateNoteField": null }
```
