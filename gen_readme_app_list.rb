#!/usr/bin/env ruby

require 'json'

applist_str = File.read("data/gapps-info.js")
applist_json = /{(.*)}/m.match(applist_str)[0]
applist = JSON.parse(applist_json)

applist.each { |key,value|
  puts "* `#{key}`: #{value['desc']}"
}
