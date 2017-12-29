// -----------------------------------------------
// Options UI and handling
// -----------------------------------------------
var default_applist = Object.keys(gapps_info).slice(0,9).join(',');

//
// Set applist falue from options form input into local storage
//
function save(e) {
  browser.storage.sync.set({
    appList: $("#appList").val()
  });
  e.preventDefault();
}

//
// Restore default applist into local storage
//
function setdefault(e) {
  var setting = browser.storage.sync.set({
    appList: default_applist
  });
  setting.then(function(items) {
    console.log("Defaults set");
    restore();
  })
  e.preventDefault();
}

//
// Restore applist value from local storage into form input
//
function restore() {
  function set(res) {
    if (res.appList === undefined) {
      res.appList = default_applist;
      console.log("Initial set")
    }
    $("#appList").val(res.appList);
    applist_edit();
  }
  function onError(e) {
    console.log("Error getting appList setting, restoring defaults");
    console.log(e);
    setdefault();
  }
  var getting = browser.storage.sync.get("appList");
  getting.then(set, onError);
}

//
// Colorize form input value based on correctness of app names and count
//
function validate_list(lst) {
  var sep = /\s*,\s*/;
  var apps = lst.split(sep);
  var val_arr = $('<div>');

  for (i = 0; i < apps.length; i++) {
    var cls = (i > 8) ? 'exc' :
              (gapps_info.hasOwnProperty(apps[i])) ?
                (((i>0) && (apps.slice(0,i).includes(apps[i]))) ? 'dup' : 'good') : 'bad';

    var a = $('<span>').attr('class', cls).text(apps[i]);
    val_arr.append(a);
    if ((apps.length > 1) && (i < apps.length-1)) {
      val_arr.append(",");
    }
  }
  return val_arr;
}

//
// Handler for applist form input. Triggers validation of input text
//
function applist_edit(e) {
  $("#applist-val").empty().append(validate_list($("#appList").val()));
}

//
// Main function for the options UI
//
$(function() {
  var ks = Object.keys(gapps_info);
  console.log("options.js - Entered");
  for (i=0,l=ks.length;i < l; i++) {
    key = ks[i];
    console.log(key)
    $("#supported_apps").append(
      $('<li>').attr('class', 'sa-name-cls')
               .data('sa-name', key).append(
                 $('<code>').text(key),$('<span>').text(": " + gapps_info[key]['desc'])
               )
    );
  }

  $("#default_apps").append(default_applist);
});

//
// Register listeners
//
$(document).ready(restore);
$("form#values").on("submit", save);
$("form#defs").on("submit", setdefault);
$("#appList").on("keyup", applist_edit);
browser.storage.onChanged.addListener(restore);
