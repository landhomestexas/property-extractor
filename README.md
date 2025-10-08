# Property Extractor & Skip Tracing Tool

A web application for property research and skip tracing in Texas counties. Visualize property boundaries on interactive maps, extract property data, and perform skip tracing to find contact information for property owners.

## Features

- **Interactive Map Interface** - View property boundaries with Leaflet maps
- **Multi-County Support** - Burnet, Madison, and Burleson counties
- **Property Details** - View owner information, addresses, and property values
- **Skip Tracing** - Integration with BatchData and TruePeopleSearch APIs
- **Data Export** - Export results to CSV format
- **Property Management** - Save and organize selected properties

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Maps**: Leaflet, VectorGrid
- **State Management**: Zustand
- **Database**: PostgreSQL with PostGIS, Supabase
- **APIs**: BatchData, Enformion/TruePeopleSearch

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   Create a `.env.local` file:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/database"
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   BATCHDATA_API_KEY=your_batchdata_api_key
   ENFORMION_API_KEY=your_enformion_api_key
   ```

3. **Start the database**

   ```bash
   docker-compose up -d
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## Project Structure

```
property-extractor/
├── src/
│   ├── app/                  # Next.js app routes
│   │   ├── api/             # API endpoints
│   │   └── skip-tracing/    # Skip tracing page
│   ├── components/          # React components
│   ├── hooks/              # Custom hooks
│   ├── stores/             # Zustand stores
│   └── utils/              # Utility functions
├── data/                   # GeoJSON property data
├── scripts/                # Data import scripts
├── sql/                    # SQL scripts
└── supabase/              # Database migrations
```

## Usage

### Property Selection

1. Select a county from the dropdown
2. Click "Show Boundaries" to load property data
3. Click properties to select them
4. View details in the property panel

### Skip Tracing

1. Navigate to the Skip Tracing page
2. Select properties for skip tracing
3. Choose a provider (BatchData or TruePeopleSearch)
4. Start the skip trace process
5. Export results to CSV

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

Proprietary software developed for LandHome Texas property research operations.
