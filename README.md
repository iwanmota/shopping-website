# Shopping Website

This is a simple shopping website that allows users to browse products and manage a shopping cart. 

## Features

- View a list of products
- Add products to the shopping cart
- Remove products from the shopping cart
- Responsive design

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

## Database Information

- Database: SQLite3
- Database file: `server/shopping.db` (created automatically)
- Initial data: Defined in `server/initDb.js`
  ```javascript
  // Sample products in initDb.js
  const sampleProducts = [
      ['Wireless Earbuds', 79.99, 'High quality wireless earbuds with noise cancellation'],
      ['Smart Watch', 199.99, 'Fitness tracking smartwatch with heart rate monitor'],
      ['Laptop Backpack', 49.99, 'Water-resistant laptop backpack with USB charging port'],
      ['Bluetooth Speaker', 89.99, 'Portable wireless speaker with 20hr battery life'],
      ['Phone Charger', 24.99, 'Fast charging USB-C power adapter with cable']
  ];
  ```

To reset the database:
1. Delete `server/shopping.db`
2. Run `node server/initDb.js` again

## Technologies Used

- React
- JavaScript
- CSS
- SQLite3
- Express.js

## Contributing

Feel free to submit issues or pull requests for improvements!