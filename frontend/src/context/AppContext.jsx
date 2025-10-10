import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  user: {
    id: 1,
    name: 'John Doe',
    role: 'owner', // 'owner', 'receptionist', 'mechanic', 'inventory_manager'
    email: 'john@workshop.com'
  },
  cars: [],
  repairHistory: [],
  jobSheets: [],
  mechanics: [],
  inventory: [],
  payments: []
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CARS':
      return {
        ...state,
        cars: action.payload
      };
    case 'ADD_CAR':
      return {
        ...state,
        cars: [...state.cars, { ...action.payload }]
      };
    case 'UPDATE_CAR':
      return {
        ...state,
        cars: state.cars.map(car => 
          car.id === action.payload.id ? { ...car, ...action.payload } : car
        )
      };
    case 'DELETE_CAR':
      return {
        ...state,
        cars: state.cars.filter(car => car.id !== action.payload)
      };
    case 'ADD_REPAIR_HISTORY':
      return {
        ...state,
        repairHistory: [...state.repairHistory, { ...action.payload, id: Date.now() }]
      };
    case 'UPDATE_REPAIR_HISTORY':
      return {
        ...state,
        repairHistory: state.repairHistory.map(repair => 
          repair.id === action.payload.id ? { ...repair, ...action.payload } : repair
        )
      };
    case 'DELETE_REPAIR_HISTORY':
      return {
        ...state,
        repairHistory: state.repairHistory.filter(repair => repair.id !== action.payload)
      };
    case 'ADD_JOB_SHEET':
      return {
        ...state,
        jobSheets: [...state.jobSheets, { ...action.payload }].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      };
    case 'SET_JOB_SHEETS':
      return {
        ...state,
        jobSheets: [...action.payload].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      };
    case 'UPDATE_JOB_SHEET':
      return {
        ...state,
        jobSheets: state.jobSheets.map(job => 
          job.id === action.payload.id ? { ...job, ...action.payload } : job
        )
      };
    case 'DELETE_JOB_SHEET':
      return {
        ...state,
        jobSheets: state.jobSheets.filter(job => job.id !== action.payload)
      };
    case 'SET_MECHANICS':
      return {
        ...state,
        mechanics: action.payload
      };
    case 'ADD_MECHANIC':
      return {
        ...state,
        mechanics: [...state.mechanics, { ...action.payload }]
      };
    case 'UPDATE_MECHANIC':
      return {
        ...state,
        mechanics: state.mechanics.map(mechanic => 
          mechanic.id === action.payload.id ? { ...mechanic, ...action.payload } : mechanic
        )
      };
    case 'DELETE_MECHANIC':
      return {
        ...state,
        mechanics: state.mechanics.filter(mechanic => mechanic.id !== action.payload)
      };
    case 'SET_INVENTORY':
      return {
        ...state,
        inventory: action.payload
      };
    case 'ADD_INVENTORY_ITEM':
      return {
        ...state,
        inventory: [...state.inventory, { ...action.payload }]
      };
    case 'UPDATE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.map(item => 
          item.id === action.payload.id ? { ...item, ...action.payload } : item
        )
      };
    case 'DELETE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.filter(item => item.id !== action.payload)
      };
    case 'ADD_PAYMENT':
      return {
        ...state,
        payments: [...state.payments, { ...action.payload }]
      };
    case 'SET_PAYMENTS':
      return {
        ...state,
        payments: action.payload
      };
    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(payment => 
          payment.id === action.payload.id ? { ...payment, ...action.payload } : payment
        )
      };
    case 'DELETE_PAYMENT':
      return {
        ...state,
        payments: state.payments.filter(payment => payment.id !== action.payload)
      };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

