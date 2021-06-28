# OpenNames API

This is the API of the OpenNames project. It will be reachable at https://api.opennam.es.


## Project requirements

To host the API yourself, you need to have [MongoDB](https://www.mongodb.com/node) and [node](https://nodejs.org/en/) installed. <br>Create a new DB and start MongoDB. Put the URL in the .env.example file. (Example: `mongodb://127.0.0.1:27017/OpenNames`)
<br>Rename `.env.example` to `.env`

## Run the API locally
Install the required dependencies:
```
yarn install
```

Start the API

```
node .
```