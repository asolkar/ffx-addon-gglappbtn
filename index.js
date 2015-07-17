var { ToggleButton } = require("sdk/ui/button/toggle");
var panels = require("sdk/panel");
var self = require("sdk/self");
var ss = require("sdk/simple-storage");
var prefs = require("sdk/simple-prefs").prefs;
var app_info = require("data/app_info.json");

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

if (!ss.storage.sequence) {

  ss.storage.sequence = prefs.applist;
}

var panel = panels.Panel({
  width: 250,
  height: 290,
  contentURL: self.data.url("gapps.html"),
  contentScriptFile: [self.data.url("jquery.min.js"),
                      self.data.url("jquery-ui.min.js"),
                      self.data.url("gapps-panel.js")],
  onHide: handleHide
});

function get_pref_applist() {
  var ret;

  ret = prefs.applist.split(",", 9).map(function (app) {
    app.replace(/\s+/gi, '');
  });

  return ret;
}

//
// Returns: applist if valid, empty array else
//
function validate_applist(applist) {
  var ret = applist;

  applist.every(function(e,i,a) {

  });

}

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

//
// Communication with panel
//
// * Send initial sequence of app icons to the panel
//
panel.port.on('request-sequence', function() {
  console.log("panel.port.on - request-sequence - Got initial sequence request");
  // console.log("panel.port.emit - sending " + ss.storage.sequence);
  panel.port.emit('sequence-init', ss.storage.sequence);
});

//
// * When a link is clicked in the panel, hide the panel
//
panel.port.on('link-clicked', function(lnk) {
  console.log("panel.port.on - Got link-clicked event from panel. Closing panel...");
  panel.hide();
});

//
// * When sequence is updated in panel, update prefs
//
panel.port.on('sequence-update', function(seq) {
  console.log("panel.port.on - Got sequence-update event from panel - " + seq);
  ss.storage.sequence = seq;
  // console.log("panel.port.on - Sequence is now " + ss.storage.sequence);
});
