export { createForm };
function createForm({ fields, options = {}, defaults = {}, labels }, callback) {
  fields = fields
    .map((field) => {
      return {
        ...field,
        options: options[field.id],
        preset: defaults[field.id],
        attributes: field.attributes || {},
      };
    })
    .filter((field) => !(field.options && field.options.length == 0));

  const form = document.createElement("form");
  form.style.all = "revert";
  form.style.display = "inline-grid";
  form.style.gridTemplateColumns = "auto auto";
  form.style.gridGap = "0.3em 0.5em";
  form.style.padding = "1em 0.5em";
  form.style.font = "caption";
  form.style.alignItems = "center";
  form.style.backgroundColor = "#fff0f8";
  form.style.border = "1px solid #999094";

  if (labels.closeButton) {
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = labels.closeButton;
    closeButton.style.all = "revert";
    closeButton.style.marginLeft = "auto";
    closeButton.style.gridColumn = "2 / 3";
    closeButton.onclick = (e) => {
      form.remove();
    };
    form.appendChild(closeButton);
  }

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
    }
    input.name = field.id;
    if (input.type != "hidden") {
      for (const [attr, value] of Object.entries(field.attributes)) {
        if (!value) continue;
        input[attr] = value;
      }
      if (preset) input.value = preset;
      input.style.all = "revert";
      input.style.font = "caption";
    }
    form.appendChild(input);
  });

  const submitButton = document.createElement("button");
  submitButton.textContent = labels.submitButton;
  submitButton.type = "submit";
  submitButton.style.all = "revert";
  submitButton.style.gridColumn = "2 / 3";
  submitButton.style.font = "caption";
  form.appendChild(submitButton);

  form.onsubmit = function (e) {
    e.preventDefault();
    const formData = {};
    fields.forEach(function (field) {
      formData[field.id] = form[field.id].value;
    });
    callback(JSON.stringify(formData), form);
  };

  return form;
}
