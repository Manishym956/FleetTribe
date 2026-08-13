## Current HLD
flowchart TB

    %% =========================
    %% DATA SOURCE
    %% =========================
    subgraph DATA["1. Data Source & Validation"]
        XLSX["VEXAR Fleet Dataset<br/>Excel Workbook"]
        PARSE["Pandas + openpyxl<br/>Workbook Parser"]
        VALIDATE["Data Validation<br/>Schema • Nulls • Keys • Joins"]
        
        XLSX --> PARSE --> VALIDATE
    end

    %% =========================
    %% ANALYTICAL PIPELINE
    %% =========================
    subgraph ANALYTICS["2. Analytical Engine — Python"]
        
        FEATURES["Feature Engineering"]

        FEATURES --> DRIVER["Driver Scoring"]
        FEATURES --> VEHICLE["Vehicle Scoring"]

        DRIVER --> SENS["Sensitivity Analysis"]
        VEHICLE --> OUTPUT["Output Validation"]

        SENS --> OUTPUT

        FEATURES --> OUTPUT
    end

    VALIDATE --> FEATURES

    %% =========================
    %% FEATURE ENGINEERING
    %% =========================
    subgraph FE["Feature Engineering"]
        ACC["Acceleration Magnitude<br/>√(x²+y²+z²)"]
        DACC["Dynamic Acceleration<br/>|magnitude − 1|"]
        GYRO["Gyroscope Magnitude<br/>√(x²+y²+z²)"]
        SPEED["Speed Statistics"]
        EVENTS["Normalized Event Rates"]
        VAR["Behavioural Variability"]
    end

    FEATURES --> ACC
    FEATURES --> DACC
    FEATURES --> GYRO
    FEATURES --> SPEED
    FEATURES --> EVENTS
    FEATURES --> VAR

    %% =========================
    %% SCORING
    %% =========================
    subgraph SCORE["Scoring & Explainability"]
        DS["Driver Risk Score<br/>0–100"]

        DW["35% Speed<br/>30% Acceleration<br/>25% Gyroscope<br/>10% Variability"]

        VS["Vehicle Health Score<br/>0–100"]

        VM["Sensor Signals<br/>Vibration + Gyroscope"]

        DS --> DW
        VS --> VM
    end

    DRIVER --> DS
    VEHICLE --> VS

    %% =========================
    %% OUTPUTS
    %% =========================
    subgraph OUTPUTS["3. Analytical Outputs"]
        JSON["analysis/outputs/<br/>JSON Artifacts"]

        DFS["driver_features.json"]
        VFS["vehicle_features.json"]
        FS["fleet_summary.json"]

        JSON --> DFS
        JSON --> VFS
        JSON --> FS
    end

    OUTPUT --> JSON

    %% =========================
    %% DATA BRIDGE
    %% =========================
    COPY["Build-Time Data Bridge<br/>copy_to_app.js"]

    JSON --> COPY

    %% =========================
    %% WEB APPLICATION
    %% =========================
    subgraph APP["4. FleetTribe Web Application"]
        
        NEXT["Next.js<br/>App Router"]

        LANDING["Landing Page"]

        DASH["Fleet Overview"]
        DRIVERS["Driver Intelligence"]
        DRIVER_DETAIL["Driver Detail"]
        VEHICLES["Vehicle Health"]
        VEHICLE_DETAIL["Vehicle Detail"]
        METHODOLOGY["Methodology"]

        NEXT --> LANDING
        NEXT --> DASH
        NEXT --> DRIVERS
        NEXT --> DRIVER_DETAIL
        NEXT --> VEHICLES
        NEXT --> VEHICLE_DETAIL
        NEXT --> METHODOLOGY
    end

    COPY --> NEXT

    %% =========================
    %% AUTH
    %% =========================
    subgraph AUTH["5. Authentication"]
        GOOGLE["Google OAuth"]
        SUPA["Supabase Auth"]
        MW["Next.js Middleware"]
    end

    GOOGLE --> SUPA
    SUPA --> MW
    MW --> APP

    %% =========================
    %% DEPLOYMENT
    %% =========================
    VERCEL["Vercel"]

    APP --> VERCEL

    %% =========================
    %% STYLING
    %% =========================
    subgraph UI["UI / Interaction Layer"]
        TW["Tailwind CSS"]
        SHAD["shadcn/ui"]
        RECHARTS["Recharts"]
        GSAP["GSAP + ScrollTrigger"]
    end

    TW --> APP
    SHAD --> APP
    RECHARTS --> APP
    GSAP --> LANDING

## Simpler Architecture
flowchart LR

    A["Fleet Dataset<br/>Excel Workbook"]

    B["Data Ingestion<br/>& Validation"]

    C["Python Analytical<br/>Pipeline"]

    D["Feature Engineering"]

    E1["Driver Risk<br/>Scoring"]
    E2["Vehicle Health<br/>Scoring"]

    F["Analytical Outputs<br/>JSON"]

    G["Next.js<br/>FleetTribe Application"]

    H["Supabase<br/>Authentication"]

    I["Vercel<br/>Deployment"]

    A --> B
    B --> C
    C --> D

    D --> E1
    D --> E2

    E1 --> F
    E2 --> F

    F --> G
    H --> G
    G --> I


## Future Architecture
flowchart TB

    USER["Fleet Manager"]

    WEB["FleetTribe Web App<br/>Next.js"]

    AUTH["Authentication<br/>Supabase / OAuth"]

    UPLOAD["Upload API"]

    STORAGE["Cloud Object Storage<br/>S3 / GCS / Azure Blob"]

    EVENT["Event Bus / Queue<br/>SQS / Pub/Sub / Event Grid"]

    WORKER["Async Processing Workers"]

    PARSER["File Parser<br/>CSV • XLSX • JSON • Parquet"]

    SCHEMA["Schema Detection<br/>& Canonical Mapping"]

    EDA["Automated EDA<br/>& Data Quality"]

    FEATURES["Feature Engineering"]

    ROUTER["ML Model Router"]

    MODEL["Model Registry<br/>MLflow / equivalent"]

    INFERENCE["Inference /<br/>Retraining"]

    DB["Analytics Database<br/>PostgreSQL"]

    RESULTS["Predictions + Scores<br/>+ Explanations"]

    DASH["FleetTribe Dashboards"]

    MONITOR["Data / Model<br/>Monitoring"]

    USER --> WEB
    WEB --> AUTH
    WEB --> UPLOAD

    UPLOAD --> STORAGE
    STORAGE --> EVENT
    EVENT --> WORKER

    WORKER --> PARSER
    PARSER --> SCHEMA
    SCHEMA --> EDA
    EDA --> FEATURES
    FEATURES --> ROUTER

    ROUTER --> MODEL
    MODEL --> INFERENCE

    INFERENCE --> RESULTS
    RESULTS --> DB

    DB --> DASH
    DASH --> WEB

    INFERENCE --> MONITOR
    EDA --> MONITOR
    MONITOR --> MODEL

## Overall LLD 
flowchart TB

    subgraph SOURCE["Data Source"]
        XLSX["VEXAR_Fleet_Dataset_CANDIDATE_VERSION.xlsx"]
    end

    subgraph PYTHON["Python Analytics Layer"]
        PIPE["pipeline.py"]

        VAL["validation.py"]
        FEAT["features.py"]
        DS["driver_scoring.py"]
        VS["vehicle_scoring.py"]
        TEST["test_outputs.py"]

        OUT["analysis/outputs/"]

        PIPE --> VAL
        PIPE --> FEAT
        FEAT --> DS
        FEAT --> VS
        DS --> OUT
        VS --> OUT
        OUT --> TEST
    end

    XLSX --> PIPE

    subgraph BRIDGE["Build Data Bridge"]
        COPY["copy_to_app.js"]
        APPDATA["app/lib/data/"]
    end

    OUT --> COPY --> APPDATA

    subgraph NEXT["Next.js Application"]
        ROOT["app/layout.tsx"]

        LAND["app/page.tsx"]
        AUTH["app/auth/page.tsx"]
        CALLBACK["app/auth/callback/"]

        SHELL["Application Shell"]

        OVERVIEW["app/app/page.tsx"]
        DRIVERS["app/app/drivers/page.tsx"]
        DRIVER["app/app/drivers/[driverId]/page.tsx"]
        VEHICLES["app/app/vehicles/page.tsx"]
        VEHICLE["app/app/vehicles/[vehicleId]/page.tsx"]
        METHOD["app/app/methodology/page.tsx"]

        ROOT --> LAND
        ROOT --> AUTH
        ROOT --> SHELL

        SHELL --> OVERVIEW
        SHELL --> DRIVERS
        SHELL --> DRIVER
        SHELL --> VEHICLES
        SHELL --> VEHICLE
        SHELL --> METHOD
    end

    APPDATA --> OVERVIEW
    APPDATA --> DRIVERS
    APPDATA --> DRIVER
    APPDATA --> VEHICLES
    APPDATA --> VEHICLE
    APPDATA --> METHOD

    subgraph SERVICES["Application Services"]
        SUPABASE["Supabase Auth"]
        MIDDLEWARE["middleware.ts"]
        CLIENT["Supabase Browser Client"]
        SERVER["Supabase Server Client"]
    end

    AUTH --> CLIENT
    CALLBACK --> SERVER
    MIDDLEWARE --> SERVER
    MIDDLEWARE --> SHELL

    subgraph UI["UI Components"]
        NAV["Navbar"]
        SIDEBAR["App Sidebar"]
        HERO["Hero"]
        SNAP["Fleet Snapshot"]
        STORY["Telemetry Story"]
        DRIVER_UI["Driver Intelligence"]
        VEHICLE_UI["Vehicle Health"]
        CHARTS["Recharts"]
        ANIM["GSAP / ScrollTrigger"]
    end

    LAND --> NAV
    LAND --> HERO
    LAND --> SNAP
    LAND --> STORY
    LAND --> DRIVER_UI
    LAND --> VEHICLE_UI

    SHELL --> NAV
    SHELL --> SIDEBAR

    STORY --> ANIM
    OVERVIEW --> CHARTS
    DRIVERS --> CHARTS
    VEHICLES --> CHARTS

## Python Pipeline LLD
flowchart TD

    START(["pipeline.py"])

    LOAD["load_workbook()"]

    SHEETS["Load Sheets"]

    DRIVERS["Drivers"]
    VEHICLES["Vehicles"]
    TRIPS["Trips"]
    TELEMETRY["Telemetry"]

    VALIDATE["validate_dataset()"]

    SCHEMA["Schema Validation"]
    NULLS["Null / Missing Check"]
    DUP["Duplicate Check"]
    KEYS["Foreign-Key Integrity"]
    ORPHANS["Orphan Telemetry Check"]

    FEATURES["generate_features()"]

    ACC["Acceleration Magnitude"]
    DACC["Dynamic Acceleration"]
    GYRO["Gyroscope Magnitude"]
    SPEED["Speed Features"]
    EVENTS["Event Rates"]
    VAR["Behavioural Variability"]

    DRIVER["calculate_driver_scores()"]

    SPEED_R["Speed Risk"]
    ACC_R["Acceleration Risk"]
    GYRO_R["Gyroscope Risk"]
    VAR_R["Variability Risk"]

    ROBUST["Robust Z-Score"]
    NORMALIZE["0–100 Normalization"]
    WEIGHT["Weighted Risk Score"]

    VEHICLE["calculate_vehicle_scores()"]

    VIB["Vibration Anomaly"]
    GYROV["Gyroscope Anomaly"]
    SENSOR["Sensor Abnormality"]
    HEALTH["100 − Abnormality"]

    SENS["sensitivity_analysis()"]

    SERIALIZE["serialize_outputs()"]

    DRIVER_JSON["driver_features.json"]
    VEHICLE_JSON["vehicle_features.json"]
    TRIP_JSON["trip_features.json"]
    FLEET_JSON["fleet_summary.json"]
    METHOD_JSON["methodology.json"]

    TEST["test_outputs.py"]

    START --> LOAD --> SHEETS

    SHEETS --> DRIVERS
    SHEETS --> VEHICLES
    SHEETS --> TRIPS
    SHEETS --> TELEMETRY

    DRIVERS --> VALIDATE
    VEHICLES --> VALIDATE
    TRIPS --> VALIDATE
    TELEMETRY --> VALIDATE

    VALIDATE --> SCHEMA
    VALIDATE --> NULLS
    VALIDATE --> DUP
    VALIDATE --> KEYS
    VALIDATE --> ORPHANS

    VALIDATE --> FEATURES

    FEATURES --> ACC
    FEATURES --> DACC
    FEATURES --> GYRO
    FEATURES --> SPEED
    FEATURES --> EVENTS
    FEATURES --> VAR

    FEATURES --> DRIVER

    DRIVER --> SPEED_R
    DRIVER --> ACC_R
    DRIVER --> GYRO_R
    DRIVER --> VAR_R

    SPEED_R --> ROBUST
    ACC_R --> ROBUST
    GYRO_R --> ROBUST
    VAR_R --> ROBUST

    ROBUST --> NORMALIZE --> WEIGHT

    FEATURES --> VEHICLE

    VEHICLE --> VIB
    VEHICLE --> GYROV

    VIB --> SENSOR
    GYROV --> SENSOR

    SENSOR --> HEALTH

    WEIGHT --> SENS
    WEIGHT --> SERIALIZE
    HEALTH --> SERIALIZE

    SERIALIZE --> DRIVER_JSON
    SERIALIZE --> VEHICLE_JSON
    SERIALIZE --> TRIP_JSON
    SERIALIZE --> FLEET_JSON
    SERIALIZE --> METHOD_JSON

    DRIVER_JSON --> TEST
    VEHICLE_JSON --> TEST
    TRIP_JSON --> TEST
    FLEET_JSON --> TEST
    METHOD_JSON --> TEST

## Driver Scoring LLD
flowchart LR

    TELEMETRY["Telemetry"]

    SPEED["Speed Features"]
    ACC["Acceleration Events"]
    GYRO["Gyroscope Events"]
    VAR["Behavioural Variability"]

    TELEMETRY --> SPEED
    TELEMETRY --> ACC
    TELEMETRY --> GYRO
    TELEMETRY --> VAR

    SPEED --> Z1["Robust Z-Score"]
    ACC --> Z2["Robust Z-Score"]
    GYRO --> Z3["Robust Z-Score"]
    VAR --> Z4["Robust Z-Score"]

    Z1 --> N1["0–100 Speed Risk"]
    Z2 --> N2["0–100 Acceleration Risk"]
    Z3 --> N3["0–100 Gyroscope Risk"]
    Z4 --> N4["0–100 Variability Risk"]

    N1 --> W1["× 0.35"]
    N2 --> W2["× 0.30"]
    N3 --> W3["× 0.25"]
    N4 --> W4["× 0.10"]

    W1 --> SUM["Weighted Sum"]
    W2 --> SUM
    W3 --> SUM
    W4 --> SUM

    SUM --> SCORE["Driver Risk Score<br/>0–100"]

    SCORE --> CATEGORY{"Risk Category"}

    CATEGORY --> LOW["Low"]
    CATEGORY --> MOD["Moderate"]
    CATEGORY --> HIGH["High"]

## Vehicle Health LLD 
flowchart LR

    TELEMETRY["Telemetry"]

    ACC["Acceleration<br/>Magnitude"]
    GYRO["Gyroscope<br/>Magnitude"]

    TELEMETRY --> ACC
    TELEMETRY --> GYRO

    ACC --> VIB["Vibration Variance"]
    GYRO --> ROT["Gyroscope Variance"]

    VIB --> ZV["Fleet-relative<br/>Anomaly"]
    ROT --> ZR["Fleet-relative<br/>Anomaly"]

    ZV --> ABN["Sensor Abnormality"]
    ZR --> ABN

    ABN --> HEALTH["Health Score<br/>100 − Abnormality"]

    HEALTH --> STATUS{"Status"}

    STATUS --> H["Healthy"]
    STATUS --> M["Monitor"]
    STATUS --> MA["Maintenance Attention"]

    META["Vehicle Context<br/>Age • Odometer • Service"] -.-> UI["Dashboard Context"]

    HEALTH --> UI

## Nesxt.js LLD
flowchart TD

    BROWSER["Browser"]

    ROOT["Root Layout"]

    LANDING["Landing Page"]
    AUTH["Auth Page"]
    CALLBACK["OAuth Callback"]

    MIDDLEWARE["Route Middleware"]

    APP["Protected App Layout"]

    OVERVIEW["Fleet Overview"]
    DRIVER_LIST["Driver Dashboard"]
    DRIVER_DETAIL["Driver Detail"]
    VEHICLE_LIST["Vehicle Dashboard"]
    VEHICLE_DETAIL["Vehicle Detail"]
    METHODOLOGY["Methodology"]

    DATA["Static Analytical JSON"]

    BROWSER --> ROOT

    ROOT --> LANDING
    ROOT --> AUTH
    ROOT --> CALLBACK

    BROWSER --> MIDDLEWARE

    MIDDLEWARE -->|Authenticated| APP
    MIDDLEWARE -->|Unauthenticated| AUTH

    APP --> OVERVIEW
    APP --> DRIVER_LIST
    APP --> DRIVER_DETAIL
    APP --> VEHICLE_LIST
    APP --> VEHICLE_DETAIL
    APP --> METHODOLOGY

    DATA --> OVERVIEW
    DATA --> DRIVER_LIST
    DATA --> DRIVER_DETAIL
    DATA --> VEHICLE_LIST
    DATA --> VEHICLE_DETAIL
    DATA --> METHODOLOGY

## Authentication LLD
sequenceDiagram

    actor User
    participant Browser
    participant Auth as /auth
    participant Google as Google OAuth
    participant Supabase as Supabase Auth
    participant Middleware as Next.js Middleware
    participant App as /app

    User->>Browser: Open /app
    Browser->>Middleware: Request protected route

    alt No valid session
        Middleware-->>Browser: Redirect /auth
        Browser->>Auth: Open login
        User->>Auth: Click "Continue with Google"
        Auth->>Supabase: Start OAuth
        Supabase->>Google: OAuth authorization
        Google-->>Supabase: Authorization code
        Supabase-->>Auth: Callback
        Auth->>Supabase: Exchange code for session
        Supabase-->>Browser: Session cookie
    end

    Browser->>Middleware: Request /app
    Middleware->>Supabase: Validate session
    Supabase-->>Middleware: Valid session
    Middleware->>App: Allow request
    App-->>Browser: Dashboard

## Driver Detail Request LLD 
sequenceDiagram

    actor User
    participant UI as Driver Dashboard
    participant Route as /app/drivers/[driverId]
    participant Data as JSON Data
    participant Components as UI Components

    User->>UI: Select Driver D19
    UI->>Route: Navigate /drivers/D19

    Route->>Data: Load driver_features.json
    Data-->>Route: Driver records

    Route->>Route: Find Driver_ID = D19
    Route->>Route: Calculate/display component breakdown
    Route->>Route: Resolve driver metadata

    Route->>Components: Render profile
    Components->>Components: Risk score
    Components->>Components: Fleet percentile
    Components->>Components: Component scores
    Components->>Components: Trip/telemetry charts

    Components-->>User: Driver Intelligence Profile

## Build/Deploy LLD 
flowchart LR

    DATA["Source Excel"]

    PY["Python Pipeline"]

    OUTPUT["analysis/outputs/*.json"]

    COPY["copy_to_app.js"]

    APPDATA["app/lib/data/*.json"]

    BUILD["npm run build"]

    NEXT["Next.js Build"]

    VERCEL["Vercel"]

    PROD["FleetTribe Production"]

    DATA --> PY
    PY --> OUTPUT
    OUTPUT --> COPY
    COPY --> APPDATA
    APPDATA --> BUILD
    BUILD --> NEXT
    NEXT --> VERCEL
    VERCEL --> PROD
    