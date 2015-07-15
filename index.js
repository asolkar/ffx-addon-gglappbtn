var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");

var button = ToggleButton({
  id: "gglappbtn-tb-btn",
  label: "Google Applications",
  icon: {
    "16": "./gglappbtn-icon-16.png",
    "32": "./gglappbtn-icon-32.png",
    "64": "./gglappbtn-icon-64.png"
  },
  onChange: handleChange
});

var panel = panels.Panel({
  width: 250,
  height: 280,
  contentURL: self.data.url("gapps.html"),
  onHide: handleHide
});

function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
  }
}

function handleHide() {
  button.state('window', {checked: false});
}
