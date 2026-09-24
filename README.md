# 🚀 Manakin Social Adz

A comprehensive MERN (MongoDB, Express, React, Node.js) stack application for managing social media ads campaigns, inventory, and teams with AI-powered insights and automation.

## 📁 Project Structure

The project follows a monorepo-like structure with distinct frontend and backend applications.

```
ManakinSocialAdz/
├── backend/          # Express.js API and core logic
│   ├── models/       # Mongoose schemas for data models
│   ├── routes/       # API route definitions
│   ├── services/     # Business logic and external service integrations
│   ├── config/       # Configuration management
│   ├── app.py        # FastAPI application entry point
│   └── socialadz.db  # SQLite database file
└── frontend/         # React application
    ├── src/          # Source code
    ├── public/       # Static assets
    └── package.json
```

## 🛠️ Getting Started

### Prerequisites

- **Node.js** (v16.x or higher recommended)
- **npm** (v8.x or higher) or **Yarn**
- **MongoDB** (local or cloud instance)
- **Python** (v3.8 or higher recommended)

### Installation

#### Backend

```bash
cd backend
pip install -r requirements.txt  # Install Python dependencies
source venv/bin/activate          # Activate virtual environment (Linux/Mac)
# venv\Scripts\activate          # Activate virtual environment (Windows)

python main.py
```

#### Frontend

```bash
cd frontend
npm install                         # Install Node.js dependencies
npm run dev
```

### Development Commands

| Command | Description |
|---------|-------------|
| `python main.py` | Run the FastAPI server |
| `npm run dev` | Start the React development server |
| `npm run build` | Build the React application |
| `npm run preview` | Preview the production build |

## 🔌 API Reference

The backend API is available at `http://localhost:8000`.

### Health Check

```http
GET /health
```

### Campaign Management

- **Get all campaigns**: `GET /api/v1/campaigns`
- **Create campaign**: `POST /api/v1/campaigns`
- **Get campaign by ID**: `GET /api/v1/campaigns/:id`
- **Update campaign**: `PUT /api/v1/campaigns/:id`
- **Delete campaign**: `DELETE /api/v1/campaigns/:id`

### Inventory Management

- **Get all inventory**: `GET /api/v1/inventory`
- **Create inventory**: `POST /api/v1/inventory`
- **Get inventory by ID**: `GET /api/v1/inventory/:id`
- **Update inventory**: `PUT /api/v1/inventory/:id`
- **Delete inventory**: `DELETE /api/v1/inventory/:id`

### Team Management

- **Get all teams**: `GET /api/v1/teams`
- **Create team**: `POST /api/v1/teams`
- **Get team by ID**: `GET /api/v1/teams/:id`
- **Update team**: `PUT /api/v1/teams/:id`
- **Delete team**: `DELETE /api/v1/teams/:id`

### Reports

- **Get sales reports**: `GET /api/v1/reports/sales`
- **Get team performance**: `GET /api/v1/reports/team-performance`
- **Get inventory utilization**: `GET /api/v1/reports/inventory-utilization`

### AI Insights

- **Get AI trend analysis**: `GET /api/v1/ai/trends`
- **Get AI recommendations**: `GET /api/v1/ai/recommendations`
- **Get ad performance prediction**: `GET /api/v1/ai/predictions`

### Notifications

- **Get all notifications**: `GET /api/v1/notifications`
- **Mark notification as read**: `PUT /api/v1/notifications/:id/read`

### User Management

- **Get current user**: `GET /api/v1/users/me`
- **Update user profile**: `PUT /api/v1/users/me`
- **Change password**: `PUT /api/v1/users/me/password`

## ⚙️ Configuration

Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=8000
DATABASE_URL=mongodb://localhost:27017/socialadz
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
```

## 🔐 Authentication

- **Login**: `POST /api/v1/auth/login`
  - Returns JWT token for authenticated requests
- **Logout**: `POST /api/v1/auth/logout`
  - Invalidates the JWT token

## 📊 Features

- **Campaign Management**: Create, track, and analyze ad campaigns
- **Inventory Management**: Manage ad inventory and placements
- **Team Management**: Assign teams to campaigns and track performance
- **AI Analytics**: Get trend analysis and performance predictions
- **Reporting**: Generate sales and performance reports
- **Notifications**: Real-time notifications for campaign updates
- **User Management**: Secure user authentication and profile management
- **Responsive UI**: Modern and intuitive user interface

## 🧪 Testing

Backend tests: `pytest`

```bash
cd backend
pytest
```

## 📈 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For issues and feature requests, please open an issue in the [Issues](https://github.com/rashidiqubal/ManakinSocialAdz/issues) section.

---

**Built with ❤️ by Rashid Iqubal**
