#!/usr/bin/env python3
"""
Generic county property SQL import file generator - works with any county GeoJSON file
Usage: python generate_county_import_sql.py <county_name> <geojson_file>
Example: python generate_county_import_sql.py burleson data/burleson_landparcels.geojson
"""

import json
import os
import sys

def detect_property_fields(sample_props):
    """Detect the field mapping based on sample properties"""
    field_mapping = {}
    
    # Common field variations
    prop_id_fields = ['Prop_ID', 'PROP_ID', 'prop_id', 'PROPERTY_ID', 'property_id', 'ID', 'id']
    owner_fields = ['OWNER_NAME', 'owner_name', 'Owner_Name', 'OWNER', 'owner']
    situs_fields = ['SITUS_ADDR', 'situs_addr', 'Situs_Addr', 'SITUS_ADDRESS', 'ADDRESS', 'address']
    mail_fields = ['MAIL_ADDR', 'mail_addr', 'Mail_Addr', 'MAIL_ADDRESS', 'MAILING_ADDRESS']
    land_value_fields = ['LAND_VALUE', 'land_value', 'Land_Value', 'LANDVALUE']
    mkt_value_fields = ['MKT_VALUE', 'mkt_value', 'Market_Value', 'MARKET_VALUE', 'MKTVALUE']
    area_fields = ['GIS_AREA', 'gis_area', 'Gis_Area', 'AREA', 'area', 'ACREAGE', 'acreage']
    
    # Find matching fields
    for field in prop_id_fields:
        if field in sample_props:
            field_mapping['prop_id'] = field
            break
    
    for field in owner_fields:
        if field in sample_props:
            field_mapping['owner_name'] = field
            break
    
    for field in situs_fields:
        if field in sample_props:
            field_mapping['situs_addr'] = field
            break
    
    for field in mail_fields:
        if field in sample_props:
            field_mapping['mail_addr'] = field
            break
    
    for field in land_value_fields:
        if field in sample_props:
            field_mapping['land_value'] = field
            break
    
    for field in mkt_value_fields:
        if field in sample_props:
            field_mapping['mkt_value'] = field
            break
    
    for field in area_fields:
        if field in sample_props:
            field_mapping['gis_area'] = field
            break
    
    return field_mapping

def generate_county_sql(county_name, geojson_file):
    """Generate SQL file for county properties"""
    
    if not os.path.exists(geojson_file):
        print(f"❌ Error: {geojson_file} not found")
        return False
    
    print(f"📂 Loading {geojson_file}...")
    
    with open(geojson_file, 'r') as f:
        geojson_data = json.load(f)
    
    features = geojson_data.get('features', [])
    total_features = len(features)
    
    print(f"📊 Found {total_features} {county_name.title()} County properties")
    
    if total_features == 0:
        print("❌ No features found in GeoJSON file")
        return False
    
    # Analyze the properties structure
    sample_feature = features[0] if features else None
    sample_props = sample_feature.get('properties', {}) if sample_feature else {}
    
    print(f"📋 Sample properties keys: {list(sample_props.keys())}")
    
    # Detect field mapping
    field_mapping = detect_property_fields(sample_props)
    print(f"🔍 Detected field mapping: {field_mapping}")
    
    has_properties = bool(sample_props)
    if not has_properties:
        print("⚠️ Properties are empty - will generate synthetic property data")
    
    # Generate SQL file
    sql_file = f'import_{county_name.lower()}.sql'
    
    print(f"📝 Generating {sql_file}...")
    
    with open(sql_file, 'w') as f:
        # Write header
        f.write(f"-- {county_name.title()} County Properties Import\n")
        f.write(f"-- Generated from {geojson_file}\n")
        f.write(f"-- Total properties: {total_features}\n")
        if not has_properties:
            f.write("-- Note: Original data has empty properties, synthetic data generated\n")
        f.write("-- \n\n")
        
        # Clear existing county data
        f.write(f"-- Clear existing {county_name.title()} County data\n")
        f.write(f"DELETE FROM properties WHERE county = '{county_name.lower()}';\n\n")
        
        # Start transaction
        f.write("BEGIN;\n\n")
        
        # Process each feature
        for i, feature in enumerate(features):
            try:
                props = feature.get('properties', {})
                geometry = feature.get('geometry', {})
                
                # Generate unique feature index
                feature_index = i + 1
                county_prefix = county_name[:3].upper()
                
                # Map fields using detected mapping or generate synthetic data
                prop_id = (
                    str(props.get(field_mapping.get('prop_id', ''), '')) or 
                    f'{county_prefix}-{feature_index:06d}'
                )
                owner_name = (
                    props.get(field_mapping.get('owner_name', ''), '') or 
                    f'Property Owner {feature_index}' if not has_properties else ''
                )
                situs_addr = props.get(field_mapping.get('situs_addr', ''), '')
                mail_addr = props.get(field_mapping.get('mail_addr', ''), '')
                land_value = props.get(field_mapping.get('land_value', ''), 0) or 0
                mkt_value = props.get(field_mapping.get('mkt_value', ''), 0) or 0
                gis_area = props.get(field_mapping.get('gis_area', ''), 0) or 0
                
                # Escape quotes for SQL
                prop_id = str(prop_id).replace("'", "''")
                owner_name = str(owner_name).replace("'", "''")
                situs_addr = str(situs_addr).replace("'", "''")
                mail_addr = str(mail_addr).replace("'", "''")
                geometry_json = json.dumps(geometry).replace("'", "''")
                
                # Write INSERT statement
                f.write(f"INSERT INTO properties (county, prop_id, owner_name, situs_addr, mail_addr, land_value, mkt_value, gis_area, geometry) VALUES\n")
                f.write(f"('{county_name.lower()}', '{prop_id}', '{owner_name}', '{situs_addr}', '{mail_addr}', {land_value}, {mkt_value}, {gis_area}, '{geometry_json}');\n\n")
                
                # Progress indicator
                if (i + 1) % 1000 == 0:
                    print(f"📝 Generated {i + 1}/{total_features} INSERT statements...")
                
            except Exception as e:
                print(f"⚠️ Error processing feature {i + 1}: {e}")
                continue
        
        # Commit transaction
        f.write("COMMIT;\n")
        
        # Add summary comment
        f.write(f"\n-- Import completed: {total_features} {county_name.title()} County properties\n")
        if not has_properties:
            f.write(f"-- Note: Properties have synthetic IDs ({county_prefix}-000001, etc.) due to empty source data\n")
    
    print(f"✅ Generated {sql_file} successfully!")
    print(f"📊 Contains {total_features} INSERT statements for {county_name.title()} County properties")
    print("\n📋 Usage:")
    print(f"1. Run: psql 'your_connection_string' -f {sql_file}")
    print("2. Or copy/paste the SQL into your database client")
    print("3. Or run the SQL in your Supabase SQL Editor")
    
    return True

def main():
    if len(sys.argv) != 3:
        print("Usage: python generate_county_import_sql.py <county_name> <geojson_file>")
        print("Example: python generate_county_import_sql.py burleson data/burleson_landparcels.geojson")
        sys.exit(1)
    
    county_name = sys.argv[1]
    geojson_file = sys.argv[2]
    
    print("🚀 Generating county property SQL import file...")
    print(f"📍 County: {county_name.title()}")
    print(f"📂 Source: {geojson_file}")
    print(f"📝 Output: import_{county_name.lower()}.sql")
    print("-" * 70)
    
    success = generate_county_sql(county_name, geojson_file)
    
    if success:
        print(f"\n✅ {county_name.title()} County SQL generation completed successfully!")
    else:
        print(f"\n❌ {county_name.title()} County SQL generation failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()

