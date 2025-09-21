#!/usr/bin/env python3
"""
Import Madison County land parcels in chunks to avoid SQL Editor limitations
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

def clear_madison_data():
    """Clear existing Madison County properties data"""
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    try:
        print("🗑️ Clearing existing Madison County properties data...")
        result = supabase.from_('properties').delete().eq('county', 'madison').execute()
        print(f"✅ Cleared existing Madison County data")
        return True
    except Exception as e:
        print(f"❌ Error clearing Madison data: {e}")
        return False

def import_madison_properties_chunked():
    """Import Madison County properties from GeoJSON file in chunks"""
    
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
    
    print(f"📊 Found {total_features} Madison County properties to import")
    
    if total_features == 0:
        print("❌ No features found in GeoJSON file")
        return False
    
    # Clear existing Madison data first
    if not clear_madison_data():
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
        
        for feature in chunk:
            try:
                props = feature.get('properties', {})
                geometry = feature.get('geometry', {})
                
                # Map Madison County fields to our database schema
                property_data = {
                    'county': 'madison',
                    'prop_id': str(props.get('Prop_ID', '')),
                    'owner_name': props.get('OWNER_NAME', ''),
                    'situs_addr': props.get('SITUS_ADDR', ''),
                    'mail_addr': props.get('MAIL_ADDR', ''),
                    'land_value': props.get('LAND_VALUE'),
                    'mkt_value': props.get('MKT_VALUE'),  
                    'gis_area': props.get('GIS_AREA'),
                    'geometry': json.dumps(geometry)
                }
                
                batch_data.append(property_data)
                
            except Exception as e:
                print(f"⚠️ Error processing feature: {e}")
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
    print(f"📊 Successfully imported {successful_imports}/{total_features} Madison County properties")
    
    if successful_imports < total_features:
        print(f"⚠️ {total_features - successful_imports} properties failed to import")
    
    return successful_imports > 0

if __name__ == "__main__":
    print("🚀 Starting Madison County property import...")
    print("📍 County: Madison")
    print("📂 Source: data/madison_landparcels.geojson")
    print("🗄️ Target: Supabase properties table")
    print("-" * 50)
    
    success = import_madison_properties_chunked()
    
    if success:
        print("\n✅ Madison County import completed successfully!")
        print("\n📋 Next steps:")
        print("1. Check the properties table in your Supabase dashboard")
        print("2. Verify the map shows Madison County properties")
        print("3. Test property selection and skip tracing")
    else:
        print("\n❌ Madison County import failed!")
        print("Please check the error messages above and try again.")
        sys.exit(1)
