.PHONY: dist

all: dist

dist:
	rm -f gcts.zip
	zip gcts.zip --exclude '*~' --exclude .git --exclude .github --exclude Makefile --exclude 'resources/*' -r *
