# Micro-annotator
Micro-annotator is a small, proof-of-concept webapp to create web annotations on segments of collection
documents, including both image segments and text segments. Image segments are provided by a IIIF server, text segments
by an instance of [TextRepo](https://github.com/knaw-huc/textrepo) and annotations by an adapted version of the [Elucidate](https://github.com/dlcs/elucidate-server) web annotation server.

## WIP: Development setup

### Preparation

In parent dir:

- Get untanngle-elucidate data and import scripts:
```shell
git clone -b tt-878-republic-annotaties-omzetten https://github.com/knaw-huc/un-t-ann-gle.git untangle2elucidate
```

- Create textrepo `txt_anchor` tag using development docker-compose setup:
```
git clone -b txt_anchor https://github.com/knaw-huc/textrepo.git textrepo
cd textrepo && cp examples/development/* .
sed -i '' 's#knawhuc/textrepo-app:${DOCKER_TAG}#textrepo-elasticsearch:txt_anchor#' docker-compose-dev.yml
source docker-compose.env && docker-compose -f docker-compose-dev.yml build textrepo-app
```

In micro-annotator:

-  Remove `.example` postfix of env files in `./`, `./dev/elucidate` and `./dev/textrepo`.

### Run

Start containers of elucidate, textrepo and annotator:
```
docker-compose -f dev/elucidate/docker-compose.yml up -d
docker-compose -f dev/textrepo/docker-compose.yml up -d
docker-compose up
```

Open http://localhost:8000
