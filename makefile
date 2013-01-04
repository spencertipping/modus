srcfiles = $(subst .waul.sdoc,,$(wildcard *.waul.sdoc))
docfiles = $(foreach s,$(srcfiles),$(s).md)
jsfiles  = $(foreach s,$(srcfiles),$(s).js)

all: $(docfiles) $(jsfiles)

%.js: %.waul.sdoc
	waul $<

%.md: %.waul.sdoc
	sdoc cat markdown::$< > $@
