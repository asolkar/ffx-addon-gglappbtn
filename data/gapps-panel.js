// -------------------------------------------------
// Content script for the panel
// -------------------------------------------------

// -------------------------------------------------
// Resources
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
// Checks if the current state of app sequence is valid. If not, uses
// a default sequence of apps
//
//function load_sequence() {
// var d = get_pref_applist();
//  return (sequence.length > 8) ? sequence : d;
//}

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
            $('<span>').attr('class', 'ga-ico-desc').append(gapps_info[key]['desc'])
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
    browser.storage.local.set({'appList': s});
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

// -------------------------------------------------
// Main function that sets up the panel
// -------------------------------------------------
$(function() {
  console.log("gapps-panel.js - Entered");
  //
  // Initiate the panel by requesting current list of apps to display
  //
  var sending = browser.runtime.sendMessage({
    'op': 'request-sequence',
    'cont': gapps_info
  });
  sending.then(function(msg) {
    console.log("sequence-update - msg_listener - Msg: " + msg);
    if (msg.op == 'sequence-update') {
      sequence = msg.cont;
      load_panel(sequence);
    }
  });
  console.log("gapps-panel.js - Sent request-sequence message");
});
