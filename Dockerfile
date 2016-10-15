FROM daocloud.io/library/node

MAINTAINER eastpiger @ Geek Pie Association

EXPOSE 8080

RUN mkdir /nearby
COPY . /nearby

RUN cd /nearby \
  && npm install

CMD [ "node", "index.js" ]
