#!/usr/bin/env python3
"""
Generate SQL INSERT statements from GeoJSON file
Run this locally to create import.sql file
"""

import json
import sys

def clean_string(value):
    """Clean string values for SQL insertion"""
    if value is None or value == " ":
        return None
    return value.strip() if isinstance(value, str) else value

def parse_address(situs_addr, mail_addr):
    """Parse address components, prioritizing mail_addr if more complete"""
    mail_parts = mail_addr.split(',') if mail_addr and mail_addr.strip() else []
    situs_parts = situs_addr.split(',') if situs_addr and situs_addr.strip() else []
    
    # Use mail address if it has more components
    if len(mail_parts) >= 3:
        return mail_addr.strip()
    elif len(situs_parts) >= 2:
        return situs_addr.strip()
    else:
        return mail_addr.strip() if mail_addr else situs_addr

def generate_sql():
    try:
        # Read the GeoJSON file
        with open('data/burnet_parcels.geojson', 'r') as f:
            data = json.load(f)
        
        print("-- Generated SQL INSERT statements for properties")
        print("-- Run this in Supabase SQL Editor")
        print("")
        
        count = 0
        batch_size = 100
        
        for i, feature in enumerate(data['features']):
            props = feature['properties']
            geom = json.dumps(feature['geometry'])
            
            # Extract and clean values
            prop_id = clean_string(props.get('Prop_ID'))
            owner_name = clean_string(props.get('OWNER_NAME'))
            situs_addr = parse_address(
                clean_string(props.get('SITUS_ADDR')), 
                clean_string(props.get('MAIL_ADDR'))
            )
            mail_addr = clean_string(props.get('MAIL_ADDR'))
            land_value = props.get('LAND_VALUE') if props.get('LAND_VALUE') != 0 else None
            mkt_value = props.get('MKT_VALUE') if props.get('MKT_VALUE') != 0 else None
            gis_area = props.get('GIS_AREA')
            county = 'burnet'  # All records are Burnet county
            
            # Start new batch
            if count % batch_size == 0:
                if count > 0:
                    print(";")
                    print("")
                print(f"-- Batch {count // batch_size + 1}")
                print("INSERT INTO \"public\".\"properties\" (")
                print("    \"county\", \"prop_id\", \"owner_name\", \"situs_addr\", ")
                print("    \"mail_addr\", \"land_value\", \"mkt_value\", \"gis_area\", \"geometry\"")
                print(") VALUES")
            else:
                print(",")
            
            # Format values for SQL
            prop_id_sql = f"'{prop_id}'" if prop_id else 'NULL'
            owner_name_sql = f"'{owner_name.replace(chr(39), chr(39)+chr(39))}'" if owner_name else 'NULL'
            situs_addr_sql = f"'{situs_addr.replace(chr(39), chr(39)+chr(39))}'" if situs_addr else 'NULL'
            mail_addr_sql = f"'{mail_addr.replace(chr(39), chr(39)+chr(39))}'" if mail_addr else 'NULL'
            land_value_sql = str(land_value) if land_value else 'NULL'
            mkt_value_sql = str(mkt_value) if mkt_value else 'NULL'
            gis_area_sql = str(gis_area) if gis_area else 'NULL'
            geom_sql = f"'{geom.replace(chr(39), chr(39)+chr(39))}'"
            
            print(f"    ('{county}', {prop_id_sql}, {owner_name_sql}, {situs_addr_sql}, {mail_addr_sql}, {land_value_sql}, {mkt_value_sql}, {gis_area_sql}, {geom_sql})", end="")
            
            count += 1
            
            # Full import - all records will be processed
        
        print(";")
        print("")
        print(f"-- Imported {count} properties")
        
    except FileNotFoundError:
        print("Error: Could not find data/burnet_parcels.geojson")
        print("Make sure you're running this from the project root directory")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    generate_sql()
