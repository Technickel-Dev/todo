CORS - if frontend is on a different domain, we need to enable CORS. They are both on localhost so we don't need it right technically, but it's good to know.

Validation - .NET 10 has built-in validation for models

Minimal APIs - we can use minimal APIs to create a lightweight API for our todo list. 

seperate handler for unit testing

Unit testing uses mock for the database context

integration testing uses sqlite in-memory database cleared after each test. Did integration because I find there can be issues with the mock db for unit tests in practice

problem details for error responses - standard way to return error responses

no dto or respository - keep things simple for a simple app