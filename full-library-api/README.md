# Full Library API

## Tech Stack
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Pagination and filtering
- Modular folder structure

## Folder Structure
- controllers/
- models/
- routes/
- services/
- middleware/
- config/
- utils/
- uploads/

## API Endpoints

### Users
- POST /users/register
- POST /users/login
- GET /users (auth) — paginated
- GET /users/:id (auth)
- PATCH /users/upload-profile-picture (auth)

### Books
- GET /books — paginated & filtered
- GET /books/:id
- POST /books (auth)
- PUT /books/:id (auth)
- DELETE /books/:id (auth)
- PATCH /books/:id/upload-cover (auth)

### Authors
- GET /authors — paginated & filtered
- GET /authors/:id
- POST /authors (auth)
- PUT /authors/:id (auth)
- DELETE /authors/:id (auth)

### Loans
- GET /loans — paginated & filtered
- POST /loans (auth)
- PUT /loans/:id (auth)
- DELETE /loans/:id (auth)

### Reviews
- GET /books/:id/reviews
- POST /books/:id/reviews (auth)
- PUT /books/:id/reviews/:reviewId (auth)
- DELETE /books/:id/reviews/:reviewId (auth)

## Notes
- Secure endpoints with JWT middleware
- File uploads handled using Multer and stored in `uploads/`
- Test endpoints using Postman
- Each endpoint returns proper success and error responses
