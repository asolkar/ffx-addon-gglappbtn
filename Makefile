#
# Build extension package
#
VERSION   = 1.1
SOURCES   = manifest.json data/* icons/*
PACKAGE   = ../gglappbtn-$(VERSION).xpi
EXCLUDES  = Makefile README.md gen_readme_app_list.rb *.DS_Store

build: $(PACKAGE)
	@echo "Done"

$(PACKAGE): $(SOURCES)
	zip -r -FS $(PACKAGE) * -x $(EXCLUDES)
	@echo "Built $(PACKAGE)"

clean:
	rm $(PACKAGE)
