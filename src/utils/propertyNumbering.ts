import { supabase } from '@/lib/supabase';

export function getCountyPrefix(countyName: string): string {
  const name = countyName.toLowerCase().trim();
  
  const countyPrefixes: Record<string, string> = {
    'madison': 'MAD',
    'burnet': 'BUR', 
    'burleson': 'BRL',
  };
  
  if (countyPrefixes[name]) {
    return countyPrefixes[name];
  }
  
  return name.substring(0, 3).toUpperCase();
}

// Handles gap filling - reuses deleted numbers before assigning new ones
export async function getNextUserNumber(countyId: number): Promise<string> {
  try {
    const { data: county, error: countyError } = await supabase
      .from('counties')
      .select('name')
      .eq('id', countyId)
      .single();
    
    if (countyError || !county) {
      throw new Error(`County not found for ID: ${countyId}`);
    }
    
    const prefix = getCountyPrefix(county.name);
    
    const { data: existingNumbers, error } = await supabase
      .from('saved_properties')
      .select('user_number')
      .not('user_number', 'is', null)
      .like('user_number', `${prefix}-%`)
      .order('user_number', { ascending: true });
    
    if (error) {
      throw new Error(`Failed to fetch existing numbers: ${error.message}`);
    }
    
    const numbers = existingNumbers
      .map(item => {
        const match = item.user_number?.match(new RegExp(`^${prefix}-(\\d{6})$`));
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((num): num is number => num !== null)
      .sort((a, b) => a - b);
    
    let nextNumber = 1;
    for (const num of numbers) {
      if (num === nextNumber) {
        nextNumber++;
      } else if (num > nextNumber) {
        break;
      }
    }
    
    const formattedNumber = nextNumber.toString().padStart(6, '0');
    return `${prefix}-${formattedNumber}`;
    
  } catch (error) {
    console.error('Error generating next user number:', error);
    throw error;
  }
}

// Considers both saved and currently selected properties for sequential numbering
export async function generateTempUserNumber(countyId: number, existingTempNumbers: string[] = []): Promise<string> {
  try {
    const { data: county, error: countyError } = await supabase
      .from('counties')
      .select('name')
      .eq('id', countyId)
      .single();
    
    if (countyError || !county) {
      throw new Error(`County not found for ID: ${countyId}`);
    }
    
    const prefix = getCountyPrefix(county.name);
    
    const { data: existingNumbers, error } = await supabase
      .from('saved_properties')
      .select('user_number')
      .not('user_number', 'is', null)
      .like('user_number', `${prefix}-%`)
      .order('user_number', { ascending: true });
    
    if (error) {
      throw new Error(`Failed to fetch existing numbers: ${error.message}`);
    }
    
    const allNumbers = [
      ...existingNumbers.map(item => item.user_number!),
      ...existingTempNumbers.filter(num => num.startsWith(`${prefix}-`))
    ];
    
    const numbers = allNumbers
      .map(userNumber => {
        const match = userNumber.match(new RegExp(`^${prefix}-(\\d{6})$`));
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((num): num is number => num !== null)
      .sort((a, b) => a - b);
    
    let nextNumber = 1;
    for (const num of numbers) {
      if (num === nextNumber) {
        nextNumber++;
      } else if (num > nextNumber) {
        break;
      }
    }
    
    const formattedNumber = nextNumber.toString().padStart(6, '0');
    return `${prefix}-${formattedNumber}`;
    
  } catch (error) {
    console.error('Error generating temp user number:', error);
    throw error;
  }
}

export function isValidUserNumber(userNumber: string): boolean {
  return /^[A-Z]{3}-\d{6}$/.test(userNumber);
}

export function parseUserNumber(userNumber: string): { prefix: string; number: number } | null {
  const match = userNumber.match(/^([A-Z]{3})-(\d{6})$/);
  if (!match) return null;
  
  return {
    prefix: match[1],
    number: parseInt(match[2], 10)
  };
}
