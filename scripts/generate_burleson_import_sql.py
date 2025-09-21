#!/usr/bin/env python3
"""
Generate SQL import file for Burleson County land parcels
"""

import json
import os
import sys

def generate_burleson_sql():
    """Generate SQL file for Burleson County properties"""
    
    # Load the GeoJSON file
    geojson_file = 'data/burleson_landparcels.geojson'
    
    if not os.path.exists(geojson_file):
        print(f"❌ Error: {geojson_file} not found")
        return False
    
    print(f"📂 Loading {geojson_file}...")
    
    with open(geojson_file, 'r') as f:
        geojson_data = json.load(f)
    
    features = geojson_data.get('features', [])
    total_features = len(features)
    
    print(f"📊 Found {total_features} Burleson County properties")
    
    if total_features == 0:
        print("❌ No features found in GeoJSON file")
        return False
    
    # Check the properties structure
    sample_feature = features[0] if features else None
    sample_props = sample_feature.get('properties', {}) if sample_feature else {}
    
    print(f"📋 Sample properties structure: {list(sample_props.keys())}")
    
    if not sample_props:
        print("⚠️ Properties are empty - will generate synthetic property data")
    
    # Generate SQL file
    sql_file = 'import_burleson.sql'
    
    print(f"📝 Generating {sql_file}...")
    
    with open(sql_file, 'w') as f:
        # Write header
        f.write("-- Burleson County Properties Import\n")
        f.write("-- Generated from data/burleson_landparcels.geojson\n")
        f.write(f"-- Total properties: {total_features}\n")
        f.write("-- Note: Original data has empty properties, synthetic data generated\n")
        f.write("-- \n\n")
        
        # Clear existing Burleson data
        f.write("-- Clear existing Burleson County data\n")
        f.write("DELETE FROM properties WHERE county = 'burleson';\n\n")
        
        # Start transaction
        f.write("BEGIN;\n\n")
        
        # Process each feature
        for i, feature in enumerate(features):
            try:
                props = feature.get('properties', {})
                geometry = feature.get('geometry', {})
                
                # Generate synthetic data since Burleson properties are empty
                feature_index = i + 1
                prop_id = f'BUR-{feature_index:06d}'
                owner_name = f'Property Owner {feature_index}'
                situs_addr = ''
                mail_addr = ''
                land_value = 0
                mkt_value = 0
                gis_area = 0
                
                # If properties exist, try to use them (fallback for future data)
                if props:
                    prop_id = str(props.get('Prop_ID', props.get('PROP_ID', props.get('prop_id', prop_id))))
                    owner_name = props.get('OWNER_NAME', props.get('owner_name', owner_name)).replace("'", "''")
                    situs_addr = props.get('SITUS_ADDR', props.get('situs_addr', situs_addr)).replace("'", "''")
                    mail_addr = props.get('MAIL_ADDR', props.get('mail_addr', mail_addr)).replace("'", "''")
                    land_value = props.get('LAND_VALUE', props.get('land_value', land_value)) or 0
                    mkt_value = props.get('MKT_VALUE', props.get('mkt_value', mkt_value)) or 0
                    gis_area = props.get('GIS_AREA', props.get('gis_area', gis_area)) or 0
                else:
                    # Escape quotes for synthetic data
                    owner_name = owner_name.replace("'", "''")
                
                geometry_json = json.dumps(geometry).replace("'", "''")
                
                # Write INSERT statement
                f.write(f"INSERT INTO properties (county, prop_id, owner_name, situs_addr, mail_addr, land_value, mkt_value, gis_area, geometry) VALUES\n")
                f.write(f"('burleson', '{prop_id}', '{owner_name}', '{situs_addr}', '{mail_addr}', {land_value}, {mkt_value}, {gis_area}, '{geometry_json}');\n\n")
                
                # Progress indicator
                if (i + 1) % 1000 == 0:
                    print(f"📝 Generated {i + 1}/{total_features} INSERT statements...")
                
            except Exception as e:
                print(f"⚠️ Error processing feature {i + 1}: {e}")
                continue
        
        # Commit transaction
        f.write("COMMIT;\n")
        
        # Add summary comment
        f.write(f"\n-- Import completed: {total_features} Burleson County properties\n")
        f.write("-- Note: Properties have synthetic IDs (BUR-000001, etc.) due to empty source data\n")
    
    print(f"✅ Generated {sql_file} successfully!")
    print(f"📊 Contains {total_features} INSERT statements for Burleson County properties")
    print("\n📋 Usage:")
    print(f"1. Run: psql 'your_connection_string' -f {sql_file}")
    print("2. Or copy/paste the SQL into your database client")
    print("3. Or run the SQL in your Supabase SQL Editor")
    
    return True

if __name__ == "__main__":
    print("🚀 Generating Burleson County SQL import file...")
    print("📍 County: Burleson")
    print("📂 Source: data/burleson_landparcels.geojson")
    print("📝 Output: import_burleson.sql")
    print("⚠️ Note: Burleson data has empty properties - will generate synthetic data")
    print("-" * 70)
    
    success = generate_burleson_sql()
    
    if success:
        print("\n✅ SQL generation completed successfully!")
    else:
        print("\n❌ SQL generation failed!")
        sys.exit(1)

