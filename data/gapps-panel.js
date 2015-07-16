//
// Content script for the panel
//
var has_update = 0;
var sequence = new Array();
var gapps_info = {
  "gplus": {
    "url" : "https://plus.google.com/",
    "desc" : "Google+"
  },
  "gmail": {
    "url" : "https://gmail.com/",
    "desc" : "Gmail"
  },
  "gcal": {
    "url" : "https://www.google.com/calendar/",
    "desc" : "Calendar"
  },
  "gdoc": {
    "url" : "https://docs.google.com/",
    "desc" : "Docs"
  },
  "gdrv": {
    "url" : "https://drive.google.com/",
    "desc" : "Drive"
  },
  "gphotos": {
    "url" : "https://photos.google.com/",
    "desc" : "Photos"
  },
  "gmaps": {
    "url" : "https://maps.google.com/",
    "desc" : "Maps"
  },
  "gplay": {
    "url" : "https://play.google.com/",
    "desc" : "Play"
  },
  "gytube": {
    "url" : "https://youtube.com/",
    "desc" : "YouTube"
  }
};

function get_sequence() {
  as = new Array();
  $("#ga-grid li").each(function() {
    as.push($(this).data("ga-name"));
  });
  return as;
}

function load_sequence() {
  var d = ["gplus","gmail","gcal","gdoc","gdrv","gphotos","gmaps","gplay","gytube"];
  return (sequence.length > 8) ? sequence : d;
}

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
          ).append(
            $('<span>').attr('class', 'ga-ico-desc').append(gapps_info[key]['desc'])
          )
        )
    );
  }
}

function load_panel() {
  var gapps = load_sequence();

  console.log("Loading - " + gapps);

  layout_apps(gapps);

  $("#ga-grid").sortable();
  $("#ga-grid").disableSelection();

  $("#ga-grid").on("sortupdate", function(event,ui) {
    var s = get_sequence();
    console.log("self.port.emit - Sending sequence-update event to add-on " + s);
    self.port.emit('sequence-update', s);
    setTimeout(function() {
      has_update = 0;
      console.log("Sortupdate done");
    }, 100);
  });

  $("#ga-grid").on("sortstart", function(event,ui) {
    console.log("Started sorting. Following click will not be entertained until sortupdate");
    has_update = 1;
  });

  $(".ga-lnk").on("click", function(e) {
    if (has_update) {
      console.log("Skipping this click event - has_update=1");
    } else {
      console.log("self.port.emit - Sending link-clicked event to add-on");
      self.port.emit('link-clicked', 'lnk');
    }
  });
}

$(function() {
  self.port.emit('request-sequence', 'none');

  self.port.on('sequence-init', function(seq) {
    console.log("self.port.on - Got sequence init " + seq);
    sequence = seq;

    load_panel();
  });

});
