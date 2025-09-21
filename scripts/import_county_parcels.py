#!/usr/bin/env python3
"""
Generic county property import script - works with any county GeoJSON file
Usage: python import_county_parcels.py <county_name> <geojson_file>
Example: python import_county_parcels.py burleson data/burleson_landparcels.geojson
"""

import json
import os
import sys
from supabase import create_client, Client

# You'll need to set these environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Error: Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables")
    print("You can find these in your Supabase project settings > API")
    sys.exit(1)

def clear_county_data(county_name):
    """Clear existing county properties data"""
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    try:
        print(f"🗑️ Clearing existing {county_name.title()} County properties data...")
        result = supabase.from_('properties').delete().eq('county', county_name.lower()).execute()
        print(f"✅ Cleared existing {county_name.title()} County data")
        return True
    except Exception as e:
        print(f"❌ Error clearing {county_name} data: {e}")
        return False

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

def import_county_properties_chunked(county_name, geojson_file):
    """Import county properties from GeoJSON file in chunks"""
    
    if not os.path.exists(geojson_file):
        print(f"❌ Error: {geojson_file} not found")
        return False
    
    print(f"📂 Loading {geojson_file}...")
    
    with open(geojson_file, 'r') as f:
        geojson_data = json.load(f)
    
    features = geojson_data.get('features', [])
    total_features = len(features)
    
    print(f"📊 Found {total_features} {county_name.title()} County properties to import")
    
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
    
    # Clear existing county data first
    if not clear_county_data(county_name):
        return False
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    # Process in chunks of 100
    chunk_size = 100
    successful_imports = 0
    
    for i in range(0, total_features, chunk_size):
        chunk = features[i:i + chunk_size]
        chunk_num = (i // chunk_size) + 1
        total_chunks = (total_features + chunk_size - 1) // chunk_size
        
        print(f"📦 Processing chunk {chunk_num}/{total_chunks} ({len(chunk)} properties)...")
        
        # Prepare batch data
        batch_data = []
        
        for idx, feature in enumerate(chunk):
            try:
                props = feature.get('properties', {})
                geometry = feature.get('geometry', {})
                
                # Generate a unique feature index
                feature_index = i + idx + 1
                county_prefix = county_name[:3].upper()
                
                # Map fields using detected mapping or generate synthetic data
                property_data = {
                    'county': county_name.lower(),
                    'prop_id': (
                        str(props.get(field_mapping.get('prop_id', ''), '')) or 
                        f'{county_prefix}-{feature_index:06d}'
                    ),
                    'owner_name': (
                        props.get(field_mapping.get('owner_name', ''), '') or 
                        f'Property Owner {feature_index}' if not has_properties else ''
                    ),
                    'situs_addr': props.get(field_mapping.get('situs_addr', ''), ''),
                    'mail_addr': props.get(field_mapping.get('mail_addr', ''), ''),
                    'land_value': props.get(field_mapping.get('land_value', ''), 0) or 0,
                    'mkt_value': props.get(field_mapping.get('mkt_value', ''), 0) or 0,
                    'gis_area': props.get(field_mapping.get('gis_area', ''), 0) or 0,
                    'geometry': json.dumps(geometry)
                }
                
                # Clean up string fields
                for field in ['owner_name', 'situs_addr', 'mail_addr']:
                    if isinstance(property_data[field], str):
                        property_data[field] = property_data[field].replace("'", "''")  # Escape quotes
                
                batch_data.append(property_data)
                
            except Exception as e:
                print(f"⚠️ Error processing feature {i + idx + 1}: {e}")
                continue
        
        # Insert batch
        try:
            result = supabase.from_('properties').insert(batch_data).execute()
            successful_imports += len(batch_data)
            print(f"✅ Chunk {chunk_num} imported successfully ({len(batch_data)} properties)")
            
        except Exception as e:
            print(f"❌ Error importing chunk {chunk_num}: {e}")
            # Continue with next chunk
            continue
    
    print(f"\n🎉 Import completed!")
    print(f"📊 Successfully imported {successful_imports}/{total_features} {county_name.title()} County properties")
    
    if successful_imports < total_features:
        print(f"⚠️ {total_features - successful_imports} properties failed to import")
    
    return successful_imports > 0

def main():
    if len(sys.argv) != 3:
        print("Usage: python import_county_parcels.py <county_name> <geojson_file>")
        print("Example: python import_county_parcels.py burleson data/burleson_landparcels.geojson")
        sys.exit(1)
    
    county_name = sys.argv[1]
    geojson_file = sys.argv[2]
    
    print("🚀 Starting county property import...")
    print(f"📍 County: {county_name.title()}")
    print(f"📂 Source: {geojson_file}")
    print("🗄️ Target: Supabase properties table")
    print("-" * 70)
    
    success = import_county_properties_chunked(county_name, geojson_file)
    
    if success:
        print(f"\n✅ {county_name.title()} County import completed successfully!")
        print("\n📋 Next steps:")
        print("1. Check the properties table in your Supabase dashboard")
        print(f"2. Verify the map shows {county_name.title()} County properties")
        print("3. Test property selection and skip tracing")
        if not os.path.exists(geojson_file) or not json.load(open(geojson_file))['features'][0].get('properties'):
            print("4. Note: Properties may have synthetic data due to empty source properties")
    else:
        print(f"\n❌ {county_name.title()} County import failed!")
        print("Please check the error messages above and try again.")
        sys.exit(1)

if __name__ == "__main__":
    main()

