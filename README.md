# CodeAlpha — Simple E-commerce Store (Express + SQLite)

A basic e-commerce web app built for a Full Stack Development Internship task.

✅ Product listing  
✅ Product details page  
✅ Shopping cart (LocalStorage)  
✅ User registration & login (JWT)  
✅ Order processing (orders stored in SQLite)  

## Tech Stack
- **Backend:** Node.js, Express.js, Prisma ORM, SQLite
- **Auth:** JWT + bcrypt
- **Frontend:** HTML, CSS, Vanilla JavaScript

---

## 1) Run the project locally

### Backend (API)
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```
API runs at: `http://localhost:4000`

### Frontend
Open `frontend/index.html` using VS Code **Live Server** (recommended).

Alternative:
```bash
cd frontend
npx serve .
```

---

## 2) API Endpoints

### Auth
- `POST /api/auth/register`  
  body: `{ "name": "Awais", "email": "a@b.com", "password": "secret123" }`
- `POST /api/auth/login`  
  body: `{ "email": "a@b.com", "password": "secret123" }`
- `GET /api/auth/me` (Bearer token)

### Products
- `GET /api/products`
- `GET /api/products/:id`

### Orders
- `POST /api/orders` (Bearer token)  
  body: `{ "items": [{ "productId": 1, "quantity": 2 }] }`
- `GET /api/orders/my` (Bearer token)
- `GET /api/orders/:id` (Bearer token, owner only)

---

## 3) Notes
- Cart is stored in the browser using LocalStorage.
- Orders are stored in SQLite (via Prisma).
- Stock is validated and decremented when an order is placed.

---

## 4) Future Improvements (optional)
- Payments integration (Stripe)
- Admin dashboard for adding products
- Search, filters, pagination
- Image upload
