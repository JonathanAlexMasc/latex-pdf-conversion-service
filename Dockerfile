FROM texlive/texlive:latest

WORKDIR /data

RUN apt-get update && apt-get install -y nodejs npm

COPY . /data
RUN npm install

CMD ["node", "server.js"]
