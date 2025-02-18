# /users/register

This endpoint registers a new user.

## Method
POST

## Request Body
```json
{
  "fullname": {
    "firstname": "string",
    "lastname": "string"
  },
  "email": "string (valid email format)",
  "password": "string (min length: 6)"
}
```

• All fields are required.  
• The user's password is hashed before storing.

## Response
• On success (201): Returns a JSON containing a token and user details.  
• On validation error (400): Returns an array of error messages.

## Example Response
**Success (201)**
```json
{
  "token": "string",
  "user": {
    "id": 123,
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john@example.com"
  }
}
```
**Error (400)**
```json
[
  "Invalid email format",
  "Password length must be at least 6"
]
```

# /users/login

## Method
POST

## Request Body
```json
{
  "email": "string (valid email format)",
  "password": "string (min length: 6)"
}
```

## Response
• On success (200): Returns a JSON containing a token and user details  
• On authentication error (401): Returns an error message

## Example Response
**Success (200)**
```json
{
  "token": "string",
  "user": {
    "id": 123,
    "fullname": {
      "firstname": "Jane",
      "lastname": "Doe"
    },
    "email": "jane@example.com"
  }
}
```
**Error (401)**
```json
{
  "message": "Invalid email or password"
}
```

# /users/profile

## Method
GET

## Authentication
Requires Bearer token in Authorization header

## Response
• On success (200): Returns user profile details  
• On unauthorized (401): Returns authentication error

## Example Response
**Success (200)**
```json
{
  "user": {
    "id": 123,
    "fullname": {
      "firstname": "Jane",
      "lastname": "Doe"
    },
    "email": "jane@example.com"
  }
}
```
**Error (401)**
```json
{
  "message": "Unauthorized access"
}
```

# /users/logout

## Method
POST

## Authentication
Requires Bearer token in Authorization header

## Response
• On success (200): Returns logout confirmation  
• On unauthorized (401): Returns authentication error

## Example Response
**Success (200)**
```json
{
  "message": "Successfully logged out"
}
```
**Error (401)**
```json
{
  "message": "Unauthorized access"
}
```
