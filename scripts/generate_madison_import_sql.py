#!/usr/bin/env python3
"""
Generate SQL import file for Madison County land parcels
"""

import json
import os
import sys

def generate_madison_sql():
    """Generate SQL file for Madison County properties"""
    
    # Load the GeoJSON file
    geojson_file = 'data/madison_landparcels.geojson'
    
    if not os.path.exists(geojson_file):
        print(f"❌ Error: {geojson_file} not found")
        return False
    
    print(f"📂 Loading {geojson_file}...")
    
    with open(geojson_file, 'r') as f:
        geojson_data = json.load(f)
    
    features = geojson_data.get('features', [])
    total_features = len(features)
    
    print(f"📊 Found {total_features} Madison County properties")
    
    if total_features == 0:
        print("❌ No features found in GeoJSON file")
        return False
    
    # Generate SQL file
    sql_file = 'import_madison.sql'
    
    print(f"📝 Generating {sql_file}...")
    
    with open(sql_file, 'w') as f:
        # Write header
        f.write("-- Madison County Properties Import\n")
        f.write("-- Generated from data/madison_landparcels.geojson\n")
        f.write(f"-- Total properties: {total_features}\n")
        f.write("-- \n\n")
        
        # Clear existing Madison data
        f.write("-- Clear existing Madison County data\n")
        f.write("DELETE FROM properties WHERE county = 'madison';\n\n")
        
        # Start transaction
        f.write("BEGIN;\n\n")
        
        # Process each feature
        for i, feature in enumerate(features):
            try:
                props = feature.get('properties', {})
                geometry = feature.get('geometry', {})
                
                # Map Madison County fields to our database schema
                prop_id = str(props.get('Prop_ID', ''))
                owner_name = props.get('OWNER_NAME', '').replace("'", "''")  # Escape quotes
                situs_addr = props.get('SITUS_ADDR', '').replace("'", "''")
                mail_addr = props.get('MAIL_ADDR', '').replace("'", "''")
                land_value = props.get('LAND_VALUE') or 0
                mkt_value = props.get('MKT_VALUE') or 0
                gis_area = props.get('GIS_AREA') or 0
                geometry_json = json.dumps(geometry).replace("'", "''")
                
                # Write INSERT statement
                f.write(f"INSERT INTO properties (county, prop_id, owner_name, situs_addr, mail_addr, land_value, mkt_value, gis_area, geometry) VALUES\n")
                f.write(f"('madison', '{prop_id}', '{owner_name}', '{situs_addr}', '{mail_addr}', {land_value}, {mkt_value}, {gis_area}, '{geometry_json}');\n\n")
                
                # Progress indicator
                if (i + 1) % 1000 == 0:
                    print(f"📝 Generated {i + 1}/{total_features} INSERT statements...")
                
            except Exception as e:
                print(f"⚠️ Error processing feature {i + 1}: {e}")
                continue
        
        # Commit transaction
        f.write("COMMIT;\n")
        
        # Add summary comment
        f.write(f"\n-- Import completed: {total_features} Madison County properties\n")
    
    print(f"✅ Generated {sql_file} successfully!")
    print(f"📊 Contains {total_features} INSERT statements for Madison County properties")
    print("\n📋 Usage:")
    print(f"1. Run: psql 'your_connection_string' -f {sql_file}")
    print("2. Or copy/paste the SQL into your database client")
    
    return True

if __name__ == "__main__":
    print("🚀 Generating Madison County SQL import file...")
    print("📍 County: Madison")
    print("📂 Source: data/madison_landparcels.geojson")
    print("📝 Output: import_madison.sql")
    print("-" * 50)
    
    success = generate_madison_sql()
    
    if success:
        print("\n✅ SQL generation completed successfully!")
    else:
        print("\n❌ SQL generation failed!")
        sys.exit(1)
