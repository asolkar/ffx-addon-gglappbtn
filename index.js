// -------------------------------------------------
// Resources
// -------------------------------------------------

//
// Import SDK components
//
var { ToggleButton }        = require("sdk/ui/button/toggle");
var panels                  = require("sdk/panel");
var self                    = require("sdk/self");
// FIXME: This may be redundant with prefs
var ss                      = require("sdk/simple-storage");
var prefs                   = require("sdk/simple-prefs").prefs;
var { setTimeout,
      clearTimeout }        = require("sdk/timers");

//
// Placeholder for Google Apps information object sent in by the panel
// content script
//
var gapps_info;

// -------------------------------------------------
// Helper functions
// -------------------------------------------------

//
// Helper function to read 'applist' preference value
// Returns: App list as an array.
//
// Note: If there are more than 9 items in the applist preference value,
//       only the first 9 are returned. That is all we have space on the
//       grid for.
//
function get_pref_applist() {
  var ret;

  ret = prefs.applist.split(",", 9);

  ret.map(function (app) {
    app.replace(/\s+/gi, '');
  });

  return ret;
}

//
// Helper function for validating items in the App list array.
// Returns: applist if valid, empty array else
//
// Validated to make sure that App list items are valid keys to
// the App information object
//
function validate_applist(applist) {
  var ret = applist;

  applist.every(function(e,i,a) {
    if (!gapps_info.e) {
      return new Array;
    }
  });

  return applist;
}

// -------------------------------------------------
// Add-on UI elements and handlers
// -------------------------------------------------

//
// Main UI element added: A grid button on the tool-bar.
// This can be customized like any other button on the tool-bar
//
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

//
// Panel used to show Google Apps grid when tool-bar button is pressed
//
var panel = panels.Panel({
  width: 250,
  height: 290,
  contentURL: self.data.url("gapps.html"),
  contentScriptFile: [self.data.url("jquery.min.js"),
                      self.data.url("jquery-ui.min.js"),
                      self.data.url("gapps-info.js"),
                      self.data.url("gapps-panel.js")],
  onHide: handleHide
});

//
// Function to handle change event on the button
//
function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
  }
}

//
// Function to handle hide event on the panel (one that triggers
// when panel hides because mouse clicked outside of the panel)
//
function handleHide() {
  button.state('window', {checked: false});
}

// -------------------------------------------------
// Communication between add-on and panel
// -------------------------------------------------
//
// * Send initial sequence of app icons to the panel
//
panel.port.on('request-sequence', function(gi) {
  console.log("panel.port.on - request-sequence - Got sequence update request");
  gapps_info = gi;

  console.log(gapps_info);
  if (!ss.storage.sequence) {
    ss.storage.sequence = validate_applist(get_pref_applist());
  }
  panel.port.emit('sequence-update', ss.storage.sequence);
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
  prefs.applist = seq.join(',');
});

// -------------------------------------------------
// Preference listeners
// -------------------------------------------------
//
// * Monitor change in app list
//
var pref_change_timer;
require("sdk/simple-prefs").on('applist', function() {
  clearTimeout(pref_change_timer);
  pref_change_timer = setTimeout(function() {
    console.log("prefs.applist changed -> " + prefs.applist);
    ss.storage.sequence = validate_applist(get_pref_applist());
    panel.port.emit('sequence-update', ss.storage.sequence);
  }, 3000);
});
