# PUEFix Garage (Frontend)

A comprehensive React-based frontend for PUEFix Garage management system built with MERN stack technologies.

## Features

### 🚗 Car Profile & Repair History Module

- **Create** new car profiles with customer and vehicle information
- **View** complete car profiles with repair history
- **Update** customer contact information and vehicle details
- **Delete** car profiles (Owner only)
- **Search** cars by license plate, customer name, or phone number
- **Repair History** tracking with detailed service records

### 🔧 Job Sheet & Repair Task Management

- **Create** job sheets for repair requests
- **Assign** jobs to specific mechanics
- **Track** real-time progress with task checklists
- **Update** task completion status
- **View** jobs by car or mechanic
- **Reassign** or remove job sheets (Owner only)

### 📦 Spare Parts Inventory Management

- **Add** new parts with supplier and pricing information
- **Update** stock levels and part details
- **Delete** obsolete parts (Inventory Manager/Owner only)
- **Search** and filter parts by category or stock status
- **Low Stock Alerts** for automatic notifications
- **Usage Tracking** with full traceability

### 👨‍🔧 Mechanic Management

- **Owner Dashboard** with comprehensive management capabilities
- **Tablet Interface** for mechanics with job viewing and updates
- **Role-based Access** with appropriate feature restrictions
- **Performance Tracking** with metrics and analytics
- **Profile Management** with skills and availability

### 📊 Reports & Payments

- **Financial Reports** with revenue and income tracking
- **Performance Analytics** for mechanics and workshop
- **Parts Usage Statistics** and cost breakdowns
- **Payment Management** with multiple payment methods
- **Export Capabilities** for PDF and Excel reports

## Technology Stack

- **React 18** - Frontend framework
- **Tailwind CSS** - Styling and responsive design
- **JavaScript** - Programming language
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Context API** - State management

## Installation & Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm start
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   └── Layout.js              # Main layout with navigation
├── context/
│   └── AppContext.js          # Global state management
├── pages/
│   ├── Dashboard.js           # Main dashboard
│   ├── CarProfile.js          # Car management
│   ├── JobSheets.js           # Job management
│   ├── Inventory.js           # Inventory management
│   ├── Mechanics.js           # Mechanic management
│   ├── Reports.js             # Reports & analytics
│   └── MechanicView.js        # Tablet interface for mechanics
├── App.js                     # Main app component
├── index.js                   # Entry point
└── index.css                  # Global styles
```

## User Roles & Permissions

### Owner

- Full access to all modules
- Can delete records across all modules
- Access to comprehensive reports and analytics
- Can manage all user roles

### Receptionist

- Can create and view car profiles
- Can create and view job sheets
- Can view repair history
- Cannot delete records

### Mechanic

- Tablet-optimized interface
- Can view assigned jobs only
- Can update task completion status
- Cannot access management features

### Inventory Manager

- Full inventory management access
- Can add, update, and delete inventory items
- Access to inventory reports
- Cannot access other modules

## Key Features

### Responsive Design

- **Mobile-first** approach with tablet optimization
- **Clean card-based layouts** for easy navigation
- **Intuitive touch interfaces** for tablet users
- **Modern typography** with clear visual hierarchy

### Real-time Updates

- **Live progress tracking** for job sheets
- **Instant status updates** across all modules
- **Real-time inventory alerts** for low stock

### Search & Filtering

- **Global search** across all modules
- **Advanced filtering** options
- **Quick access** to frequently used data

### Data Management

- **CRUD operations** for all entities
- **Data validation** and error handling
- **Confirmation dialogs** for destructive actions
- **Form validation** with user-friendly error messages

## Usage Examples

### Adding a New Car

1. Navigate to "Car Profiles"
2. Click "Add New Car"
3. Fill in customer and vehicle details
4. Save to create the profile

### Creating a Job Sheet

1. Go to "Job Sheets"
2. Click "Create Job Sheet"
3. Select car and assign mechanic
4. Add tasks and estimated completion date

### Managing Inventory

1. Access "Inventory" module
2. Add new parts or update existing ones
3. Monitor stock levels and alerts
4. Track usage and supplier information

### Mechanic Tablet View

1. Access `/mechanic` route
2. Select mechanic from dropdown
3. View assigned jobs and tasks
4. Update task completion status

## Future Enhancements

- **Backend Integration** with Express.js and MongoDB
- **Real-time Notifications** with WebSocket support
- **Advanced Analytics** with chart libraries
- **Mobile App** with React Native
- **Multi-location Support** for workshop chains
- **Customer Portal** for service history access

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

**Note**: This is a frontend-only implementation. For a complete MERN stack application, you'll need to implement the backend API with Express.js and MongoDB integration.
