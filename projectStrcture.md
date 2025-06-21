evcs-digital-twin/
├── backend/
│   ├── app/
│   │   ├── api/               # API routers (charging, stations, vehicles)
│   │   ├── core/              # Core config, settings, security
│   │   ├── models/            # Pydantic models (schemas)
│   │   ├── services/          # Business logic (charging algorithms, monitoring)
│   │   ├── db/                # Database connection and utilities (MongoDB)
│   │   ├── simulations/       # EV charging process simulation logic
│   │   └── main.py            # FastAPI app entrypoint
│   ├── tests/                 # Backend tests (pytest)
│   ├── requirements.txt       # Python dependencies
│   └── README.md
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/               # Axios or Fetch service calls to FastAPI
│   │   ├── components/        # UI components (StationCard, VehicleStatus, ChargingGraph)
│   │   ├── pages/             # Pages (Dashboard, StationDetails, VehicleList)
│   │   ├── hooks/             # Custom hooks (e.g., useStationStatus, useChargingSimulation)
│   │   ├── contexts/          # Context providers (e.g., AuthContext, StationContext)
│   │   ├── utils/             # Utility functions (format time, charging math)
│   │   ├── assets/            # Images, icons
│   │   ├── App.jsx            # Main App component
│   │   └── main.jsx           # ReactDOM rendering
│   ├── package.json           # Frontend dependencies
│   └── README.md
│
├── docker-compose.yml         # (Optional) For running frontend + backend + db easily
├── README.md                   # Project overview
└── .gitignore
