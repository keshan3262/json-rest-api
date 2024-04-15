# json-rest-api

This is a simple backend for operations with JSON files. All files are stored in `storage` directory.

## Entrypoints

`POST /create/:filename` Create a JSON file with the content specified in body.

`GET /list` Returns a list of all stored files.

`GET /read/:filename` Returns the content of the JSON file if it exists.

`PUT /update/:filename` Rewrites the content of the existent file with the request body.

`DELETE /delete/:filename` Deletes the specified file if it exists.
