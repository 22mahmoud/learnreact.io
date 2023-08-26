source = src
output = dist
bin = bin

md_files := $(shell find $(source) -name "*.md")
html_files := $(patsubst $(source)/%.md,$(output)/%.html,$(md_files))

thumb := $(bin)/thumb
rss := $(bin)/rss
sitemap := $(bin)/sitemap
vercel_build := $(bin)/vercel-build

pandoc := pandoc-3.1.6.2
pandoc_linux :="$(pandoc)-linux-amd64.tar.gz

export PATH := ${PATH}:${PWD}/${pandoc}/bin

vercel:
	@yup install wget
	@wget https://github.com/jgm/pandoc/releases/download/3.1.6.2/$(pandoc_linux) 
	@tar -xvf $(pandoc_linux)

install: html static image dist/sitemap.xml dist/rss.xml public

dev:
	find src templates -type f | entr make

html: $(html_files)

dist/rss.xml: $(md_files) $(rss)
	@$(rss)

dist/sitemap.xml: $(md_files) $(sitemap)
	@$(sitemap)

dist/%.html: src/%.md templates/* $(MD_TO_HTML)
	@mkdir -p $(@D)
	@pandoc -d pandoc.yaml $< -o $@
	@echo "[html generated]:" $@

static:
	cd $(source) && find . -type f ! -name "*.md" -print0 | cpio -pdvm0 ../$(output)

public:
	cp -r public/* $(output)

image:
	@$(thumb)

clean: 
	@rm -vrf $(output)


.PHONY: all html static image clean dev public vercel
