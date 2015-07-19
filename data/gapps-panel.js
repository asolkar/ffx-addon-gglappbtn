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
  return as;
}

//
// Checks if the current state of app sequence is valid. If not, uses
// a default sequence of apps
//
// FIXME: See if 'applist' preference can be used instead of default. It may
//        already be rendering the default below useless.
//
function load_sequence() {
  var d = ["gplus","gmail","gcal","gnews","gdrv","gphotos","gmaps","gplay","gytube"];
  return (sequence.length > 8) ? sequence : d;
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
                .attr('class', 'ga-lnk')
                .attr('target', '_blank').append(
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
function load_panel() {
  var gapps = load_sequence();

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
    console.log("self.port.emit - Sending sequence-update event to add-on " + s);
    self.port.emit('sequence-update', s);
    setTimeout(function() {
      has_update = 0;
      console.log("Sortupdate done");
    }, 100);
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
      console.log("self.port.emit - Sending link-clicked event to add-on");
      self.port.emit('link-clicked', 'lnk');
    }
  });
}

// -------------------------------------------------
// Main function that sets up the panel
// -------------------------------------------------
$(function() {
  //
  // Initiate the panel by requesting current list of apps to display
  //
  self.port.emit('request-sequence', gapps_info);

  //
  // Receive list of apps from the add-on and load the panel
  //
  self.port.on('sequence-update', function(seq) {
    console.log("self.port.on - Got sequence update " + seq);
    sequence = seq;

    load_panel();
  });

});
