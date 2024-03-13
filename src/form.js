export { createForm };
function createForm(
  { fields, options = {}, defaults = {}, labels = {} },
  callback,
) {
  labels = { submit: "Submit", emptyOption: "---", ...labels };
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

  const form = document.createElement("form");
  form.style.display = "grid";
  form.style.gridTemplateColumns = "auto auto";
  form.style.gridGap = "0.3em 0.5em";
  form.style.padding = "1em 0.5em";
  form.style.font = "max(1rem, 16px) sans-serif";
  form.style.alignItems = "center";
  form.style.backgroundColor = "#fff0f8";
  form.style.border = "1px solid #999094";
  form.style.position = "fixed";
  form.style.zIndex = "1000000";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "\u274C";
  closeButton.style.marginLeft = "auto";
  closeButton.style.gridColumn = "2 / 3";
  closeButton.onclick = (e) => {
    form.remove();
  };
  form.appendChild(closeButton);

  fields.forEach(function (field) {
    const options = field.options;
    const preset = field.preset;

    let input;

    const label = document.createElement("label");
    label.textContent = field.label + ": ";
    label.htmlFor = field.id;
    label.style.textAlign = "right";
    form.appendChild(label);

    if (options && options.length == 1) {
      const option = options[0];
      input = document.createElement("input");
      input.type = "hidden";
      input.value = Array.isArray(option) ? option[0] : option;
      label.style.display = "none";
    } else if (options) {
      input = document.createElement("select");
      input.required = true;
      if (!preset) {
        const emptyOption = document.createElement("option");
        emptyOption.textContent = labels.emptyOption;
        emptyOption.value = "";
        emptyOption.selected = true;
        emptyOption.disabled = true;
        input.appendChild(emptyOption);
      }
      field.options.forEach(function (option) {
        const optionElement = document.createElement("option");
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

  const submitButton = document.createElement("button");
  submitButton.textContent = labels.submit;
  submitButton.type = "submit";
  submitButton.style.gridColumn = "2 / 3";
  submitButton.style.fontSize = "inherit";
  form.appendChild(submitButton);

  form.onsubmit = function (e) {
    e.preventDefault();
    const formData = {};
    fields.forEach(function (field) {
      formData[field.id] = document.getElementById(field.id).value;
    });
    callback(JSON.stringify(formData), form);
  };

  return form;
}
