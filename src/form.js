import * as config from "../config.json";
(function () {
  var form = document.createElement("form");
  form.style.position = "fixed";
  form.style.top = "0";
  form.style.left = "0";
  form.style.display = "grid";
  form.style.gridTemplateColumns = "1fr 1fr";
  form.style.gridGap = "0.3rem 0.5rem";
  form.style.padding = "1rem 0.5rem";
  form.style.font = "1rem sans-serif";
  form.style.alignItems = "center";
  form.style.backgroundColor = "#fff0f8";
  form.style.border = "1px solid #999094";
  form.style.zIndex = "10000";

  var fields = [
    {
      id: "v",
      label: "Vendor",
      type: "select",
      options: config.vendors,
    },
    {
      id: "f",
      label: "Fund",
      type: "select",
      options: config.funds,
    },
    { id: "p", label: "Pris", type: "number" },
    { id: "a", label: "Antal", type: "number" },
    {
      id: "c",
      label: "Reporting code",
      type: "text",
      value: config.reporting_code1,
    },
    {
      id: "s",
      label: "Secondary reporting code",
      type: "select",
      options: config.reporting_code_2,
    },
    { id: "n", label: "Note", type: "text" },
    { id: "r", label: "Receiving Note", type: "text" },
  ];

  fields.forEach(function (field) {
    var label = document.createElement("label");
    label.textContent = field.label + ": ";
    label.htmlFor = field.id;
    label.style.textAlign = "right";
    form.appendChild(label);

    var input;
    if (field.type === "select") {
      input = document.createElement("select");
      var emptyOption = document.createElement("option");
      emptyOption.textContent = "";
      emptyOption.value = "";
      input.appendChild(emptyOption);
      field.options.forEach(function (option) {
        var optionElement = document.createElement("option");
        optionElement.value = Array.isArray(option) ? option[0] : option;
        optionElement.textContent = Array.isArray(option) ? option[1] : option;
        input.appendChild(optionElement);
      });
    } else {
      input = document.createElement("input");
      input.type = field.type;
      if (field.value) input.value = field.value;
    }
    input.id = field.id;
    input.style.fontSize = "inherit";
    input.required = true;
    form.appendChild(input);
  });

  var submitButton = document.createElement("button");
  submitButton.textContent = "Skapa anmärkning";
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
})();
