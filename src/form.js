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
      options: ["vendor1", "vendor2", "vendor3"],
    },
    {
      id: "f",
      label: "Fund",
      type: "select",
      options: ["fund1", "fund2", "fund3"],
    },
    { id: "p", label: "Pris", type: "number" },
    { id: "a", label: "Antal", type: "number" },
    {
      id: "c",
      label: "Reporting code",
      type: "text",
      value: "reporting_code1",
    },
    {
      id: "s",
      label: "Secondary reporting code",
      type: "select",
      options: [
        ["reporting2_code1", "Label for 2nd rep code 1"],
        ["reporting2_code2", "Label for 2nd rep code 2"],
        ["-", "-"],
      ],
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
