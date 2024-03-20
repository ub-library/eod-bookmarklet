# EOD Bookmarklet

## Overview

The EOD Bookmarklet generates a form for encoding structured data as JSON to put
into some kind of free text field. The original use case is to put Embedded
Order Data into an internal note field in the checkout form at the book vendor
Adlibris, for later extraction during an import process.

## Usage

### As a standalone form

When activated at any non-Adlibris web page, the bookmarklet embeds a form at
the top left of the current page (obstructing any content under it). When
submitted, the JSON string will be presented in a prompt dialog for easy
copying. The form will be removed on accepting the prompt. The JSON data can
then be pasted into the desired field, e.g. the "Cataloguers Note" field in a
Libris holding registration form.

### In Adlibris checkout workflow

When activated in the Adlibris checkout workflow, the bookmarklet embeds a form
for each purchased title on the Libris registration page. It can also extract
prices and quantity information from the workflow pages, pre-populating the
form. Typically you would activate the bookmarklet at (or before) the first page
in the checkout workflow, so it is able to pick up all necessary data before the
registration page, but you can also step back and forward after the activation.

On submission of each form the JSON-encoded data is automatically entered into
the "Internal note" field. (If leaving and reentering the registration page, the
data entered into the original Adlibris form will persist - including the
generated JSON data, while the EOD bookmarklet forms will reset.)

(An additional feature is adding "Ordered {date}." into one of the two other
available fields in the registration form. This can be disabled.)

### And then what?

In the original workflow, the internal note ends up as subfield `852$x` in a
MARC holding record imported into Libris, the Swedish national library catalog.
In Libris it becomes "Cataloguer Note", the same field we used in the example
for the standalone form above. From there it is exported for import into our
local library system, ExLibris Alma. But before import, we parse the JSON and
use it to populate a local MARC field (949), each JSON key mapping to a subfield
code, that our local system can use to create order data. In this way, we can
use the free text field to provide the structured data needed by our library
system.

The bookmarklet is heavily customizable and can at least in theory be used for a
lot of different kind of data.

## Requirements

The following software is required to build the bookmarklet:

- [GNU Make](https://www.gnu.org/software/make/)
- [esbuild](https://esbuild.github.io)
- [jq](https://jqlang.github.io/jq/)
- [go-mustache](https://github.com/cbroglie/mustache)

Optional dependencies to extract configuration data from Alma:

- [curl](https://curl.se)
- [prettier](https://prettier.io) (not necessary)

Everything needed can be installed through the provided nix flake (assuming
[nix][] is installed and [nix experimental features][nix-experimental]
nix-command and flakes are enabled):

[nix]: https://nixos.org
[nix-experimental]: https://nixos.org/manual/nix/stable/contributing/experimental-features

```sh
nix develop
```

Or using [direnv](https://direnv.net):

```sh
cp envrc.example .envrc
direnv allow
```

## Building

The bookmarklet is built using `make`. For better or for worse, neither nodejs
nor npm is required (except if you want to use prettier to format your config).

Running just `make` will build two files in `out/`: `index.html` and `main.js`.
The HTML-page is the primary output - it contains a link with the embedded
JavaScript as the URL that can be dragged to you bookmarks toolbar.

To make the build work you will need to create the file `config.json`. See
[Configuration][] below.

Please note that the JavaScript build (started by `esbuild`) depends only
_indirectly_ on `config.json`. The direct dependency is only specified in the
`Makefile`. To apply changes in `config.json` you need to start the build
through `make`.

## Configuration

### The configuration file

Your custom configuration lives in `config.json` which you must create. The
minimal version of this file is an empty JSON-object (`{}`), implying that you
just want to use the default configuration without any customizations. (This is
probably never what you want.)

### Example configuration files

The _default_ configuration can be seen in [`src/defaultConfig.json`][]. An
_example_ configuration, including the default configuration but also some
example customizations is available in [`config.json.example`][]. This file can be a
good starting point for your own configuration.

[`src/defaultConfig.json`]: ./src/defaultConfig.json
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
profile in Alma, you will want to use the keys from the mapping rather than the
original keys retrieved here.)

### The configuration object

The configuration file contains a JSON object. It will be recursively merged
with the default configuration. For _object_ values, that means you will only
need to supply the keys and values that you want to change. But _array_ values
will be overwritten, so if you want to change an array value, you need to supply
the whole array. _Scalar values_ like strings and booleans will always be
overwritten.

These are the top level keys:

- [`labels`][]: Defines texts used in various places.
- [`fields`][]: Defines the fields of the form.
- [`mappings`][]: Maps _named fields_ (used in automatic field population) to fields
  defined in `fields`.
- [`options`][]: Defines the _possible values_ for fields defined in `fields`.
- [`defaults`][]: Defines the _default values_ for fields defined in `fields`.
- [`adlibris`][]: Contains `settings` for the Adlibris integration and overlays for
  `labels`, `options`, and `defaults` that is used only in the Adlibris
  specific forms.

The values for these configuration keys are described below.

#### `labels`

Defines texts used in various places.

See [`config.json.example`][] for the available keys. Please note that the top
level configuration only includes labels that are used for both the standalone
form and the Adlibris integrated forms. See [`adlibris`][] below for labels
specific to Adlibris.

Can be omitted to use default labels. Set any labels you want to change in your
`config.json`. E.g. to override only the text on the submit button in the form:

```json
{ "labels": { "submit": "Generate internal note" } }
```

The `closeButton` label is special and can be set to `null` to disable the close
button on the form.

```json
{ "labels": { "closeButton": null } }
```

(`bookmarkletName` and `bookmarkletInstruction` are never used in the actual
bookmarklet, but only when generating the HTML page. Keeping them here is for
convenience but might change to decrease the size of the bookmarklet.)

#### `fields`

Defines the fields of the forms (and the JSON output). Can be omitted if you
want to use the default fields. See [`config.json.example`][] for the default
fields.

The value is an array of field objects. If you want to customize a field, or add
a new one, you will need to provide the full configuration for all fields, as
the array replaces rather than merges with the default `fields`. (See `options`
below for a way to _remove_ a field from the form without the need to provide
the full `fields` configuration.)

Each field object _must_ have the two keys `id` and `label` with string values.
An example:

```json
{
  "fields": [{ "id": "n", "label": "Note" }]
}
```

The example would by default result in a text `input` field with the name "n"
and the label "Note".

A field _may_ have a third key `attributes` with an object value. Each key-value
pair in `attributes` will by default be set on the `input` field. While any
attribute can be set, some might be overwritten and some might cause the
bookmarklet to malfunction. The intention is to be able to validate the form
data:

```json
{
  "fields": [
    {
      "id": "a",
      "label": "Quantity",
      "attributes": { "type": "number", "required": true }
    }
  ]
}
```

This example would by default result in a _required_ `input` with type `number`,
triggering builtin browser validation.

(The `id` could be any string, but in our default workflow they are directly
mapped to subfield codes in a MARC field, which means we only use single
characters in the set `[0-9a-z]`.)

#### `mappings`

Maps _named fields_ (used in automatic field population) to fields defined in
`fields`. See [`config.json.example`][] for the default mappings. Can be omitted
to use the default mappings - but if you customize `fields` it is best to
include `mappings` too for clarity.

While the fields of the form is fully customizable, in the Adlibris integration
fields representing _price_ and _quantity_ are expected to exist to enable
pre-populating them with data extracted the checkout workflow pages.

For Adlibris integration to work, the `mappings` must be an object with the keys
`price` and `quantity` where the values are the `id`s from the fields defined in
`fields` that should carry the corresponding data.

```json
{ "mappings": { "price": "p", "quantity": "a" } }
```

In this example `fields` must contain a field with `"id": "p"` and another with
`"id": "a"`.

#### `options`

Defines the _possible values_ of fields defined in `fields`. See
[`config.json.example`][] for _example_ values. These should not be used as is,
but only work as examples for the _format_ of option definitions. For more
usable examples, generate `config.json.alma`.

The value is an object where each key must be an `id` defined in `fields`, and
each value must be an array. Each such array is a list of options for that
field. An option is either a string or an array of two strings.

```json
{
  "options": {
    "v": ["vendor1", "vendor2"],
    "f": [
      ["fund1", "Fund one"],
      ["fund2", "Fund two"],
      ["fund3", "Fund three"]
    ],
    "c": ["report1"],
    "s": []
  }
}
```

There are several things going on in this example. Options are defined for four
fields.

The field `s` has an empty array as options, meaning there are no possible
values. This field will be completely omitted from the form. (This is a way to
disable an unused field while still using the rest of the default
configuration.)

The fields `c` has a single available option. This will make the corresponding
`input` hidden with this value fixed.

The field `v` has two options, both specified as strings. This will produce a
`select` element where each string will be used as both value and the display
text of an `option` element.

The field `f` has three options, all of which have two element array values.
This will also produce a `select` element, but for each option will use the
first element of the array as the value and the second as the text.

(It is possible to mix plain strings and two element array values in the same
options list.)

All `select` elements will by default be marked as `required`, but this can be
overridden by redefining the field in `fields`, setting `attributes.required`
to `true`.

#### `defaults`

Defines the _default values_ of fields defined in `fields`. See
[`config.json.example`][] for _example_ values. These should not be used as is,
but customized in line with your configuration and needs.

The value is an object where each key must be an `id` defined in `fields`, and
each value is a default value for the field.

```json
{
  "defaults": {
    "f": "fund1"
  }
}
```

- If the field has no options defined it will be pre-populated
  with this value.

- If the field has a single option defined (i.e. is a hidden `input`), the
  default value will have no effect

- If the field has at least two options defined (e.g. is rendered as a
  `select`), and the value exists as an option value, that option will be
  pre-selected.

#### `adlibris`

Contains a unique key `settings` for the Adlibris integration, and overlays for
`labels`, `options`, and `defaults` that should be used only in the Adlibris
specific forms. See [`src/defaultConfig.json`][] for the available keys
(including Adlibris specific labels) and default values.

Of special note:

- `adlibris.labels.closeButton` is set to `null` by default to override the
  default `labels.closeButton`.

- `adlibris.settings.dateNoteField` controls which (if any) of the
  original Adlibris form fields where a note on the ordering date should be
  placed. The value is the label of the field (with `"Hyllsignum"` and
  `"Publik anmärkning"` as the two available options), or `null` or `false` to
  disable the functionality. (When enabled, the date will be surrounded by the
  labels `datePrefix` and `dateSuffix`.)

- With the original configuration for `fields`, you would probably want to set
  the options for field `v` to be the single value representing Adlibris as a
  vendor in your system:

  ```json
  { "adlibris": { "options": { "v": ["your_adlibris_vendor_code"] } } }
  ```

- You can remove a value set in the top level `defaults` by setting the same
  key to null in `adlibris.defaults`:

  ```json
  { "defaults": { "s": "sndCode1" }, "adlibris": { "defaults": { "s": null } } }
  ```
