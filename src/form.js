export { form };
function form({ fields, options = {}, defaults = {}, labels = {} }) {
  var labels = { submit: "Submit", emptyOption: "---", ...labels };

  var form = document.createElement("form");
  form.style.position = "fixed";
  form.style.top = "0";
  form.style.left = "0";
  form.style.display = "grid";
  form.style.gridTemplateColumns = "auto auto";
  form.style.gridGap = "0.3rem 0.5rem";
  form.style.padding = "1rem 0.5rem";
  form.style.font = "1rem sans-serif";
  form.style.alignItems = "center";
  form.style.backgroundColor = "#fff0f8";
  form.style.border = "1px solid #999094";
  form.style.zIndex = "10000";

  fields = fields
    .map((field) => {
      return {
        ...field,
        options: options[field.id],
        preset: defaults[field.id],
        type: field.type || "text",
      };
    })
    .filter((field) => !(field.options && field.options.length == 0));

  fields.forEach(function (field) {
    var preset = field.preset;
    var label = document.createElement("label");
    label.textContent = field.label + ": ";
    label.htmlFor = field.id;
    label.style.textAlign = "right";
    form.appendChild(label);

    var options = field.options;
    var input;
    if (options && options.length == 1) {
      input = document.createElement("input");
      input.type = "hidden";
      input.value = options[0];
      label.style.display = "none";
    } else if (options) {
      input = document.createElement("select");
      input.required = true;
      if (!preset) {
        var emptyOption = document.createElement("option");
        emptyOption.textContent = labels.emptyOption;
        emptyOption.value = "";
        emptyOption.selected = true;
        emptyOption.disabled = true;
        input.appendChild(emptyOption);
      }
      field.options.forEach(function (option) {
        var optionElement = document.createElement("option");
        optionElement.value = Array.isArray(option) ? option[0] : option;
        optionElement.textContent = Array.isArray(option) ? option[1] : option;
        input.appendChild(optionElement);
      });
    } else {
      input = document.createElement("input");
      input.type = field.type;
      if (field.required) input.required = true;
    }
    input.id = field.id;
    if (preset) input.value = preset;
    input.style.fontSize = "inherit";
    form.appendChild(input);
  });

  var submitButton = document.createElement("button");
  submitButton.textContent = labels.submit;
  submitButton.type = "submit";
  submitButton.style.gridColumn = "2 / 3";
  submitButton.style.fontSize = "inherit";
  form.appendChild(submitButton);

  form.onsubmit = function (e) {
    e.preventDefault();
    var formData = {};
    fields.forEach(function (field) {
      formData[field.id] = document.getElementById(field.id).value;
    });
    alert(JSON.stringify(formData));
    document.body.removeChild(form);
  };

  document.body.insertBefore(form, document.body.firstChild);
}
