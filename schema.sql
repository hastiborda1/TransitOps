-- TransitOps PostgreSQL Database Schema & Seed Data Script
-- This file is provided for reference/manual execution if needed.
-- The application runs these automatically on start.

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL
);

-- 2. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  id VARCHAR(50) PRIMARY KEY,
  plate VARCHAR(50) UNIQUE NOT NULL,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  odometer INTEGER NOT NULL,
  fuel_type VARCHAR(20) NOT NULL,
  driver VARCHAR(100),
  max_load INTEGER NOT NULL DEFAULT 1000,
  acquisition_cost INTEGER NOT NULL DEFAULT 20000
);

-- 3. Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  license VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  rating NUMERIC(3, 2) NOT NULL,
  trips INTEGER NOT NULL,
  vehicle VARCHAR(50),
  license_category VARCHAR(50) NOT NULL DEFAULT 'Light Truck',
  license_expiry VARCHAR(50) NOT NULL DEFAULT '2027-12-31'
);

-- 4. Trips Table
CREATE TABLE IF NOT EXISTS trips (
  id VARCHAR(50) PRIMARY KEY,
  vehicle VARCHAR(50) NOT NULL,
  driver VARCHAR(100) NOT NULL,
  origin VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  distance INTEGER NOT NULL,
  started_at VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  cargo_weight INTEGER NOT NULL DEFAULT 500,
  planned_distance INTEGER NOT NULL DEFAULT 100
);

-- 5. Maintenance Table
CREATE TABLE IF NOT EXISTS maintenance (
  id VARCHAR(50) PRIMARY KEY,
  vehicle VARCHAR(50) NOT NULL,
  type VARCHAR(100) NOT NULL,
  due_date VARCHAR(50) NOT NULL,
  cost INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL,
  workshop VARCHAR(100) NOT NULL
);

-- 6. Fuel Logs Table
CREATE TABLE IF NOT EXISTS fuel_logs (
  id VARCHAR(50) PRIMARY KEY,
  vehicle VARCHAR(50) NOT NULL,
  driver VARCHAR(100) NOT NULL,
  date VARCHAR(50) NOT NULL,
  liters NUMERIC(10, 2) NOT NULL,
  cost NUMERIC(10, 2) NOT NULL,
  odometer INTEGER NOT NULL,
  station VARCHAR(100) NOT NULL
);

-- 7. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(50) PRIMARY KEY,
  date VARCHAR(50) NOT NULL,
  category VARCHAR(20) NOT NULL,
  vehicle VARCHAR(50),
  description VARCHAR(255) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL
);

-- Seed Default users
INSERT INTO users (id, email, password, name, role) VALUES 
('U-001', 'manager@transitops.com', 'demo1234', 'Manager User', 'manager'),
('U-002', 'driver@transitops.com', 'demo1234', 'Driver User', 'driver'),
('U-003', 'safety@transitops.com', 'demo1234', 'Safety Officer', 'safety'),
('U-004', 'finance@transitops.com', 'demo1234', 'Financial Analyst', 'finance')
ON CONFLICT DO NOTHING;
