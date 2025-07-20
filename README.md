# Shopping Website

This is a shopping website that allows users to browse products, manage a shopping cart, and includes an authentication system with role-based access control.

## Features

- View a list of products with details and images
- Add products to the shopping cart
- Special handling for sale items with limited quantities
- User authentication system with role-based access control
- Admin interface for product management
- Responsive design for mobile and desktop

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd shopping-website
   ```

3. Install the frontend dependencies:
   ```
   npm install
   ```

4. Install the backend dependencies:
   ```
   cd server
   npm install
   cd ..
   ```

5. Initialize the SQLite database:
   ```
   node server/initDb.js
   ```
   This creates a `shopping.db` file with sample data defined in `server/initDb.js`

6. Start the backend server:
   ```
   node server/server.js
   ```
   The server will run on http://localhost:3001

7. In a new terminal, start the frontend development server:
   ```
   npm start
   ```
   The app will run on http://localhost:3000

## Authentication System

The application includes a complete authentication system with the following features:

- User registration with email and password
- Secure password storage using bcrypt
- JWT-based authentication
- Role-based access control (customer and admin roles)
- Protected routes for authenticated users
- Admin-only routes for product management

### Default Users

The system is initialized with two default users:

1. Admin user:
   - Email: admin@shopsmart.com
   - Password: admin123
   - Role: admin

2. Customer user:
   - Email: customer@example.com
   - Password: customer123
   - Role: customer

## Database Information

- Database: SQLite3
- Database file: `server/shopping.db` (created automatically)
- Initial data: Defined in `server/initDb.js`

### Products Table
```javascript
// Sample products in initDb.js
const sampleProducts = [
    ['Premium Coffee Maker', 199.99, 'Automatic drip coffee maker with built-in grinder', '/images/products/coffee-maker.jpg', 1, 149.99, 5],
    ['Wireless Headphones', 149.99, 'Noise-cancelling Bluetooth headphones with 30-hour battery', '/images/products/headphones.jpg', 1, 99.99, 10],
    ['Smart Watch', 299.99, 'Fitness tracking and notifications with OLED display', '/images/products/smartwatch.jpg', 0, null, 0],
    ['Laptop Backpack', 79.99, 'Water-resistant backpack with USB charging port', '/images/products/backpack.jpg', 1, 49.99, 15],
    ['Mechanical Keyboard', 129.99, 'RGB backlit mechanical gaming keyboard with Cherry MX switches', '/images/products/keyboard.jpg', 0, null, 0],
    ['Portable Speaker', 89.99, 'Waterproof Bluetooth speaker with 20-hour playtime', '/images/products/speaker.jpg', 0, null, 0]
];
```

### Users Table
The database includes a users table for authentication with the following schema:
- id: Unique identifier for each user
- email: User's email address (required, unique)
- password: Hashed password using bcrypt (required)
- firstName: User's first name
- lastName: User's last name
- role: User's role (customer or admin, defaults to customer)
- createdAt: Timestamp when the user was created
- updatedAt: Timestamp when the user was last updated

To reset the database:
1. Delete `server/shopping.db`
2. Run `node server/initDb.js` again

## Project Structure

```
shopping-website/
├── .kiro/                  # Kiro specs and configuration
├── public/                 # Static assets
│   ├── images/             # Product images
│   └── index.html          # HTML template
├── server/                 # Backend server
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── initDb.js           # Database initialization
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express server
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── context/            # React context providers
│   ├── styles/             # CSS styles
│   ├── App.jsx             # Main application component
│   └── index.js            # Application entry point
└── package.json            # Frontend dependencies
```

## Technologies Used

- **Frontend**:
  - React 19
  - React Router 7
  - CSS3
  - Context API for state management

- **Backend**:
  - Node.js
  - Express.js
  - SQLite3
  - JWT for authentication
  - bcrypt for password hashing

## Development

For detailed information about development workflows, coding standards, and contribution guidelines, please see the [DEVELOPMENT.md](DEVELOPMENT.md) file.

## Contributing

Contributions are welcome! Please read the [DEVELOPMENT.md](DEVELOPMENT.md) file for guidelines on how to contribute to this project.

## License

This project is licensed under the ISC License.