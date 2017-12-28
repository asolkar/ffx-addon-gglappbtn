// -------------------------------------------------
// Content script for the panel
// -------------------------------------------------
var has_update = 0;
var sequence = new Array();

// -------------------------------------------------
// Helper functions
// -------------------------------------------------
//
// Goes through current app layout and generates an array (sequential)
// of apps displayed
//
function get_sequence() {
  as = new Array();
  $("#ga-grid li").each(function() {
    as.push($(this).data("ga-name"));
  });
  return as.join(',');
}

//
// Based on the current app sequence, construct the grid layout in the panel
//
function layout_apps(list) {
  $("#ga-grid").empty();

  for (i=0,l=list.length;i < l; i++) {
    key = list[i];
    $("#ga-grid").append(
      $('<li>').attr('class', 'ui-state-default')
               .data('ga-name', key).append(
        $('<a>').attr('href', gapps_info[key]['url'])
                .attr('class', 'ga-lnk').append(
            $('<span>').attr('class', 'ga-ico gi-' + key)
                       .css('background-position', gapps_info[key]['iconpos'])
          ).append(
            $('<span>').attr('class', 'ga-ico-desc').text(gapps_info[key]['desc'])
          )
        )
    );
  }
}

//
// Layout the panel and set up event handlers
//
function load_panel(gapps) {
  console.log("Loading - " + gapps);

  layout_apps(gapps);

  //
  // Set up grid sorting
  //
  $("#ga-grid").sortable();
  $("#ga-grid").disableSelection();

  //
  // Let add-on know that app sequence was changed
  //
  $("#ga-grid").on("sortupdate", function(event,ui) {
    var s = get_sequence();
    browser.storage.sync.set({'appList': s});
    console.log("Saving updated sequence after sortupdate");
  });

  //
  // Setup to mask click handling during sorting
  //
  $("#ga-grid").on("sortstart", function(event,ui) {
    console.log("Started sorting. Following click will not be entertained until sortupdate");
    has_update = 1;
  });

  //
  // Send link click event to add-on, so that panel can be hidden
  //
  $(".ga-lnk").on("click", function(e) {
    if (has_update) {
      console.log("Skipping this click event - has_update=1");
    } else {
      var new_tab = browser.tabs.create({url: this.href});
      e.preventDefault();
      window.close();
    }
  });
}

//
// Split the comma separated app list into an array. Use only the first
// 9 apps to form 3x3 grid
//
function get_applist_arr(applist) {
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
// Main function that sets up the panel
// -------------------------------------------------
$(function() {
  var default_applist = Object.keys(gapps_info).slice(0,9).join(',');

  browser.storage.sync.get({
    appList: default_applist
  }, function(items) {
    var applst = validate_applist(get_applist_arr(items.appList), gapps_info);
    load_panel(applst);
  });
});
