# This Makefile is based on the Makefile defined in the Python Best Practices repository:
# https://git.datapunt.amsterdam.nl/Datapunt/python-best-practices/blob/master/dependency_management/
#
# VERSION = 2020.01.29
.PHONY: app manifests

NAME = $*

export API_PORT=31410
export AUTH_PORT=31430
export IMAGE_PORT_API=31450
export ADMIN_PORT=31470
export CMS_PORT=31490
export BUILD_TARGET=release-with-packages

dc = docker compose
run = $(dc) run --rm

help:                               ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

requirements:
	npm i --package-lock-only

build/%:                              ## Build docker image
	$(dc) build $(NAME) 

push/%:                               ## Push docker image to registry
	$(dc) push $(NAME)

test/%:                               ## Execute tests
	# TODO

dev:
	$(dc) up

clean:                              ## Clean docker stuff
	$(dc) down -v --remove-orphans

env:                                ## Print current env
	env | sort
