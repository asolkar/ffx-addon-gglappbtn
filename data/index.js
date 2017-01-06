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
function get_pref_applist(applist) {
  var ret;

  ret = applist.split(",", 9)
  ret.map(function (app) {
    app.replace(/\s+/gi, '');
  });

  return ret;
};

//
// Helper function for validating items in the App list array.
// Returns: applist if valid, empty array else
//
// Validated to make sure that App list items are valid keys to
// the App information object
//
function validate_applist(applist,gapps_info) {
  applist.every(function(e,i,a) {
    if (!gapps_info.e) {
      return new Array;
    }
  });

  return applist;
}

// -------------------------------------------------
// Communication between add-on and panel
// -------------------------------------------------
browser.runtime.onMessage.addListener(function(request,sender,sendResponse) {
  var default_applist = Object.keys(gapps_info).slice(0,9).join(',');

  console.log(request);

  if (request.op == 'request-sequence') {
    //
    // Send initial sequence of app icons to the panel
    //
    browser.storage.local.get({
      appList: default_applist
    }, function(items) {
      console.log("request-sequence - Loaded " + items.appList + " into cache");

      var applst = validate_applist(get_pref_applist(items.appList), request.cont);
      sendResponse({'op': 'sequence-update',
                    'cont': applst});
    });

  }
  // else if (request.op == 'sequence-update') {
  //   //
  //   // * When sequence is updated in panel, update prefs
  //   //
  //   //ss.storage.sequence = seq;
  //   //prefs.applist = seq.join(',');
  // }
  // else if (request.op == 'link-clicked') {
  //   //
  //   // * When a link is clicked in the panel, hide the panel
  //   //
  //   //panel.hide();
  // }
  return true;
});
console.log("index.js - Registered message listener");
